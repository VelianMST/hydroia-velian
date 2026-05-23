import PageShell from "@/components/PageShell";
import PrediccionForm from "@/components/PrediccionForm";

export const metadata = { title: "Predicción — HydroIA Velian" };

export default function PrediccionPage() {
  return (
    <PageShell
      title="Predicción de cortes"
      subtitle="Estima la probabilidad de que se vaya el agua en tu colonia en las próximas horas, con el mismo modelo que usa el bot."
    >
      <PrediccionForm />
    </PageShell>
  );
}
