import { ImageResponse } from "next/og";

/**
 * Ícono de la app generado en el servidor (sin archivos binarios).
 * Cuadro azul HydroIA con una gota blanca centrada. La gota ocupa ~36 % del
 * lienzo, dentro de la "zona segura" para que también sirva como ícono
 * maskable en Android.
 */
export function renderAppIcon(size: number): ImageResponse {
  const drop = Math.round(size * 0.42);
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1f4e79, #2e75b6)",
          borderRadius: Math.round(size * 0.22),
        }}
      >
        <div
          style={{
            width: drop,
            height: drop,
            background: "white",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(45deg)",
            boxShadow: "0 0 0 0",
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
