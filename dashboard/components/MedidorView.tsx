"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Camera, Loader2, Check, Trash2, AlertTriangle, Gauge, Info, Lightbulb, Users } from "lucide-react";
import { reducirImagen } from "@/lib/imagen";

interface Lectura {
  fecha: string; // ISO
  m3: number;
}

const KEY = "hv-medidor-lecturas";
const KEY_PERSONAS = "hv-medidor-personas";

/** Quita marcas de markdown que el modelo a veces incluye. */
function limpiar(s: string): string {
  return s.replace(/\*\*/g, "").replace(/__/g, "").replace(/^#{1,6}\s+/gm, "").replace(/`/g, "").trim();
}

/** Semana de ejemplo (17–23 may) — consumo normal (~167 L/persona) + subida el último día.
 *  Solo se carga manualmente con ?demo=1; sirve para capturas de demostración. */
const SEMANA_EJEMPLO: Lectura[] = [
  { fecha: "2026-05-17T12:00:00", m3: 1452.0 },
  { fecha: "2026-05-18T12:00:00", m3: 1452.6 },
  { fecha: "2026-05-19T12:00:00", m3: 1453.2 },
  { fecha: "2026-05-20T12:00:00", m3: 1453.75 },
  { fecha: "2026-05-21T12:00:00", m3: 1454.4 },
  { fecha: "2026-05-22T12:00:00", m3: 1455.0 },
  { fecha: "2026-05-23T12:00:00", m3: 1456.0 },
];

function cargar(): Lectura[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Lectura[]) : [];
    return arr.filter((l) => typeof l.m3 === "number").sort((a, b) => a.fecha.localeCompare(b.fecha));
  } catch {
    return [];
  }
}

function guardar(arr: Lectura[]) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

interface Periodo {
  etiqueta: string;
  litrosDia: number;
}

export default function MedidorView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [cargando, setCargando] = useState(false);
  const [detectada, setDetectada] = useState<number | null>(null);
  const [editable, setEditable] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState("");
  const [consejos, setConsejos] = useState<string | null>(null);
  const [cargandoConsejos, setCargandoConsejos] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setLecturas(cargar());
    try {
      setPersonas(localStorage.getItem(KEY_PERSONAS) ?? "");
      if (new URLSearchParams(window.location.search).get("demo") === "1") setDemo(true);
    } catch {
      /* */
    }
  }, []);

  function cargarEjemplo() {
    setLecturas(SEMANA_EJEMPLO);
    guardar(SEMANA_EJEMPLO);
    cambiarPersonas("4");
    setConsejos(null);
    setError(null);
  }

  function cambiarPersonas(v: string) {
    setPersonas(v);
    try {
      localStorage.setItem(KEY_PERSONAS, v);
    } catch {
      /* */
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setDetectada(null);
    setCargando(true);
    try {
      const dataUrl = await reducirImagen(file);
      const res = await fetch("/api/leer-medidor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagen: dataUrl, mimeType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "No se pudo leer.");
      } else if (data.leido && data.lectura != null) {
        setDetectada(data.lectura);
        setEditable(String(data.lectura));
        setNota(data.nota ?? "");
      } else {
        setError(data.nota || "No pude leer el número. Toma la foto más de cerca y bien iluminada, o escríbelo tú.");
        setEditable("");
        setDetectada(0); // muestra el campo manual
      }
    } catch {
      setError("No hay conexión o la imagen falló. Intenta de nuevo.");
    } finally {
      setCargando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function guardarLectura() {
    const m3 = Number(editable);
    if (!Number.isFinite(m3) || m3 < 0) {
      setError("Escribe un número válido de m³.");
      return;
    }
    const ultima = lecturas[lecturas.length - 1];
    if (ultima && m3 < ultima.m3) {
      setError(`La lectura nueva (${m3}) es menor que la anterior (${ultima.m3}). Revisa el número.`);
      return;
    }
    const nuevas = [...lecturas, { fecha: new Date().toISOString(), m3 }];
    setLecturas(nuevas);
    guardar(nuevas);
    setDetectada(null);
    setEditable("");
    setNota("");
    setError(null);
  }

  function borrarTodo() {
    if (!confirm("¿Borrar todo tu historial de lecturas de este dispositivo?")) return;
    setLecturas([]);
    guardar([]);
  }

  // Cálculo de consumo, anomalía, promedio y tendencia
  const { periodos, anomalia, ultimoLitrosDia, promedioLitrosDia, tendencia } = useMemo(() => {
    const ps: Periodo[] = [];
    const tasas: number[] = [];
    for (let i = 1; i < lecturas.length; i++) {
      const m3 = lecturas[i].m3 - lecturas[i - 1].m3;
      const ms = new Date(lecturas[i].fecha).getTime() - new Date(lecturas[i - 1].fecha).getTime();
      const dias = Math.max(ms / 86_400_000, 0.04);
      const litrosDia = Math.round((m3 * 1000) / dias);
      tasas.push(litrosDia);
      ps.push({
        etiqueta: new Date(lecturas[i].fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
        litrosDia,
      });
    }
    let anom = false;
    let tend: "subiendo" | "bajando" | "estable" = "estable";
    const prom = tasas.length ? Math.round(tasas.reduce((a, b) => a + b, 0) / tasas.length) : 0;
    if (tasas.length >= 2) {
      const previas = tasas.slice(0, -1);
      const ordenadas = [...previas].sort((a, b) => a - b);
      const mediana = ordenadas[Math.floor(ordenadas.length / 2)];
      const ultimo = tasas[tasas.length - 1];
      if (mediana > 0 && ultimo > mediana * 1.4) anom = true;
      const avgPrev = previas.reduce((a, b) => a + b, 0) / previas.length;
      if (avgPrev > 0 && ultimo > avgPrev * 1.15) tend = "subiendo";
      else if (avgPrev > 0 && ultimo < avgPrev * 0.85) tend = "bajando";
    }
    return {
      periodos: ps,
      anomalia: anom,
      ultimoLitrosDia: tasas[tasas.length - 1] ?? null,
      promedioLitrosDia: prom,
      tendencia: tend,
    };
  }, [lecturas]);

  async function pedirConsejos() {
    setCargandoConsejos(true);
    setConsejos(null);
    try {
      const p = Number(personas);
      const personasN = Number.isFinite(p) && p > 0 ? p : null;
      const litrosPorPersona = personasN && promedioLitrosDia ? Math.round(promedioLitrosDia / personasN) : null;
      const res = await fetch("/api/medidor-consejos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promedioLitrosDia,
          ultimoLitrosDia: ultimoLitrosDia ?? 0,
          personas: personasN,
          litrosPorPersona,
          tendencia,
          anomalia,
          numLecturas: lecturas.length,
        }),
      });
      const data = await res.json();
      setConsejos(data.ok ? limpiar(data.consejos) : data.error ?? "No se pudo generar.");
    } catch {
      setConsejos("No hay conexión. Intenta de nuevo.");
    } finally {
      setCargandoConsejos(false);
    }
  }

  return (
    <div className="space-y-6">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />

      <p className="text-sm text-slate-600">
        Toma una foto de tu medidor cada cierto tiempo. La IA lee los m³, lleva tu consumo y te
        avisa si <strong>sube de golpe</strong> (posible fuga). Tu historial se guarda solo en este
        celular. 🔒
      </p>

      {/* Captura / confirmación */}
      {detectada === null ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
          className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-[color:var(--color-primary)] transition disabled:opacity-60"
        >
          {cargando ? (
            <Loader2 className="w-9 h-9 mx-auto text-[color:var(--color-primary)] animate-spin" aria-hidden />
          ) : (
            <Camera className="w-9 h-9 mx-auto text-[color:var(--color-primary)]" aria-hidden />
          )}
          <p className="mt-2 font-medium text-slate-800">{cargando ? "Leyendo el medidor…" : "Tomar foto del medidor"}</p>
          <p className="text-xs text-slate-500">Enfoca los números (los negros son m³)</p>
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Confirma la lectura (corrígela si la IA se equivocó):</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editable}
              onChange={(e) => setEditable(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-lg text-slate-800 focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 outline-none"
            />
            <span className="text-slate-500 font-medium">m³</span>
          </div>
          {nota && <p className="text-xs text-slate-500">{nota}</p>}
          <div className="flex gap-2">
            <button onClick={guardarLectura} className="flex-1 inline-flex items-center justify-center gap-2 bg-[color:var(--color-primary)] text-white font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition">
              <Check className="w-4 h-4" aria-hidden /> Guardar lectura
            </button>
            <button onClick={() => { setDetectada(null); setError(null); }} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Anomalía */}
      {anomalia && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">⚠️ Posible fuga</p>
            <p>Tu consumo más reciente subió bastante respecto a tu promedio. Revisa llaves, WC y tinaco. Si ves una fuga, repórtala en la pestaña Reportar.</p>
          </div>
        </div>
      )}

      {/* Resumen + gráfica */}
      {lecturas.length >= 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-primary)]">
              <Gauge className="w-4 h-4" aria-hidden /> Tu consumo
            </h3>
            <button onClick={borrarTodo} className="text-xs text-slate-400 hover:text-red-500 inline-flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" aria-hidden /> Borrar
            </button>
          </div>

          {ultimoLitrosDia != null ? (
            <p className="text-sm text-slate-600">
              Último consumo: <strong>{ultimoLitrosDia} L/día</strong>{" "}
              <span className="text-slate-400">(promedio nacional ≈ 250 L por persona)</span>
            </p>
          ) : (
            <p className="text-sm text-slate-500">Llevas 1 lectura. Toma otra en unos días para ver tu consumo. 📈</p>
          )}

          {periodos.length >= 1 && (
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={periodos} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} L/día`, "Consumo"]} />
                  <Bar dataKey="litrosDia" fill="#2e75b6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <ul className="text-xs text-slate-500 divide-y divide-slate-100">
            {[...lecturas].reverse().map((l, i) => (
              <li key={i} className="py-1.5 flex justify-between">
                <span>{new Date(l.fecha).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="font-medium text-slate-700">{l.m3} m³</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coach de ahorro con IA */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Lightbulb className="w-4 h-4" aria-hidden /> Consejos para ahorrar (según tu consumo)
        </h3>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" aria-hidden />
          <label htmlFor="personas" className="text-sm text-slate-600">¿Cuántas personas viven en casa?</label>
          <input
            id="personas"
            type="number"
            min={1}
            value={personas}
            onChange={(e) => cambiarPersonas(e.target.value)}
            placeholder="ej. 4"
            className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>
        {periodos.length >= 1 ? (
          <button
            onClick={pedirConsejos}
            disabled={cargandoConsejos}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
          >
            {cargandoConsejos ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Lightbulb className="w-4 h-4" aria-hidden />}
            {cargandoConsejos ? "Analizando tu consumo…" : "Generar consejos con IA"}
          </button>
        ) : (
          <p className="text-sm text-slate-500">Toma al menos 2 lecturas (en días distintos) y aquí te daré consejos personalizados según tu consumo real. 📈</p>
        )}
        {consejos && (
          <div className="rounded-xl bg-white border border-emerald-100 p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {consejos}
          </div>
        )}
      </div>

      {/* Prueba rápida de fuga */}
      <div className="rounded-2xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary)]/5 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-primary)] mb-1">
          <Info className="w-4 h-4" aria-hidden /> Prueba rápida de fuga (5 min)
        </h3>
        <p className="text-sm text-slate-600">
          1) Toma una lectura. 2) No uses agua en casa por 1–2 horas (ni WC). 3) Toma otra lectura. Si
          el número <strong>subió</strong> sin haber usado agua, casi seguro tienes una fuga interna.
        </p>
      </div>

      {demo && (
        <button
          onClick={cargarEjemplo}
          className="w-full text-xs text-slate-400 underline mt-2"
        >
          Cargar semana de ejemplo (demo)
        </button>
      )}
    </div>
  );
}
