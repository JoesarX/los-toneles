export type Category = {
  slug: string;
  title: string;
  dbName: string;
  description: string;
  kicker: string;
  img: string;
  accent: "terracotta" | "olive" | "amber";
};

export const categories: Category[] = [
  {
    slug: "comida",
    title: "Comida",
    dbName: "Comida",
    kicker: "Platos de la casa",
    description:
      "Baleadas, pastelitos, tajadas, taquitos y los clásicos que nos acompañan desde hace más de 50 años.",
    img: "/comidaPng.png",
    accent: "terracotta",
  },
  {
    slug: "bebida",
    title: "Bebidas",
    dbName: "Bebida",
    kicker: "Bien frías",
    description:
      "Refrescos, jugos y bebidas para acompañar cada bocado. Siempre servidas bien frías.",
    img: "/bebidaPng.png",
    accent: "olive",
  },
  {
    slug: "otros",
    title: "Otros",
    dbName: "Otros",
    kicker: "Para completar",
    description:
      "Postres, heladitos y antojitos para cerrar con algo dulce o refrescante.",
    img: "/otrosPng.png",
    accent: "amber",
  },
];

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug.toLowerCase());
