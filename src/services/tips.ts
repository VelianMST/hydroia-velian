export type CategoriaTip = "cocina" | "baño" | "lavadora" | "riego" | "almacenamiento";

export interface Tip {
  categoria: CategoriaTip;
  texto: string;
}

export const TIPS_AGUA: Tip[] = [
  // Cocina
  {
    categoria: "cocina",
    texto:
      "🍳 Lava trastes en una tina con agua jabonosa y enjuaga con poca agua, en lugar de dejar la llave abierta. Ahorras hasta 80 litros por lavada.",
  },
  {
    categoria: "cocina",
    texto:
      "🥦 Lava frutas y verduras en un recipiente, no bajo el chorro. El agua que sobra sirve para regar plantas.",
  },
  {
    categoria: "cocina",
    texto:
      "💡 Descongela alimentos en el refrigerador o al ambiente, no con agua corriente. Cada vez ahorras decenas de litros.",
  },

  // Baño
  {
    categoria: "baño",
    texto:
      "🚿 Báñate en menos de 5 minutos. Cada minuto ahorrado evita gastar entre 10 y 18 litros, dependiendo de tu regadera.",
  },
  {
    categoria: "baño",
    texto:
      "🪣 Mientras esperas que salga el agua caliente, recoge el agua fría en una cubeta. Sirve para WC, trapeador o plantas.",
  },
  {
    categoria: "baño",
    texto:
      "🦷 Cierra la llave mientras te cepillas los dientes o te enjabonas. Solo eso ahorra hasta 8 litros cada vez.",
  },
  {
    categoria: "baño",
    texto:
      "🚽 Coloca una botella de 1 L con tapa cerrada (con un poco de arena dentro) en el tanque del WC. Ahorras 1 L en cada descarga.",
  },

  // Lavadora
  {
    categoria: "lavadora",
    texto:
      "🧺 Usa la lavadora con carga completa. Una carga completa gasta lo mismo que una pequeña, pero rinde más.",
  },
  {
    categoria: "lavadora",
    texto:
      "💧 El agua del último enjuague de la lavadora puedes reutilizarla para lavar el patio o el trapeador.",
  },
  {
    categoria: "lavadora",
    texto:
      "👕 Si compras una lavadora, busca las de carga frontal: gastan entre 30 % y 50 % menos agua que las de carga superior.",
  },

  // Riego
  {
    categoria: "riego",
    texto:
      "🌱 Riega plantas temprano en la mañana o al anochecer. A pleno sol se evapora más de la mitad del agua.",
  },
  {
    categoria: "riego",
    texto:
      "🪴 Reúne agua de lluvia con cubetas en el patio o azotea — en CDMX llueve bastante en mayo-octubre.",
  },
  {
    categoria: "riego",
    texto:
      "🌵 Si vas a poner plantas nuevas, elige especies endémicas del Valle de México como salvias, cempasúchil o agaves: necesitan poca agua.",
  },

  // Almacenamiento
  {
    categoria: "almacenamiento",
    texto:
      "🚰 Lava tu tinaco al menos cada 6 meses. Un tinaco limpio evita sedimentos y enfermedades, y mejora la calidad del agua almacenada.",
  },
  {
    categoria: "almacenamiento",
    texto:
      "🧼 Usa cloro de uso doméstico (4 gotas por litro de agua almacenada para consumo) si dudas de la calidad del tandeo.",
  },
  {
    categoria: "almacenamiento",
    texto:
      "🛢️ Si vives en zona de tandeo frecuente (varias colonias del Edomex y CDMX), ten cubetas o tambos limpios siempre listos para llenarlos rápido.",
  },
  {
    categoria: "almacenamiento",
    texto:
      "🔧 Revisa fugas en tu casa cada mes: una llave goteando puede tirar 30 litros al día. Repararla cuesta menos que el desperdicio.",
  },
];

export function tresTipsAleatorios(): Tip[] {
  const copia = [...TIPS_AGUA];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, 3);
}

export const TIPS_LIMPIEZA_TINACO = `🧼 *Cómo limpiar tu tinaco / cisterna*

1. *Vacíalo* casi por completo. Cierra la llave de paso de la red para que no entre más agua.
2. *Cepilla* paredes y fondo con agua jabonosa (jabón neutro). No uses cloro puro: daña el plástico.
3. *Enjuaga* con cubetas de agua limpia 2 o 3 veces.
4. *Desinfecta* con 1 L de cloro doméstico por cada 1000 L de capacidad. Deja actuar 30 minutos.
5. *Enjuaga otra vez* y déjalo llenarse normalmente.

⏰ Repítelo *cada 6 meses* (mínimo).
⚠️ Si el agua de tu colonia llega muy turbia, hazlo cada 3 meses.
🪣 Si encuentras moho o lodo, considera contratar a alguien con equipo profesional.`;
