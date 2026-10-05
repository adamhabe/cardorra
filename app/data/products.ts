export type Product = {
  slug: string;
  name: string;
  category:
    | "booster-box"
    | "elite-trainer-box"
    | "mini-tin"
    | "booster"
    | "collection-box"
    | "ostatni";

  categoryName: string;
  set: string;

  price: number;
  oldPrice?: number;

  stock: number;
  badge?: string;

  image: string;
  emoji: string;

  shortDescription: string;
  description: string;

  contents: string[];
};

export const products: Product[] = [
  {
    slug: "journey-together-booster-box",

    name: "Journey Together Booster Box",

    category: "booster-box",
    categoryName: "Booster Box",

    set: "Scarlet & Violet: Journey Together",

    price: 2999,

    stock: 3,

    badge: "SKLADEM",

    image: "",
    emoji: "📦",

    shortDescription:
      "Celý sealed booster display z edice Journey Together.",

    description:
      "Originální Pokémon TCG Booster Box. Vhodný pro sběratele i hráče, kteří chtějí otevřít větší množství boosterů z jedné edice.",

    contents: [
      "36 booster balíčků",
      "Originálně zapečetěný display",
      "Anglická verze",
    ],
  },

  {
    slug: "destined-rivals-etb",

    name: "Destined Rivals Elite Trainer Box",

    category: "elite-trainer-box",
    categoryName: "Elite Trainer Box",

    set: "Scarlet & Violet: Destined Rivals",

    price: 3299,
    oldPrice: 3499,

    stock: 2,

    badge: "LIMITOVANĚ",

    image: "",
    emoji: "🎴",

    shortDescription:
      "Elite Trainer Box z oblíbené edice Destined Rivals.",

    description:
      "Originální sealed Pokémon TCG Elite Trainer Box. Vhodný do sbírky i k otevření.",

    contents: [
      "Booster balíčky",
      "Obaly na karty",
      "Herní příslušenství",
      "Sběratelský box",
    ],
  },

  {
    slug: "pokemon-mini-tin",

    name: "Pokémon Mini Tin",

    category: "mini-tin",
    categoryName: "Mini Tin",

    set: "Pokémon TCG",

    price: 299,

    stock: 8,

    badge: "SKLADEM",

    image: "",
    emoji: "🥫",

    shortDescription:
      "Malý Pokémon Tin s TCG obsahem.",

    description:
      "Kompaktní sběratelský Mini Tin. Dobrá volba jako menší produkt nebo dárek.",

    contents: [
      "Pokémon Mini Tin",
      "Booster balíčky podle konkrétní edice",
      "Sběratelský obsah podle produktu",
    ],
  },

  {
    slug: "pokemon-booster",

    name: "Pokémon Booster",

    category: "booster",
    categoryName: "Booster",

    set: "Aktuální edice",

    price: 109,

    stock: 24,

    badge: "SKLADEM",

    image: "",
    emoji: "⚡",

    shortDescription:
      "Samostatný sealed Pokémon TCG booster.",

    description:
      "Originálně zabalený Pokémon TCG booster. Konkrétní artwork se může lišit podle dostupnosti.",

    contents: [
      "1 sealed Pokémon TCG booster",
    ],
  },

  {
    slug: "pokemon-collection-box",

    name: "Pokémon Collection Box",

    category: "collection-box",
    categoryName: "Collection Box",

    set: "Pokémon TCG",

    price: 699,

    stock: 6,

    badge: "SKLADEM",

    image: "",
    emoji: "🧰",

    shortDescription:
      "Collection Box s promo kartou a boostery.",

    description:
      "Pokémon TCG Collection Box vhodný jako dárek nebo pro rozšíření sbírky.",

    contents: [
      "Promo karta",
      "Booster balíčky",
      "Další obsah podle konkrétní kolekce",
    ],
  },
];

export const categories = [
  {
    name: "Booster Box",
    slug: "booster-box",
  },

  {
    name: "Elite Trainer Box",
    slug: "elite-trainer-box",
  },

  {
    name: "Mini Tin",
    slug: "mini-tin",
  },

  {
    name: "Booster",
    slug: "booster",
  },

  {
    name: "Collection Box",
    slug: "collection-box",
  },

  {
    name: "Ostatní",
    slug: "ostatni",
  },
];

export function formatPrice(price: number) {
  return (
    new Intl.NumberFormat("cs-CZ").format(price) +
    " Kč"
  );
}