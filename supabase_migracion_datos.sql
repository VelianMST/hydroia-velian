-- HydroIA Velian — Migración de Datos Abiertos
-- Cópialo COMPLETO en el SQL Editor de Supabase y pulsa Run.
-- Idempotente: puedes correrlo más de una vez sin romper nada.

-- Serie temporal de indicadores de datos abiertos (CONAGUA / SACMEX).
-- Cada fila es una observación; el "valor actual" es la más reciente por
-- indicador.
CREATE TABLE IF NOT EXISTS datos_abiertos (
  id          UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  indicador   TEXT         NOT NULL,          -- 'cutzamala_pct' | 'sacmex_tandeo'
  valor       DECIMAL,                        -- numérico (ej. % Cutzamala)
  texto       TEXT,                           -- detalle (ej. nota SACMEX)
  fuente      TEXT,                           -- de dónde salió
  confiable   BOOLEAN      DEFAULT true,      -- false si es respaldo/aprox.
  fecha       TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datos_abiertos_indicador
  ON datos_abiertos (indicador, fecha DESC);

-- RLS: el dashboard (anon) SÍ debe poder leer estos datos públicos.
ALTER TABLE datos_abiertos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "datos_abiertos_anon_read" ON datos_abiertos;
CREATE POLICY "datos_abiertos_anon_read"
  ON datos_abiertos
  FOR SELECT
  TO anon
  USING (true);
-- El bot escribe con service_role (omite RLS). anon solo lee.
