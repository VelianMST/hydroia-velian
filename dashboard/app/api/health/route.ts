export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico de configuración: dice si las variables de entorno están
 * presentes en el servidor (solo booleanos, NUNCA expone los valores).
 * Útil para verificar el despliegue en Vercel.
 */
export function GET(): Response {
  return Response.json({
    ok: true,
    env: {
      supabase_url: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabase_anon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabase_service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  });
}
