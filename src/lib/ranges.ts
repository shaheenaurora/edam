export type RangeKey = "NOURISH" | "CARE" | "DWELL" | "GROW" | "GIVE";

export interface RangeMeta {
  key: RangeKey;
  slug: string;
  name: string;
  line: string;
  role: string;
  description: string;
  image: string;
}

export const RANGES: RangeMeta[] = [
  {
    key: "NOURISH",
    slug: "nourish",
    name: "Nourish",
    line: "What Edam feeds you",
    role: "The repeat engine",
    description:
      "Spices with a named hill behind them, honey with a batch number, tea from a named garden. Kerala's food, honestly labelled and plastic-free.",
    image: "/images/range-nourish.png",
  },
  {
    key: "CARE",
    slug: "care",
    name: "Care",
    line: "What Edam does for your body",
    role: "The margin engine",
    description:
      "Cold-process soaps, traditional oils and everyday care. Real Kerala craft, described by what it is, never by a claim we can't keep.",
    image: "/images/range-care.png",
  },
  {
    key: "DWELL",
    slug: "dwell",
    name: "Dwell",
    line: "What Edam brings into your home",
    role: "The aesthetic engine",
    description:
      "Terracotta, coir, handloom and natural fragrance. Useful, beautiful objects made by hands you can name.",
    image: "/images/range-dwell.png",
  },
  {
    key: "GROW",
    slug: "grow",
    name: "Grow",
    line: "What Edam plants with you",
    role: "The signature",
    description:
      "Seeds, grow kits and living plants with honest guidance and a replacement promise, because the point is keeping something alive.",
    image: "/images/range-grow.png",
  },
  {
    key: "GIVE",
    slug: "give",
    name: "Give",
    line: "What Edam helps you give",
    role: "The AOV engine",
    description:
      "Hampers, gift cards and trees in someone's name. Kerala, sent home, with the tree always inside the price.",
    image: "/images/range-give.png",
  },
];

export function rangeBySlug(slug: string): RangeMeta | undefined {
  return RANGES.find((r) => r.slug === slug.toLowerCase());
}
