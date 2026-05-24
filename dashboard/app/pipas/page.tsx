import PageShell from "@/components/PageShell";
import SolicitarPipa from "@/components/SolicitarPipa";
import MuroAyuda from "@/components/MuroAyuda";

export const metadata = { title: "Pipas y ayuda vecinal — HydroIA Velian" };

export default function PipasPage() {
  return (
    <PageShell
      title="Pipas y ayuda vecinal"
      subtitle="Si te quedaste sin agua: pide una pipa GRATIS al gobierno o coordínate con tus vecinos."
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-[color:var(--color-primary)] mb-3">🚚 Solicitar pipa gratis</h2>
          <SolicitarPipa />
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[color:var(--color-primary)] mb-3">🤝 Muro de ayuda vecinal</h2>
          <MuroAyuda />
        </section>
      </div>
    </PageShell>
  );
}
