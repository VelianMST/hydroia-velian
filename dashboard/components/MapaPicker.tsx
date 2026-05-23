"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pin = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:1">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function Selector({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  center: [number, number];
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MapaPicker({ center, value, onChange }: Props) {
  return (
    <MapContainer center={center} zoom={16} style={{ height: 280, width: "100%" }} scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <Selector onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={pin} />}
    </MapContainer>
  );
}
