import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Los Toneles",
    short_name: "Los Toneles",
    description:
      "Comida típica hondureña en Tegucigalpa. Pide en línea y recoge en el local.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf3e7",
    theme_color: "#1e3a5f",
    lang: "es-HN",
    orientation: "portrait",
    categories: ["food", "shopping"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Ver menú",
        short_name: "Menú",
        description: "Explora los platillos de Los Toneles",
        url: "/menu",
      },
      {
        name: "Mis pedidos",
        short_name: "Pedidos",
        description: "Revisa el estado de tus pedidos",
        url: "/orders",
      },
      {
        name: "Favoritos",
        short_name: "Favoritos",
        description: "Tus platillos guardados",
        url: "/favorites",
      },
    ],
  };
}
