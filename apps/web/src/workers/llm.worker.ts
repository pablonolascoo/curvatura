/// <reference lib="webworker" />
/** Modelo de lenguaje en un hilo aparte (WebLLM: WebGPU + WebAssembly): la interfaz no se congela mientras genera. */
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const manejador = new WebWorkerMLCEngineHandler();
self.onmessage = (m: MessageEvent) => manejador.onmessage(m);
