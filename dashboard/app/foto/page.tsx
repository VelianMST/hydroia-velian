import PageShell from "@/components/PageShell";
import FotoForm from "@/components/FotoForm";

export const metadata = { title: "Diagnóstico de foto — HydroIA Velian" };

export default function FotoPage() {
  return (
    <PageShell
      title="Diagnóstico del agua por foto"
      subtitle="Sube una foto del agua y la IA hace un tamizaje visual preliminar. No reemplaza un análisis de laboratorio."
    >
      <FotoForm />
    </PageShell>
  );
}
