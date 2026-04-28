-- HydroIA Velian — Row Level Security para el dashboard público
-- Cópialo y pégalo en el SQL Editor de Supabase y dale Run.
--
-- Estrategia:
-- 1) Habilita RLS en todas las tablas.
-- 2) NO crea ninguna política para `usuarios` → anon no puede leerla (privado).
-- 3) Crea policies que permiten SELECT desde anon en reportes, diagnosticos,
--    lecturas_sensor y predicciones.
-- 4) El bot usa la SERVICE_ROLE key, que omite RLS — sigue teniendo acceso total.
-- 5) La restricción de columnas (no exponer usuario_id, lat/lng) la hace el
--    dashboard al pedir solo las columnas seguras.

ALTER TABLE usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturas_sensor ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicciones    ENABLE ROW LEVEL SECURITY;

-- usuarios: NINGUNA política para anon → privado por completo

-- diagnosticos: lectura pública para el dashboard
DROP POLICY IF EXISTS "diagnosticos_anon_read" ON diagnosticos;
CREATE POLICY "diagnosticos_anon_read"
  ON diagnosticos
  FOR SELECT
  TO anon
  USING (true);

-- reportes: lectura pública para el dashboard
DROP POLICY IF EXISTS "reportes_anon_read" ON reportes;
CREATE POLICY "reportes_anon_read"
  ON reportes
  FOR SELECT
  TO anon
  USING (true);

-- lecturas_sensor: lectura pública para el dashboard / dispositivos
DROP POLICY IF EXISTS "lecturas_sensor_anon_read" ON lecturas_sensor;
CREATE POLICY "lecturas_sensor_anon_read"
  ON lecturas_sensor
  FOR SELECT
  TO anon
  USING (true);

-- predicciones: lectura pública
DROP POLICY IF EXISTS "predicciones_anon_read" ON predicciones;
CREATE POLICY "predicciones_anon_read"
  ON predicciones
  FOR SELECT
  TO anon
  USING (true);
