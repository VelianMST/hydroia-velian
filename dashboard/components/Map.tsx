"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { coordParaColonia, VALLE_CENTER } from "@/lib/colonias";
import { colorTipo, etiquetaTipo, fechaRelativa } from "@/lib/format";
import type { ReportePublico } from "@/lib/supabase";

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
        const coord = coordParaColonia(r.colonia);
        const icon = makeIcon(colorTipo(r.tipo));
        return (
          <Marker key={r.id} position={[coord.lat, coord.lng]} icon={icon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1" style={{ color: colorTipo(r.tipo) }}>
                  {etiquetaTipo(r.tipo)}
                </p>
                {r.colonia && <p className="text-slate-700">📍 {r.colonia}</p>}
                <p className="text-slate-700">{r.descripcion}</p>
                <p className="text-slate-400 text-xs mt-1">{fechaRelativa(r.fecha)}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
