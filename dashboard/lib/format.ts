export function fechaRelativa(fecha: string): string {
  const ms = Date.now() - new Date(fecha).getTime();
  if (ms < 0) return "ahora";
  const seg = Math.floor(ms / 1000);
  if (seg < 60) return `hace ${seg}s`;
  const min = Math.floor(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  const meses = Math.floor(d / 30);
  if (meses < 12) return `hace ${meses} m`;
  return new Date(fecha).toLocaleDateString("es-MX");
}

export function etiquetaTipo(tipo: string): string {
  if (tipo === "fuga") return "Fuga";
  if (tipo === "tandeo") return "Tandeo";
  if (tipo === "mala_calidad") return "Mala calidad";
  return tipo;
}

export function colorTipo(tipo: string): string {
  if (tipo === "fuga") return "#EF4444";
  if (tipo === "tandeo") return "#F59E0B";
  if (tipo === "mala_calidad") return "#EAB308";
  return "#64748B";
}
