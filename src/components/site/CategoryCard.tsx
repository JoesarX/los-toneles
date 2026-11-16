import type { Category } from "@/data/categories";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const accents = {
  terracotta: {
    orb: "bg-terracotta/20",
    badge: "bg-terracotta/10 text-terracotta-deep",
    circle: "group-hover:bg-terracotta",
  },
  olive: {
    orb: "bg-olive/20",
    badge: "bg-olive/15 text-olive",
    circle: "group-hover:bg-olive",
  },
  amber: {
    orb: "bg-amber/25",
    badge: "bg-amber/20 text-terracotta-deep",
    circle: "group-hover:bg-amber group-hover:text-espresso",
  },
} as const;

const CategoryCard = ({ category }: { category: Category }) => {
  const accent = accents[category.accent];

  return (
    <Link
      href={`/menu/${category.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-sand bg-white/60 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div
        className={`absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl ${accent.orb}`}
        aria-hidden="true"
      />

      <div className="relative h-44 sm:h-52">
        <Image
          src={category.img}
          alt={category.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="relative mt-4 flex flex-1 flex-col">
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${accent.badge}`}
        >
          {category.kicker}
        </span>
        <h3 className="mt-3 font-display text-3xl font-semibold text-tonel">
          {category.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-espresso/65">
          {category.description}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-tonel">
          Ver {category.title.toLowerCase()}
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-tonel text-cream transition ${accent.circle}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
