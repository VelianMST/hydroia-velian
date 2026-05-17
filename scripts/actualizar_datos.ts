/**
 * Fuerza la ingesta de datos abiertos (CONAGUA Cutzamala + capa SACMEX)
 * de inmediato, sin esperar al cron. Útil antes de una demo.
 *
 * Uso (desde la raíz del proyecto, con .env configurado):
 *   npx tsx scripts/actualizar_datos.ts
 */
import { ingestaDiaria } from "../src/services/datosAbiertos.js";
import { ultimoDato } from "../src/repositories/datosAbiertosRepo.js";

async function main(): Promise<void> {
  console.log("== Actualizando datos abiertos ==");
  await ingestaDiaria();

  const cutz = await ultimoDato("cutzamala_pct");
  const sac = await ultimoDato("sacmex_tandeo");
  console.log("\nEstado actual en Supabase:");
  console.log(
    `  Cutzamala: ${cutz?.valor ?? "n/d"}%  | fuente: ${cutz?.fuente ?? "n/d"}  | confiable: ${cutz?.confiable ?? "n/d"}`,
  );
  console.log(
    `  SACMEX:    ${sac?.valor ?? 0} programa(s) vigente(s)  | ${sac?.texto ?? "n/d"}`,
  );
  console.log("\n✅ Listo.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Falló la actualización:", err);
  process.exit(1);
});
