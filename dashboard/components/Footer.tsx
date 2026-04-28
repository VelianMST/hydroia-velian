export default function Footer() {
  return (
    <footer id="acerca" className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">
            HydroIA Velian
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ecosistema de IA ciudadana para la crisis hídrica del Valle de México. Bot
            conversacional, diagnóstico visual con IA, base ciudadana y modelo predictivo de
            tandeos.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">
            Premio
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Proyecto presentado al{" "}
            <a
              href="https://agua.org.mx/premio-nacional-juvenil-del-agua/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-primary-soft)] underline"
            >
              Premio Nacional Juvenil del Agua 2026
            </a>
            , eliminatoria del Stockholm Junior Water Prize.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">ODS</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Alineado con el Objetivo de Desarrollo Sostenible 6 de la ONU: Agua limpia y
            saneamiento.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-slate-500 flex justify-between">
          <span>© 2026 HydroIA Velian</span>
          <span>Datos ciudadanos anonimizados</span>
        </div>
      </div>
    </footer>
  );
}
