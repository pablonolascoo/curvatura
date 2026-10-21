-- Valoraciones con estrellas, Mención de honor y verificación de estudios o trabajo.
-- Identidad: ORCID (cuenta de investigador verificada). Los documentos viven en KV hasta su revisión.

CREATE TABLE usuarios (
  id            TEXT PRIMARY KEY,                 -- ORCID iD (0000-0000-0000-0000)
  nombre        TEXT NOT NULL,
  creado        TEXT NOT NULL DEFAULT (datetime('now')),
  mencion       TEXT NOT NULL DEFAULT 'no'        -- no | pendiente | aprobada | rechazada
                CHECK (mencion IN ('no', 'pendiente', 'aprobada', 'rechazada')),
  mencion_base  TEXT                              -- resumen de lo verificado (p. ej. «Doctorado en Física, Univ. X»)
);

CREATE TABLE sesiones (
  hash      TEXT PRIMARY KEY,                     -- SHA-256 del token (el token nunca se guarda)
  usuario   TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  caduca    TEXT NOT NULL
);
CREATE INDEX sesiones_usuario ON sesiones(usuario);

CREATE TABLE valoraciones (
  paper     TEXT NOT NULL,
  usuario   TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estrellas INTEGER NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  mencion   INTEGER NOT NULL DEFAULT 0 CHECK (mencion IN (0, 1)),
  fecha     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (paper, usuario)
);
CREATE INDEX valoraciones_paper ON valoraciones(paper);

CREATE TABLE verificaciones (
  id           TEXT PRIMARY KEY,
  usuario      TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL CHECK (tipo IN ('grado', 'master', 'postgrado', 'doctorado', 'trabajo')),
  titulo       TEXT NOT NULL,                     -- título obtenido o puesto
  institucion  TEXT NOT NULL,
  anio         INTEGER,
  area         TEXT NOT NULL,
  documento    TEXT,                              -- clave en KV (se borra tras la revisión)
  doc_sha256   TEXT,                              -- huella del documento (se conserva)
  doc_tipo     TEXT,
  evidencia    TEXT,                              -- JSON: afiliaciones validadas por la institución en ORCID
  estado       TEXT NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  nota         TEXT,                              -- motivo del revisor
  revisor      TEXT,
  creada       TEXT NOT NULL DEFAULT (datetime('now')),
  revisada     TEXT
);
CREATE INDEX verificaciones_estado ON verificaciones(estado);
