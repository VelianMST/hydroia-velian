-- HydroIA Velian — Migración de geolocalización
-- Cópialo COMPLETO en el SQL Editor de Supabase y pulsa Run.
-- Es idempotente: puedes correrlo más de una vez sin romper nada.

-- 1) usuarios: nombre normalizado + coordenadas resueltas
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS colonia_norm TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS lat DECIMAL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS lng DECIMAL;
-- (municipio y estado ya existen en el esquema original)

-- 2) reportes: nombre normalizado, municipio, estado geográfico y centroide.
--    OJO: la columna 'estado' de reportes ya existe y significa el estatus
--    del reporte ('abierto'/'atendido'); por eso el estado GEOGRÁFICO se
--    guarda en 'estado_geo'.
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS colonia_norm TEXT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS estado_geo TEXT;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS lat DECIMAL;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS lng DECIMAL;

-- 3) Caché de geocodificación (cada lugar se resuelve UNA sola vez)
CREATE TABLE IF NOT EXISTS geocache (
  clave   TEXT PRIMARY KEY,
  lat     DECIMAL,
  lng     DECIMAL,
  fuente  TEXT,
  fecha   TIMESTAMPTZ DEFAULT now()
);

-- 4) Índices
CREATE INDEX IF NOT EXISTS idx_reportes_colonia_norm ON reportes (colonia_norm);
CREATE INDEX IF NOT EXISTS idx_usuarios_colonia_norm ON usuarios (colonia_norm);

-- 5) RLS: geocache es privada (solo el bot la usa con service_role, que
--    omite RLS). No se crea política para anon -> el dashboard no la lee.
ALTER TABLE geocache ENABLE ROW LEVEL SECURITY;

-- Las nuevas columnas de 'reportes' las lee el dashboard mediante la política
-- 'reportes_anon_read' que ya existe (USING true cubre todas las columnas).
-- No se requiere acción adicional para el dashboard.
