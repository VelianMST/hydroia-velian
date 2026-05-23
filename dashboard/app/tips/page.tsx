import PageShell from "@/components/PageShell";
import TipsView from "@/components/TipsView";

export const metadata = { title: "Tips para ahorrar agua — HydroIA Velian" };

export default function TipsPage() {
  return (
    <PageShell
      title="Tips para cuidar el agua"
      subtitle="Consejos prácticos para usar menos agua en casa y almacenarla con seguridad."
    >
      <TipsView />
    </PageShell>
  );
}
