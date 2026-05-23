// Copia los artefactos del modelo entrenado (fuente única: /model en la raíz
// del repo) a dashboard/lib/model para que las API routes los puedan importar
// y se desplieguen con la app en Vercel.
//
// Cuándo correrlo: cada vez que reentrenes el modelo o actualices el Cutzamala.
// Se ejecuta también en "prebuild". En Vercel la carpeta ../model NO existe
// (solo se sube dashboard/), así que ahí no hace nada y se usan las copias ya
// versionadas: por eso conviene commitear dashboard/lib/model.
import { copyFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "..", "model");
const DST = join(here, "..", "lib", "model");
const ARCHIVOS = ["modelo_tandeos.json", "colonias_riesgo.json", "cutzamala_actual.json"];

try {
  await access(SRC);
} catch {
  console.log("[sync-model] ../model no disponible (p. ej. Vercel): uso las copias versionadas.");
  process.exit(0);
}

await mkdir(DST, { recursive: true });
for (const archivo of ARCHIVOS) {
  try {
    await copyFile(join(SRC, archivo), join(DST, archivo));
    console.log(`[sync-model] copiado ${archivo}`);
  } catch (err) {
    console.warn(`[sync-model] no se pudo copiar ${archivo}:`, err.message);
  }
}
