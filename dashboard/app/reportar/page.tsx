import PageShell from "@/components/PageShell";
import ReportarForm from "@/components/ReportarForm";

export const metadata = { title: "Reportar — HydroIA Velian" };

export default function ReportarPage() {
  return (
    <PageShell
      title="Reportar"
      subtitle="Avisa de una fuga, un tandeo prolongado o agua de mala calidad en tu colonia. Tu reporte alimenta el mapa público y el modelo de predicción."
    >
      <ReportarForm />
    </PageShell>
  );
}
