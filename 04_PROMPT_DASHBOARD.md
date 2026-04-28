# 🗺️ PASO 4 — Dashboard web público (1 hora)

> **Pre-requisito:** Pasos 1, 2 y 3 funcionando. Datos reales en Supabase.

## Antes de empezar

El dashboard será un **proyecto separado** (Next.js), en una carpeta diferente. NO lo metas dentro de la carpeta del bot.

1. Sal de Claude Code en la terminal del bot (Ctrl+C dos veces, o escribe `exit`)
2. Crea una carpeta nueva al lado de `hydroia-velian` llamada `hydroia-dashboard`
3. En VS Code, abre esa carpeta nueva (File → Open Folder)
4. Abre la terminal y activa Claude Code: escribe `claude`

---

## 📋 PROMPT — copia TODO el bloque siguiente y pégalo en Claude Code

```
Crea un dashboard web público para HydroIA Velian, un proyecto del Premio Nacional Juvenil del Agua 2026.

CONTEXTO:
Este dashboard es la "Capa 4" del ecosistema HydroIA Velian (las otras 3 son: bot Telegram, IA con Claude, base de datos en Supabase). Mostrará en tiempo real los reportes ciudadanos, los diagnósticos de calidad del agua y las predicciones de tandeos. Es público y debe verse profesional para impresionar al jurado.

STACK TÉCNICO:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Leaflet + react-leaflet (mapa)
- Recharts (gráficas)
- Supabase JS client
- Iconos: lucide-react

PASO A — Setup del proyecto:

1. Inicializa el proyecto con:
   npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
   Si pregunta cosas, responde: ESLint=Yes, Turbopack=No

2. Instala dependencias adicionales:
   npm install @supabase/supabase-js leaflet react-leaflet recharts lucide-react
   npm install -D @types/leaflet

3. Crea .env.local con:
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=

   IMPORTANTE: Aquí usamos la "anon" key de Supabase (NO la service_role). El dashboard es público y no debe tener permisos de escritura.

4. En Supabase, dame instrucciones para:
   a) Ir a Settings → API y copiar la "anon" public key
   b) Habilitar Row Level Security en las tablas
   c) Crear policies que permitan lectura pública de:
      - reportes (solo columnas: id, tipo, colonia, descripcion, fecha)
      - diagnosticos (solo columna: nivel_riesgo, fecha — NUNCA usuario_id)
      - lecturas_sensor (todo)
   d) NO permitir lectura pública de: usuarios

PASO B — Estructura del dashboard:

1. app/layout.tsx: layout principal con header sticky que diga "HydroIA Velian — Mapa Público de Aguas del Valle de México" y navegación a las secciones (Mapa, Estadísticas, Acerca de)

2. app/page.tsx: Página principal con secciones:
   a) HERO: título grande, subtítulo, CTA "Únete por Telegram" → link a t.me/[username del bot]
   b) DASHBOARD KPIs: 4 cards con números grandes:
      - Total reportes ciudadanos
      - Familias activas
      - Diagnósticos realizados
      - Colonias cubiertas
   c) MAPA: ocupa ancho completo, alto 600px, muestra todos los reportes como marcadores. Color del marcador según tipo: rojo=fuga, naranja=tandeo, amarillo=mala_calidad
   d) GRÁFICA: Bar chart con cantidad de reportes por colonia (top 10)
   e) GRÁFICA: Pie chart con distribución de niveles de riesgo de los diagnósticos
   f) TABLA: últimos 10 reportes (tipo, colonia, fecha relativa)
   g) FOOTER: "HydroIA Velian — Premio Nacional Juvenil del Agua 2026" + link a la convocatoria

3. components/Map.tsx: componente del mapa (debe ser dynamic import porque Leaflet no funciona en SSR)
   - Centrado en el Valle de México: lat 19.4326, lng -99.1332, zoom 11
   - Tiles de OpenStreetMap
   - Marcadores con popup que muestra: tipo, descripción, fecha relativa
   - Si un reporte no tiene latitud/longitud exactas, ubícalo en el centro de su colonia (puedes usar coordenadas aproximadas hardcodeadas para colonias comunes de Nicolás Romero, o el centroide del municipio)

4. components/KPICard.tsx: card reutilizable con icono, número grande, label

5. lib/supabase.ts: cliente Supabase para el lado cliente

6. lib/queries.ts: funciones que consultan datos de Supabase:
   - obtenerReportes()
   - obtenerDiagnosticos()
   - obtenerEstadisticas() // devuelve los 4 KPIs
   - obtenerReportesPorColonia()
   - obtenerDistribucionRiesgo()

PASO C — Diseño visual:

- Paleta de colores:
  - Azul primario: #1F4E79 (mismo del documento Word)
  - Azul secundario: #2E75B6
  - Verde de éxito: #10B981
  - Rojo alerta: #EF4444
  - Naranja: #F59E0B
  - Fondo: #F8FAFC
  - Texto principal: #1E293B

- Tipografía: Inter (de Google Fonts)
- Bordes redondeados: rounded-xl
- Sombras suaves: shadow-sm
- Modo claro únicamente (no agregues toggle de dark mode)

- En el HERO, gradiente sutil de #1F4E79 a #2E75B6
- Las KPI cards deben tener iconos de lucide-react: Users, Droplets, Activity, MapPin
- Animación sutil al cargar números (puedes usar simplemente tailwind animate-pulse en el skeleton inicial)

PASO D — Funcionalidad:

1. Los datos se cargan en client-side con useEffect al montar el componente
2. Mientras cargan, muestra skeleton placeholders
3. Si no hay datos (BD vacía), muestra "Aún no hay reportes. Sé el primero por Telegram."
4. Auto-refresh cada 60 segundos (los datos se actualizan solos)

PASO E — SEO y accesibilidad:

- Meta tags: título "HydroIA Velian — Mapa Público de Aguas", descripción adecuada, og:image (placeholder OK)
- Aria labels en botones e iconos
- Contraste de texto adecuado
- Mobile responsive (Tailwind md:, lg: breakpoints)

DESPUÉS DE TERMINAR:
1. Corre npm run dev y dime cómo verificar que funciona en localhost:3000
2. Dame los pasos exactos para desplegar en Vercel:
   a) Subir a GitHub
   b) Importar en Vercel
   c) Configurar variables de entorno en Vercel
   d) Obtener URL pública

Procede.
```

---

## 🧪 Cómo probar localmente

1. Cuando Claude Code termine, corre `npm run dev`
2. Abre http://localhost:3000
3. Verás el dashboard con datos de Supabase

📸 **Captura para tomar:** la pantalla del dashboard funcionando con datos. Esta es la **Figura 5** del documento.

---

## ☁️ Cómo desplegar en Vercel (5 minutos)

1. **Crea un repositorio en GitHub:**
   - Ve a github.com → New Repository
   - Nombre: `hydroia-dashboard`
   - Privado o público (igual)
   - Create

2. **Sube tu código:**
   ```bash
   git init
   git add .
   git commit -m "Dashboard inicial HydroIA Velian"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/hydroia-dashboard.git
   git push -u origin main
   ```

3. **En Vercel:**
   - Ve a vercel.com → Add New → Project
   - Importa tu repo `hydroia-dashboard`
   - En Environment Variables, agrega:
     - `NEXT_PUBLIC_SUPABASE_URL` con tu URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` con tu anon key
   - Deploy

4. **Te da una URL** tipo `https://hydroia-dashboard.vercel.app`
   - Esa URL la pones en el documento del premio
   - **Esa URL es PARTE de tu evidencia ganadora**

---

## 🎯 Tip pro

Una vez desplegado, comparte la URL en redes sociales o grupos de WhatsApp diciendo:
> *"Estamos probando un mapa público de aguas en Nicolás Romero. ¿Has tenido cortes? Repórtalo aquí: t.me/[tu_bot] y aparece en el mapa: [url_dashboard]"*

Si en las próximas 24 horas consigues que aparezcan **5-10 marcadores reales** en el mapa, eso ya te coloca en el top 5 de la competencia. Datos reales > documento perfecto.

---

## ✅ Listo? Pasa a `05_PROMPT_PULIDO_FINAL.md` (mañana)
