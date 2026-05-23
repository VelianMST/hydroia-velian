/**
 * Tips de uso del agua — ESPEJO de src/services/tips.ts del bot.
 * Contenido curado para el Valle de México. Si lo actualizas, actualiza ambos.
 */

export type CategoriaTip = "cocina" | "baño" | "lavadora" | "riego" | "almacenamiento";

export interface Tip {
  categoria: CategoriaTip;
  texto: string;
}

export const CATEGORIAS: { id: CategoriaTip; label: string; emoji: string }[] = [
  { id: "cocina", label: "Cocina", emoji: "🍳" },
  { id: "baño", label: "Baño", emoji: "🚿" },
  { id: "lavadora", label: "Lavadora", emoji: "🧺" },
  { id: "riego", label: "Riego", emoji: "🌱" },
  { id: "almacenamiento", label: "Almacenamiento", emoji: "🚰" },
];

export const TIPS_AGUA: Tip[] = [
  { categoria: "cocina", texto: "🍳 Lava trastes en una tina con agua jabonosa y enjuaga con poca agua, en lugar de dejar la llave abierta. Ahorras hasta 80 litros por lavada." },
  { categoria: "cocina", texto: "🥦 Lava frutas y verduras en un recipiente, no bajo el chorro. El agua que sobra sirve para regar plantas." },
  { categoria: "cocina", texto: "💡 Descongela alimentos en el refrigerador o al ambiente, no con agua corriente. Cada vez ahorras decenas de litros." },
  { categoria: "baño", texto: "🚿 Báñate en menos de 5 minutos. Cada minuto ahorrado evita gastar entre 10 y 18 litros, dependiendo de tu regadera." },
  { categoria: "baño", texto: "🪣 Mientras esperas que salga el agua caliente, recoge el agua fría en una cubeta. Sirve para WC, trapeador o plantas." },
  { categoria: "baño", texto: "🦷 Cierra la llave mientras te cepillas los dientes o te enjabonas. Solo eso ahorra hasta 8 litros cada vez." },
  { categoria: "baño", texto: "🚽 Coloca una botella de 1 L con tapa cerrada (con un poco de arena dentro) en el tanque del WC. Ahorras 1 L en cada descarga." },
  { categoria: "lavadora", texto: "🧺 Usa la lavadora con carga completa. Una carga completa gasta lo mismo que una pequeña, pero rinde más." },
  { categoria: "lavadora", texto: "💧 El agua del último enjuague de la lavadora puedes reutilizarla para lavar el patio o el trapeador." },
  { categoria: "lavadora", texto: "👕 Si compras una lavadora, busca las de carga frontal: gastan entre 30 % y 50 % menos agua que las de carga superior." },
  { categoria: "riego", texto: "🌱 Riega plantas temprano en la mañana o al anochecer. A pleno sol se evapora más de la mitad del agua." },
  { categoria: "riego", texto: "🪴 Reúne agua de lluvia con cubetas en el patio o azotea — en CDMX llueve bastante en mayo-octubre." },
  { categoria: "riego", texto: "🌵 Si vas a poner plantas nuevas, elige especies endémicas del Valle de México como salvias, cempasúchil o agaves: necesitan poca agua." },
  { categoria: "almacenamiento", texto: "🚰 Lava tu tinaco al menos cada 6 meses. Un tinaco limpio evita sedimentos y enfermedades, y mejora la calidad del agua almacenada." },
  { categoria: "almacenamiento", texto: "🧼 Usa cloro de uso doméstico (4 gotas por litro de agua almacenada para consumo) si dudas de la calidad del tandeo." },
  { categoria: "almacenamiento", texto: "🛢️ Si vives en zona de tandeo frecuente (varias colonias del Edomex y CDMX), ten cubetas o tambos limpios siempre listos para llenarlos rápido." },
  { categoria: "almacenamiento", texto: "🔧 Revisa fugas en tu casa cada mes: una llave goteando puede tirar 30 litros al día. Repararla cuesta menos que el desperdicio." },
];

export const PASOS_LIMPIEZA_TINACO = [
  "Vacíalo casi por completo. Cierra la llave de paso de la red para que no entre más agua.",
  "Cepilla paredes y fondo con agua jabonosa (jabón neutro). No uses cloro puro: daña el plástico.",
  "Enjuaga con cubetas de agua limpia 2 o 3 veces.",
  "Desinfecta con 1 L de cloro doméstico por cada 1000 L de capacidad. Deja actuar 30 minutos.",
  "Enjuaga otra vez y déjalo llenarse normalmente.",
];
