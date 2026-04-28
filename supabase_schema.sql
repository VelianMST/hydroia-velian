-- HydroIA Velian — esquema de base de datos
-- Cópialo y pégalo completo en el SQL Editor de Supabase, luego pulsa "Run".
-- Usa "tamano_familia" en lugar de "tamaño_familia" para evitar problemas de
-- codificación con identificadores no-ASCII.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla 1: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id                     BIGINT       PRIMARY KEY,
  colonia                TEXT,
  municipio              TEXT         DEFAULT 'Nicolás Romero',
  estado                 TEXT         DEFAULT 'México',
  consentimiento         BOOLEAN      DEFAULT false,
  fecha_alta             TIMESTAMPTZ  DEFAULT now(),
  fecha_ultimo_contacto  TIMESTAMPTZ,
  tamano_familia         INT
);

-- Tabla 2: diagnosticos
CREATE TABLE IF NOT EXISTS diagnosticos (
  id                   UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id           BIGINT       REFERENCES usuarios(id) ON DELETE CASCADE,
  nivel_riesgo         TEXT,
  color_observado      TEXT,
  turbidez_aparente    TEXT,
  sedimentos_visibles  BOOLEAN,
  diagnostico          TEXT,
  recomendacion        TEXT,
  fecha                TIMESTAMPTZ  DEFAULT now()
);

-- Tabla 3: reportes
CREATE TABLE IF NOT EXISTS reportes (
  id           UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id   BIGINT       REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo         TEXT,
  colonia      TEXT,
  latitud      DECIMAL,
  longitud     DECIMAL,
  descripcion  TEXT,
  fecha        TIMESTAMPTZ  DEFAULT now(),
  estado       TEXT         DEFAULT 'abierto'
);

-- Tabla 4: lecturas_sensor (para hardware ESP32 futuro)
CREATE TABLE IF NOT EXISTS lecturas_sensor (
  id              UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  dispositivo_id  TEXT,
  turbidez_ntu    DECIMAL,
  tds_ppm         DECIMAL,
  temperatura_c   DECIMAL,
  colonia         TEXT,
  fecha           TIMESTAMPTZ  DEFAULT now()
);

-- Tabla 5: predicciones
CREATE TABLE IF NOT EXISTS predicciones (
  id                   UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  colonia              TEXT,
  probabilidad_corte   DECIMAL,
  ventana_horas        INT,
  fecha_calculo        TIMESTAMPTZ  DEFAULT now()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_diagnosticos_usuario  ON diagnosticos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario      ON reportes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_colonia      ON reportes (colonia);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha        ON reportes (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_predicciones_colonia  ON predicciones (colonia, fecha_calculo DESC);
CREATE INDEX IF NOT EXISTS idx_lecturas_dispositivo  ON lecturas_sensor (dispositivo_id, fecha DESC);
