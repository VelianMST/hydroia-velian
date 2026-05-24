import PageShell from "@/components/PageShell";
import MedidorView from "@/components/MedidorView";

export const metadata = { title: "Mi medidor — HydroIA Velian" };

export default function MedidorPage() {
  return (
    <PageShell
      title="Mi medidor"
      subtitle="Fotografía tu medidor, lleva tu consumo y detecta fugas por anomalía. Sin sensores caros: funciona con tu medidor normal."
    >
      <MedidorView />
    </PageShell>
  );
}
