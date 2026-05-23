"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { coordFallback, VALLE_CENTER } from "@/lib/colonias";
import { colorTipo, etiquetaTipo, fechaRelativa } from "@/lib/format";
import type { ReportePublico } from "@/lib/supabase";
import ConfirmarFuga from "./ConfirmarFuga";

const SEV_LABEL: Record<string, string> = {
  goteo: "Goteo o humedad",
  chorro: "Chorro pequeño",
  chorro_fuerte: "Chorro fuerte / encharcamiento",
  brote: "Brote mayor / inundación",
  indeterminada: "Severidad sin determinar",
};

interface MapProps {
  reportes: ReportePublico[];
}

function makeIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<span class="hydroia-marker" style="background:${color}"></span>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}

export default function Map({ reportes }: MapProps) {
  useEffect(() => {
    // Workaround para iconos default de Leaflet en bundlers
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[VALLE_CENTER.lat, VALLE_CENTER.lng]}
      zoom={11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reportes.map((r) => {
        const coord =
          r.lat != null && r.lng != null
            ? { lat: r.lat, lng: r.lng }
            : coordFallback(r.colonia_norm ?? r.colonia);
        const icon = makeIcon(colorTipo(r.tipo));
        return (
          <Marker key={r.id} position={[coord.lat, coord.lng]} icon={icon}>
            <Popup>
              <div className="text-sm" style={{ minWidth: 180 }}>
                <p className="font-semibold mb-1" style={{ color: colorTipo(r.tipo) }}>
                  {etiquetaTipo(r.tipo)}
                </p>
                {r.tipo === "fuga" && r.foto_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.foto_url}
                    alt="Foto de la fuga"
                    style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 8, marginBottom: 6 }}
                  />
                )}
                {r.tipo === "fuga" && r.severidad && (
                  <p className="text-slate-700" style={{ margin: 0 }}>
                    💧 {SEV_LABEL[r.severidad] ?? r.severidad}
                    {r.litros_dia ? ` · ~${r.litros_dia} L/día` : ""}
                  </p>
                )}
                {r.colonia && (
                  <p className="text-slate-700" style={{ margin: 0 }}>
                    📍 {r.colonia}
                    {r.municipio ? `, ${r.municipio}` : ""}
                  </p>
                )}
                <p className="text-slate-700">{r.descripcion}</p>
                <p className="text-slate-400 text-xs mt-1">{fechaRelativa(r.fecha)}</p>
                {r.tipo === "fuga" && (
                  <ConfirmarFuga
                    reporteId={r.id}
                    sigueInicial={r.confirma_sigue ?? 0}
                    reparadaInicial={r.confirma_reparada ?? 0}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
