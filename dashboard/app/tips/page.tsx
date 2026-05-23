import PageShell from "@/components/PageShell";
import AsistenteChat from "@/components/AsistenteChat";
import TipsView from "@/components/TipsView";

export const metadata = { title: "Tips y asistente — HydroIA Velian" };

export default function TipsPage() {
  return (
    <PageShell
      title="Tips para cuidar el agua"
      subtitle="Pregúntale a Gota sobre tu agua (qué hacer con ella, cómo tratarla, cómo ahorrar) o explora los tips rápidos."
    >
      <div className="space-y-8">
        <AsistenteChat />
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--color-primary)] mb-4">
            Tips rápidos
          </h2>
          <TipsView />
        </div>
      </div>
    </PageShell>
  );
}
