import express, { type Request, type Response } from "express";
import { config } from "../config.js";
import { supabase, type LecturaSensor } from "../services/supabase.js";
import { listarPublicos } from "../repositories/reportesRepo.js";

export function crearServidorHttp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true, service: "HydroIA Velian API" });
  });

  // Recibe lecturas del sensor ESP32
  app.post("/api/sensor", async (req: Request, res: Response) => {
    try {
      // Autenticación opcional: si hay SENSOR_API_KEY configurada, se exige.
      if (config.sensorApiKey) {
        const key = req.header("x-api-key");
        if (key !== config.sensorApiKey) {
          return res.status(401).json({ ok: false, error: "API key inválida." });
        }
      }

      const {
        dispositivo_id,
        turbidez_ntu,
        tds_ppm,
        temperatura_c,
        colonia,
      } = req.body ?? {};

      if (
        typeof dispositivo_id !== "string" ||
        dispositivo_id.length === 0 ||
        dispositivo_id.length > 64 ||
        typeof turbidez_ntu !== "number" ||
        typeof tds_ppm !== "number" ||
        typeof temperatura_c !== "number"
      ) {
        return res.status(400).json({
          ok: false,
          error:
            "Campos requeridos: dispositivo_id (string), turbidez_ntu (number), tds_ppm (number), temperatura_c (number).",
        });
      }

      // Validación de rangos físicos plausibles
      const fuera =
        turbidez_ntu < 0 ||
        turbidez_ntu > 4000 ||
        tds_ppm < 0 ||
        tds_ppm > 5000 ||
        temperatura_c < -10 ||
        temperatura_c > 80;
      if (fuera) {
        return res.status(400).json({
          ok: false,
          error:
            "Valores fuera de rango (turbidez 0–4000 NTU, TDS 0–5000 ppm, temp -10–80 °C).",
        });
      }

      const { error } = await supabase.from("lecturas_sensor").insert({
        dispositivo_id,
        turbidez_ntu,
        tds_ppm,
        temperatura_c,
        colonia: typeof colonia === "string" ? colonia : null,
      });

      if (error) {
        console.error("Error guardando lectura sensor:", error);
        return res.status(500).json({ ok: false, error: "No se pudo guardar la lectura." });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Error en POST /api/sensor:", err);
      return res.status(500).json({ ok: false, error: "Error interno." });
    }
  });

  // Últimas 10 lecturas de un dispositivo
  app.get("/api/lecturas/:dispositivo_id", async (req: Request, res: Response) => {
    try {
      const { dispositivo_id } = req.params;
      const { data, error } = await supabase
        .from("lecturas_sensor")
        .select("*")
        .eq("dispositivo_id", dispositivo_id)
        .order("fecha", { ascending: false })
        .limit(10);
      if (error) {
        console.error("Error consultando lecturas:", error);
        return res.status(500).json({ ok: false, error: "No se pudo consultar." });
      }
      return res.json({ ok: true, lecturas: (data ?? []) as LecturaSensor[] });
    } catch (err) {
      console.error("Error en GET /api/lecturas:", err);
      return res.status(500).json({ ok: false, error: "Error interno." });
    }
  });

  // Reportes públicos anonimizados para el dashboard
  app.get("/api/reportes-publicos", async (_req: Request, res: Response) => {
    try {
      const reportes = await listarPublicos();
      return res.json({ ok: true, reportes });
    } catch (err) {
      console.error("Error en GET /api/reportes-publicos:", err);
      return res.status(500).json({ ok: false, error: "No se pudieron consultar reportes." });
    }
  });

  return app;
}

export function iniciarServidorHttp(): void {
  const app = crearServidorHttp();
  app.listen(config.port, () => {
    console.log(`🌐 API HTTP escuchando en http://localhost:${config.port}`);
  });
}
