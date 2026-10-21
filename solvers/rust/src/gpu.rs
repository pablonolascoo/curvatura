//! Cálculo en la GPU con wgpu: Metal (macOS), DirectX 12 o Vulkan (Windows), Vulkan (Linux).
//!
//! Precisión simple (f32): sirve para mapas y barridos de millones de puntos. Las cifras que se
//! publican se calculan en f64 en la CPU ([`crate::alcubierre`]). Si no hay GPU, [`Gpu::new`]
//! devuelve `None` y la app usa el camino paralelo en CPU.

use crate::alcubierre::Params;

const SHADER: &str = r#"
struct P { v: f32, r: f32, sigma: f32, half: f32, step: f32, n: u32, _a: u32, _b: u32 };
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read_write> theta: array<f32>;
@group(0) @binding(2) var<storage, read_write> rho: array<f32>;

fn sech2(u: f32) -> f32 { let e = exp(-2.0 * abs(u)); return 4.0 * e / ((1.0 + e) * (1.0 + e)); }
fn dshape(rs: f32) -> f32 {
  return p.sigma * (sech2(p.sigma * (rs + p.r)) - sech2(p.sigma * (rs - p.r))) / (2.0 * tanh(p.sigma * p.r));
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  if (id.x >= p.n || id.y >= p.n) { return; }
  let x = -p.half + p.step * f32(id.x);
  let y = -p.half + p.step * f32(id.y);
  let r2 = x * x + y * y;
  let k = id.y * p.n + id.x;
  if (r2 == 0.0) { theta[k] = 0.0; rho[k] = 0.0; return; }
  let rs = sqrt(r2);
  let fp = dshape(rs);
  theta[k] = p.v * (x / rs) * fp;
  rho[k] = -p.v * p.v * (y * y / r2) * fp * fp / (32.0 * 3.14159265358979);
}
"#;

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
struct Uniform {
    v: f32,
    r: f32,
    sigma: f32,
    half: f32,
    step: f32,
    n: u32,
    _a: u32,
    _b: u32,
}

/// Tamaño de cada mitad del búfer, múltiplo de 256 bytes (alineación exigida a los desplazamientos).
fn mitad_alineada(n: usize) -> u64 {
    ((n * n * 4) as u64).div_ceil(256) * 256
}

struct Bufers {
    n: usize,
    uni: wgpu::Buffer,
    salida: wgpu::Buffer,
    lectura: Option<wgpu::Buffer>,
    grupo: wgpu::BindGroup,
}

pub struct Gpu {
    device: wgpu::Device,
    queue: wgpu::Queue,
    pipeline: wgpu::ComputePipeline,
    layout: wgpu::BindGroupLayout,
    /// Memoria unificada (Apple, integradas): se lee el resultado sin copia intermedia.
    unificada: bool,
    bufers: std::sync::Mutex<Option<Bufers>>,
    /// Nombre del adaptador y backend (p. ej. «Apple M4 · Metal»).
    pub nombre: String,
}

impl Gpu {
    /// Busca la GPU de más rendimiento. `None` si no hay ninguna utilizable.
    pub fn new() -> Option<Self> {
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor::new_without_display_handle_from_env());
        let adapter = pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::HighPerformance,
            force_fallback_adapter: false,
            compatible_surface: None,
            ..Default::default()
        }))
        .ok()?;
        let info = adapter.get_info();
        if info.device_type == wgpu::DeviceType::Cpu {
            return None; // un rasterizador por software es más lento que rayon
        }
        let unificada = info.device_type == wgpu::DeviceType::IntegratedGpu
            && adapter.features().contains(wgpu::Features::MAPPABLE_PRIMARY_BUFFERS);
        let limits = wgpu::Limits {
            max_storage_buffer_binding_size: adapter.limits().max_storage_buffer_binding_size,
            max_buffer_size: adapter.limits().max_buffer_size,
            ..wgpu::Limits::default()
        };
        let (device, queue) = pollster::block_on(adapter.request_device(&wgpu::DeviceDescriptor {
            label: Some("curvatura"),
            required_features: if unificada { wgpu::Features::MAPPABLE_PRIMARY_BUFFERS } else { wgpu::Features::empty() },
            required_limits: limits,
            ..Default::default()
        }))
        .ok()?;
        let module = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("alcubierre"),
            source: wgpu::ShaderSource::Wgsl(SHADER.into()),
        });
        let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("campo"),
            layout: None,
            module: &module,
            entry_point: Some("main"),
            compilation_options: Default::default(),
            cache: None,
        });
        let layout = pipeline.get_bind_group_layout(0);
        let nombre = format!("{} · {:?}{}", info.name, info.backend, if unificada { " · memoria unificada" } else { "" });
        Some(Self { device, queue, pipeline, layout, unificada, bufers: std::sync::Mutex::new(None), nombre })
    }

    fn preparar(&self, n: usize) -> std::sync::MutexGuard<'_, Option<Bufers>> {
        let mut g = self.bufers.lock().unwrap();
        if g.as_ref().map(|b| b.n) != Some(n) {
            let bytes = 2 * mitad_alineada(n); // θ y ρ seguidos en un solo búfer
            let uni = self.device.create_buffer(&wgpu::BufferDescriptor {
                label: Some("parametros"),
                size: std::mem::size_of::<Uniform>() as u64,
                usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
                mapped_at_creation: false,
            });
            let mut uso = wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC;
            if self.unificada {
                uso |= wgpu::BufferUsages::MAP_READ;
            }
            let salida = self.device.create_buffer(&wgpu::BufferDescriptor { label: Some("salida"), size: bytes, usage: uso, mapped_at_creation: false });
            let lectura = (!self.unificada).then(|| {
                self.device.create_buffer(&wgpu::BufferDescriptor {
                    label: Some("lectura"),
                    size: bytes,
                    usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
                    mapped_at_creation: false,
                })
            });
            let mitad = bytes / 2;
            let grupo = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: None,
                layout: &self.layout,
                entries: &[
                    wgpu::BindGroupEntry { binding: 0, resource: uni.as_entire_binding() },
                    wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: &salida, offset: 0, size: std::num::NonZeroU64::new(mitad) }) },
                    wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: &salida, offset: mitad, size: std::num::NonZeroU64::new(mitad) }) },
                ],
            });
            *g = Some(Bufers { n, uni, salida, lectura, grupo });
        }
        g
    }

    fn lanzar(&self, b: &Bufers, p: &Params, half: f64, copiar: bool) {
        let n = b.n;
        let step = if n > 1 { 2.0 * half / (n as f64 - 1.0) } else { 0.0 };
        let u = Uniform { v: p.v as f32, r: p.r as f32, sigma: p.sigma as f32, half: half as f32, step: step as f32, n: n as u32, _a: 0, _b: 0 };
        self.queue.write_buffer(&b.uni, 0, bytemuck::bytes_of(&u));
        let mut enc = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });
        {
            let mut pase = enc.begin_compute_pass(&wgpu::ComputePassDescriptor { label: None, timestamp_writes: None });
            pase.set_pipeline(&self.pipeline);
            pase.set_bind_group(0, &b.grupo, &[]);
            let g = (n as u32).div_ceil(16);
            pase.dispatch_workgroups(g, g, 1);
        }
        if copiar {
            if let Some(l) = &b.lectura {
                enc.copy_buffer_to_buffer(&b.salida, 0, l, 0, 2 * mitad_alineada(n));
            }
        }
        self.queue.submit([enc.finish()]);
    }

    /// θ y ρ_E en el plano z = 0 sobre [-L, L]² con n × n puntos (fila mayor en y), en f32,
    /// escritos en los búferes dados (sin reservar memoria nueva).
    pub fn field_plane_into(&self, p: &Params, half: f64, n: usize, theta: &mut [f32], rho: &mut [f32]) {
        let g = self.preparar(n);
        let b = g.as_ref().unwrap();
        self.lanzar(b, p, half, true);
        let fuente = b.lectura.as_ref().unwrap_or(&b.salida);
        fuente.map_async(wgpu::MapMode::Read, .., |r| r.expect("lectura de la GPU"));
        self.device.poll(wgpu::PollType::Wait { submission_index: None, timeout: None }).expect("GPU");
        {
            let datos = fuente.get_mapped_range(..).expect("rango");
            let todo: &[f32] = bytemuck::cast_slice(&datos);
            theta[..n * n].copy_from_slice(&todo[..n * n]);
            let o = (mitad_alineada(n) / 4) as usize;
            rho[..n * n].copy_from_slice(&todo[o..o + n * n]);
        }
        fuente.unmap();
    }

    pub fn field_plane(&self, p: &Params, half: f64, n: usize) -> (Vec<f32>, Vec<f32>) {
        let (mut t, mut r) = (vec![0.0; n * n], vec![0.0; n * n]);
        self.field_plane_into(p, half, n, &mut t, &mut r);
        (t, r)
    }

    /// Solo el cálculo, sin traer los datos a la CPU (lo que cuesta un barrido que se queda en la GPU).
    pub fn solo_calculo(&self, p: &Params, half: f64, n: usize) {
        let g = self.preparar(n);
        self.lanzar(g.as_ref().unwrap(), p, half, false);
        self.device.poll(wgpu::PollType::Wait { submission_index: None, timeout: None }).expect("GPU");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gpu_matches_cpu() {
        let Some(g) = Gpu::new() else { return }; // sin GPU (CI) no se prueba
        let p = Params { v: 1.2, r: 1.0, sigma: 5.0 };
        let n = 257;
        let (t, r) = g.field_plane(&p, 2.5, n);
        let (mut tc, mut rc) = (vec![0.0; n * n], vec![0.0; n * n]);
        crate::alcubierre::field_plane(&p, 2.5, n, &mut tc, &mut rc);
        let peor_t = t.iter().zip(&tc).map(|(a, b)| (*a as f64 - b).abs()).fold(0.0, f64::max);
        let peor_r = r.iter().zip(&rc).map(|(a, b)| (*a as f64 - b).abs()).fold(0.0, f64::max);
        let esc_t = tc.iter().map(|x| x.abs()).fold(0.0, f64::max);
        let esc_r = rc.iter().map(|x| x.abs()).fold(0.0, f64::max);
        assert!(peor_t / esc_t < 1e-4 && peor_r / esc_r < 1e-4, "θ {peor_t} ρ {peor_r}");
    }
}
