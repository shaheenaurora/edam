/**
 * Edam: seed script
 * Run: npx tsx db/seed.ts
 * Seeds makers, the launch catalogue, tree batches + trees, journal posts.
 */
import { getDb } from "../api/queries/connection";
import { makers, products, treeBatches, trees, journalPosts } from "./schema";

const MAKERS = [
  {
    slug: "periyar-pepper-collective",
    name: "Periyar Spice Collective",
    kind: "Farmer collective · FPO",
    place: "Kumily, Idukki",
    summary: "Forty-one smallholder families growing pepper, cardamom and turmeric on the cardamom hills.",
    story:
      "The Periyar Spice Collective is a farmer producer organisation of forty-one smallholder families around Kumily, on the edge of the Periyar forests. Their pepper vines climb shade trees the way they have for generations. No estates, no middlemen marking up four times before the spice leaves the district. Every lot Edam buys is dried, graded and packed at the collective's own yard, and the farmer who grew it is named on the batch record.",
    image: "/images/maker-pepper.jpg",
  },
  {
    slug: "munnar-high-range-growers",
    name: "Munnar High-Range Growers",
    kind: "Named tea & tisane growers",
    place: "Munnar, Idukki",
    summary: "A small group of high-range growers producing single-garden tea and herbal infusions.",
    story:
      "High in the Munnar ranges, a handful of small gardens produce tea that never enters the auction system. It is plucked, withered and rolled in small lots, and sold with the garden's name on it. Edam's tea and infusions come from this group. The After-Travel Herbal Tea is blended to Edam's own recipe from their lemongrass, tulsi and dried ginger.",
    image: "/images/product-tea.jpg",
  },
  {
    slug: "nilgiri-beekeepers",
    name: "Nilgiri Beekeepers Collective",
    kind: "Beekeeper collective",
    place: "Nilambur fringe, Malappuram",
    summary: "Wild and apiary honey harvested at the forest fringe, every batch tested to standard.",
    story:
      "The collective's hives sit at the forest fringe where the flowering shifts with the season, which is why no two batches of this honey taste the same. Every batch Edam lists is tested for adulteration and conformance to the FSSAI honey standard before it is packed. The certificate belongs to the batch, not to the marketing.",
    image: "/images/product-honey.jpg",
  },
  {
    slug: "bharanikkavu-womens-collective",
    name: "Bharanikkavu Women's Collective",
    kind: "Kudumbashree unit · SHG",
    place: "Bharanikkavu, Alappuzha",
    summary: "A women's self-help group making soaps, oils, preserves and breakfast mixes in small batches.",
    story:
      "Fourteen women, one bright workshop, and recipes that were household knowledge long before they were products. The collective makes Edam's cold-process soaps, herbal oils, pickles and breakfast mixes, each batch small enough that the person who made it can initial the packing slip. Coconut for the oils and soaps comes from their own neighbourhood mills.",
    image: "/images/maker-soap.jpg",
  },
  {
    slug: "chalakudy-terracotta-studio",
    name: "Chalakudy Clay Studio",
    kind: "Artisan potters",
    place: "Chalakudy, Thrissur",
    summary: "A two-generation potter's studio throwing terracotta and ceramic tableware with food-safe glazes.",
    story:
      "The studio sits close enough to the river that the clay is dug locally. Terracotta glasses and pots leave the kiln unglazed, the way they have always been; the ceramic mugs and serveware carry food-safe, lead-free glazes, certification on file. Natural variation between pieces is not a defect here; it is the signature of a wheel, not a mould.",
    image: "/images/maker-potter.jpg",
  },
  {
    slug: "alappuzha-coir-craft",
    name: "Alappuzha Coir & Cane Cluster",
    kind: "Artisan cluster",
    place: "Alappuzha",
    summary: "Coir, cane and bamboo utility woven by artisan families in the backwater belt.",
    story:
      "Coir is Kerala's original plastic-free material: coconut husk, retted in backwater, spun and woven by hand. The cluster's baskets, mats and everyday goods are made in family workshops across the Alappuzha belt. Nothing here is injection-moulded to look handmade; it simply is.",
    image: "/images/range-dwell.jpg",
  },
  {
    slug: "nila-handloom-weavers",
    name: "Nila Handloom Weavers",
    kind: "Handloom cluster",
    place: "Balaramapuram, Thiruvananthapuram",
    summary: "Kasavu handloom woven on pit looms: table linen, throws and towels with real gold-toned borders.",
    story:
      "Balaramapuram's weavers have carried the kasavu tradition for generations: unbleached cotton with the familiar gold-toned border, woven on pit looms in homes around the town. Edam's table linen and throws are woven to order, which means lead times are real and every bolt is slightly its own.",
    image: "/images/range-dwell.jpg",
  },
  {
    slug: "palakkad-seed-savers",
    name: "Palakkad Seed Savers",
    kind: "Licensed seed supplier & native seed network",
    place: "Palakkad",
    summary: "Open-pollinated flower, herb and native tree seed, plus the grow kits assembled by hand.",
    story:
      "A licensed seed supplier working with a network of small growers to keep open-pollinated and native varieties in circulation. They supply Edam's seed packets, seed balls and seed paper, and assemble the grow kits by hand: coir pot, growing medium, seed and a guide written for Indian weather, not a translated leaflet.",
    image: "/images/range-grow.jpg",
  },
] as const;

type MakerSlug = (typeof MAKERS)[number]["slug"];

interface P {
  slug: string;
  name: string;
  range: "NOURISH" | "CARE" | "DWELL" | "GROW" | "GIVE";
  category: string;
  price: number;
  unit: string;
  shortLine: string;
  description: string;
  usage?: string;
  image: string;
  maker: MakerSlug;
  giftReady?: boolean;
  livePlant?: boolean;
  featured?: boolean;
  hero?: boolean;
  stock?: number;
}

const RANGE_IMG: Record<string, string> = {
  NOURISH: "/images/range-nourish.jpg",
  CARE: "/images/range-care.jpg",
  DWELL: "/images/range-dwell.jpg",
  GROW: "/images/range-grow.jpg",
  GIVE: "/images/range-give.jpg",
};

const PRODUCTS: P[] = [
  // ---------- NOURISH ----------
  { slug: "malabar-black-pepper", name: "Malabar Black Pepper", range: "NOURISH", category: "Spices & blends", price: 340, unit: "100 g tin", shortLine: "The original black gold, grown on shade trees in the cardamom hills.", description: "Bold, resinous and properly hot: the pepper that made Malabar famous, grown by smallholder families around Kumily and graded at the collective's own yard. Whole peppercorns in a tin, with a refill pouch so the tin stays in use.", usage: "Grind fresh over everything. The tin keeps the aroma; refills keep the tin.", image: RANGE_IMG.NOURISH, maker: "periyar-pepper-collective", hero: true, featured: true, stock: 120 },
  { slug: "idukki-cardamom", name: "Idukki Green Cardamom", range: "NOURISH", category: "Spices & blends", price: 520, unit: "50 g jar", shortLine: "High-elevation cardamom, aromatic enough to perfume the shelf.", description: "Plump green pods from Idukki's high ranges, dried slowly to hold their oils. A premium anchor of the range. The kind of cardamom you open just to smell.", usage: "Bruise a pod into tea, payasam or biryani. A little is a lot.", image: RANGE_IMG.NOURISH, maker: "periyar-pepper-collective", featured: true, stock: 80 },
  { slug: "high-curcumin-turmeric", name: "High-Curcumin Turmeric", range: "NOURISH", category: "Spices & blends", price: 180, unit: "150 g pouch", shortLine: "Deep-orange Lakadong-type turmeric, stone-ground in small lots.", description: "A naturally high-curcumin variety with the colour to prove it. Sold as a food, described as a food. Its richness speaks without a health claim.", usage: "A pinch in milk, curries and dosa batter. Stains happily, so wash boards promptly.", image: RANGE_IMG.NOURISH, maker: "periyar-pepper-collective", stock: 150 },
  { slug: "true-cinnamon-quills", name: "True Cinnamon Quills", range: "NOURISH", category: "Spices & blends", price: 220, unit: "50 g pouch", shortLine: "True cinnamon, delicate and sweet, not the hard cassia bark.", description: "Paper-thin quills of true cinnamon with a gentle, sweet warmth. The label says true cinnamon because it is. Cassia is cheaper and louder, and this is neither.", usage: "Simmer in milk, tea and stews; grind fresh for baking.", image: RANGE_IMG.NOURISH, maker: "periyar-pepper-collective", stock: 110 },
  { slug: "malabar-fish-curry-base", name: "Malabar Fish Curry Base", range: "NOURISH", category: "Signature blends", price: 290, unit: "200 g jar", shortLine: "A story in a jar: the coastal curry base, roasted and ground the old way.", description: "Roasted coconut, chilli, coriander, fenugreek and kodampuli, blended to a family recipe from the Malabar coast. This is the range's signature: one jar, a piece of fish, twenty minutes, and dinner tastes like someone's grandmother supervised.", usage: "Simmer a spoonful in coconut milk, add fish or vegetables. Serves four.", image: RANGE_IMG.NOURISH, maker: "bharanikkavu-womens-collective", hero: true, featured: true, giftReady: true, stock: 90 },
  { slug: "sambar-rasam-podi", name: "Sambar & Rasam Podi Duo", range: "NOURISH", category: "Signature blends", price: 160, unit: "2 × 100 g pouches", shortLine: "The two blends a South Indian kitchen reaches for daily.", description: "A fresh-ground sambar podi and a peppery rasam podi, made in weekly batches by the women's collective. High-reorder staples, the quiet engine of the pantry.", usage: "A tablespoon to a pot; adjust salt, not courage.", image: RANGE_IMG.NOURISH, maker: "bharanikkavu-womens-collective", stock: 200 },
  { slug: "raw-forest-honey", name: "Raw Forest Honey", range: "NOURISH", category: "Honey & sweeteners", price: 420, unit: "250 g jar", shortLine: "Forest-fringe honey, batch-tested, never heated or blended.", description: "Raw honey from hives at the Nilambur forest fringe: unheated, unblended, and tested for adulteration before packing. The flavour shifts with the flowering season; the batch number on your jar traces to the test certificate.", usage: "Drizzle, stir, eat from the spoon. Crystallisation is natural; warm gently to reliquefy.", image: "/images/product-honey.jpg", maker: "nilgiri-beekeepers", hero: true, featured: true, giftReady: true, stock: 100 },
  { slug: "palm-jaggery-karupatti", name: "Palm Jaggery (Karupatti)", range: "NOURISH", category: "Honey & sweeteners", price: 150, unit: "400 g block", shortLine: "Dark, mineral-rich karupatti, Kerala's own sweetener.", description: "Sap of the palmyra, cooked down in iron pans to a deep, caramelly block. The honest sweetener for tea, coffee and payasam.", usage: "Grate or shave into hot drinks and sweets.", image: RANGE_IMG.NOURISH, maker: "bharanikkavu-womens-collective", stock: 130 },
  { slug: "munnar-high-grown-tea", name: "Munnar High-Grown Tea", range: "NOURISH", category: "Tea & coffee", price: 310, unit: "100 g caddy", shortLine: "Single-garden tea from the high ranges, plucked in small lots.", description: "A brisk, bright high-grown tea from a named Munnar garden, never the anonymous auction blend. The caddy is reusable; the tea is not the kind you forget in the cupboard.", usage: "One teaspoon, water just off the boil, three minutes.", image: "/images/product-tea.jpg", maker: "munnar-high-range-growers", featured: true, giftReady: true, stock: 140 },
  { slug: "wayanad-estate-coffee", name: "Wayanad Estate Coffee", range: "NOURISH", category: "Tea & coffee", price: 380, unit: "250 g, beans or ground", shortLine: "Shade-grown Wayanad coffee from a named smallholding.", description: "Grown under pepper vines and silver oak in Wayanad, roasted in small batches. Choose whole beans or a filter grind. The bag names the holding it came from.", usage: "Built for the South Indian filter; forgiving everywhere else.", image: RANGE_IMG.NOURISH, maker: "periyar-pepper-collective", stock: 110 },
  { slug: "after-travel-herbal-tea", name: "After-Travel Herbal Tea", range: "NOURISH", category: "Infusions", price: 260, unit: "20 sachets", shortLine: "Lemongrass, tulsi and dry ginger: the cup that ends a journey.", description: "Blended to Edam's own recipe from high-range lemongrass, tulsi and dried ginger. The name is a mood, not a medical claim. It is simply a very good cup after a long day.", usage: "Steep four minutes. No milk. Sit down first.", image: "/images/product-tea.jpg", maker: "munnar-high-range-growers", featured: true, giftReady: true, stock: 120 },
  { slug: "jackfruit-breakfast-mix", name: "Jackfruit Breakfast Mix", range: "NOURISH", category: "Breakfast & mixes", price: 190, unit: "300 g pouch", shortLine: "Kerala's hero fruit, milled into a breakfast worth waking for.", description: "Raw jackfruit flour blended for soft puttu, dosas and porridge, a distinctly Kerala breakfast with a gentle sweetness and plenty of fibre.", usage: "Steam as puttu, or whisk into dosa batter. Pairs with curry leaf anything.", image: RANGE_IMG.NOURISH, maker: "bharanikkavu-womens-collective", featured: true, stock: 150 },
  { slug: "ragi-porridge-mix", name: "Ragi Porridge Mix", range: "NOURISH", category: "Breakfast & mixes", price: 170, unit: "300 g pouch", shortLine: "Stone-milled finger millet with cardamom, five minutes to breakfast.", description: "An everyday health food the way Kerala kitchens have always made it: ragi, a little cardamom, nothing else needed.", usage: "Whisk into water or milk, simmer five minutes, sweeten with karupatti.", image: RANGE_IMG.NOURISH, maker: "bharanikkavu-womens-collective", stock: 160 },
  { slug: "tender-mango-pickle", name: "Tender Mango Pickle", range: "NOURISH", category: "Preserves", price: 240, unit: "200 g jar", shortLine: "Whole tender mangoes in brine and spice, the year-round taste of April.", description: "Tender kannimanga pickled in small batches at the season's start. Sharp, salty, deeply regional. A jar with a long life and a strong opinion.", usage: "A little beside rice, curd rice, kanji. Refrigerate after opening.", image: RANGE_IMG.NOURISH, maker: "bharanikkavu-womens-collective", giftReady: true, stock: 70 },

  // ---------- CARE ----------
  { slug: "turmeric-sandal-glow-bar", name: "Turmeric & Sandal Glow Bar", range: "CARE", category: "Soaps & bath", price: 220, unit: "110 g bar", shortLine: "Cold-process soap with turmeric, sandal and coconut oil, the range's quiet bestseller.", description: "Made by hand in small batches and cured for six weeks. Turmeric and sandalwood in a coconut-oil base. A cleansing bar that smells like a Kerala morning. No whiteners, no brighteners, no promises your skin doesn't need.", usage: "Work up a lather, rinse. Keep dry between uses and it lasts weeks.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", hero: true, featured: true, giftReady: true, stock: 180 },
  { slug: "neem-charcoal-bath-bar", name: "Neem & Charcoal Bath Bar", range: "CARE", category: "Soaps & bath", price: 220, unit: "110 g bar", shortLine: "Cold-process with neem and activated charcoal, for a deep, clean rinse.", description: "The second bar in the bath line: neem's herbal bitterness balanced by charcoal's clean finish, in the same slow-cured coconut-oil base.", usage: "Daily bar for face or body. Keep on a draining dish.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", stock: 160 },
  { slug: "forest-hair-oil", name: "Forest Hair Oil", range: "CARE", category: "Hair", price: 360, unit: "100 ml bottle", shortLine: "Coconut oil infused with hibiscus, amla and curry leaf.", description: "Slow-infused in coconut oil the traditional way: hibiscus, amla, curry leaf, brahmi. Sold as cosmetic care that nourishes and conditions; it does not claim to cure anything, and doesn't need to.", usage: "Warm a little between palms, work through scalp and lengths, wash after an hour.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", featured: true, giftReady: true, stock: 120 },
  { slug: "hibiscus-hair-ritual", name: "Hibiscus Hair Ritual", range: "CARE", category: "Hair", price: 480, unit: "Oil + mask set", shortLine: "A two-step ritual: infused oil and a hibiscus powder mask.", description: "A set built like a ritual: the infused oil for the massage, the hibiscus mask for the wash day. A beautiful gift for someone who needs an hour to themselves.", usage: "Oil first, mask second, an unhurried evening throughout.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", giftReady: true, stock: 60 },
  { slug: "virgin-coconut-oil", name: "Virgin Coconut Oil", range: "CARE", category: "Oils & moisturisers", price: 320, unit: "200 ml bottle", shortLine: "Cold-pressed from neighbourhood coconuts. Kerala in a bottle.", description: "Cold-pressed virgin coconut oil from fresh coconut milk, made in small lots. This SKU is labelled for cosmetic use: skin and hair. (An edible grade follows in Wave 2.)", usage: "A few drops for skin, a spoonful for hair. Solidifies in cool weather. That's purity, not a fault.", image: "/images/product-vco.jpg", maker: "bharanikkavu-womens-collective", hero: true, featured: true, giftReady: true, stock: 140 },
  { slug: "sleep-body-oil", name: "Sleep Body Oil", range: "CARE", category: "Oils & moisturisers", price: 420, unit: "100 ml bottle", shortLine: "A calming blend for the end of the day. Pairs well with the Calm infusion.", description: "A gentle body oil blended for the evening wind-down: coconut and sesame carrying lavender-adjacent Indian botanicals. The name sets a mood; it makes no therapeutic claim.", usage: "After a bath, before bed. Phones optional, discouraged.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", featured: true, giftReady: true, stock: 90 },
  { slug: "nalpamaradi-style-body-oil", name: "Nalpamaradi-Style Body Oil", range: "CARE", category: "Oils & moisturisers", price: 460, unit: "100 ml bottle", shortLine: "The classical four-tree formulation, honestly positioned as cosmetic care.", description: "Made to the classical Nalpamaradi recipe: the barks of four ficus trees in a coconut-oil base. Sold strictly as a cosmetic oil for skin care; the '-style' in the name and the wording on the label are deliberate, and settled with a cosmetics consultant.", usage: "Massage before bath, a few times a week.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", stock: 80 },
  { slug: "coconut-body-butter", name: "Coconut Body Butter", range: "CARE", category: "Oils & moisturisers", price: 340, unit: "100 g jar", shortLine: "Whipped coconut and kokum, an everyday moisturiser of this place.", description: "A whipped, fast-absorbing butter built on coconut and kokum. Kerala at its core, useful everywhere elbows exist.", usage: "Post-bath, post-sun, whenever.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", stock: 100 },
  { slug: "herbal-tooth-powder", name: "Herbal Tooth Powder", range: "CARE", category: "Oral & everyday", price: 150, unit: "80 g jar", shortLine: "The umikkari lineage: a genuinely traditional, plastic-free tooth powder.", description: "Herbal tooth powder in the old umikkari tradition: charcoal, salt and herbs in a glass jar. No tube to throw away, ever.", usage: "A pinch on a damp brush. Different from paste. Give it a week.", image: RANGE_IMG.CARE, maker: "bharanikkavu-womens-collective", stock: 150 },

  // ---------- DWELL ----------
  { slug: "cardamom-soy-candle", name: "Cardamom Grove Candle", range: "DWELL", category: "Fragrance & ambience", price: 450, unit: "180 g, clay pot", shortLine: "Natural wax in a terracotta pot, scented with cardamom and vetiver.", description: "Hand-poured natural wax in a reusable terracotta pot: cardamom, vetiver, a little cedar. Burns clean for about 35 hours; the pot then holds whatever you like.", usage: "First burn: let the pool reach the edge. Trim the wick after.", image: RANGE_IMG.DWELL, maker: "chalakudy-terracotta-studio", hero: true, featured: true, giftReady: true, stock: 90 },
  { slug: "sambrani-incense-cups", name: "Sambrani Incense Cups", range: "DWELL", category: "Fragrance & ambience", price: 180, unit: "12 cups", shortLine: "Traditional benzoin resin cups, the evening fragrance of Kerala homes.", description: "Sambrani (benzoin) blended and pressed into burnable cups, the fragrance that signals evening in a Kerala household.", usage: "Light the rim, let it smoulder in a safe holder.", image: RANGE_IMG.DWELL, maker: "bharanikkavu-womens-collective", stock: 200 },
  { slug: "terracotta-glass-set", name: "Terracotta Glass Set", range: "DWELL", category: "Tableware & terracotta", price: 380, unit: "Set of 4", shortLine: "Unglazed river clay glasses. Water tastes like monsoon soil.", description: "Wheel-thrown from local clay and left unglazed, as terracotta has always been. Water cools gently and takes on the faint, pleasant scent of wet earth. Food-safe by construction.", usage: "Season before first use: soak overnight. Hand-wash, no soap.", image: "/images/maker-potter.jpg", maker: "chalakudy-terracotta-studio", featured: true, stock: 70 },
  { slug: "handthrown-ceramic-mug", name: "Hand-Thrown Ceramic Mug", range: "DWELL", category: "Tableware & terracotta", price: 520, unit: "320 ml", shortLine: "One wheel, one pair of hands, every mug slightly its own.", description: "Thrown on the wheel in Chalakudy and finished in a food-safe, lead-free glaze. No two are identical; that's the point of a wheel.", usage: "Dishwasher-safe, though it prefers a gentle hand.", image: "/images/maker-potter.jpg", maker: "chalakudy-terracotta-studio", featured: true, giftReady: true, stock: 50 },
  { slug: "coir-storage-basket", name: "Coir Storage Basket", range: "DWELL", category: "Eco-utility", price: 340, unit: "Medium, 25 cm", shortLine: "Backwater coir, woven tight. The basket that outlives plastic.", description: "Handwoven coir from the Alappuzha belt. Sturdy, breathable, and honest about what it is.", usage: "Shelf, kitchen, toys. Brush clean.", image: RANGE_IMG.DWELL, maker: "alappuzha-coir-craft", stock: 80 },
  { slug: "bamboo-everyday-set", name: "Bamboo Everyday Set", range: "DWELL", category: "Eco-utility", price: 260, unit: "Cutlery + straws + brush", shortLine: "The plastic-replacement kit that actually replaces plastic.", description: "A bamboo cutlery pair, four straws and a cleaning brush in a cloth roll. Low-cost, genuinely useful, and a real repeat category.", usage: "Rinse after use; dry before rolling away.", image: RANGE_IMG.DWELL, maker: "alappuzha-coir-craft", stock: 140 },
  { slug: "kasavu-table-linen", name: "Kasavu Table Linen Set", range: "DWELL", category: "Textiles & handloom", price: 680, unit: "4 napkins + runner", shortLine: "Balaramapuram handloom. Unbleached cotton, gold-toned border.", description: "Woven on pit looms in Balaramapuram with the familiar kasavu border. Sets a table the way Onam sets a year.", usage: "Gentle machine wash; line-dry in shade to keep the border bright.", image: RANGE_IMG.DWELL, maker: "nila-handloom-weavers", featured: true, giftReady: true, stock: 40 },
  { slug: "handloom-kasavu-throw", name: "Handloom Kasavu Throw", range: "DWELL", category: "Textiles & handloom", price: 1250, unit: "130 × 170 cm", shortLine: "A woven throw with the kasavu border, for chairs, shoulders and photographs.", description: "Handloom cotton throw with a woven kasavu edge. The kind of object a room quietly organises itself around.", usage: "Dry in shade; iron warm.", image: RANGE_IMG.DWELL, maker: "nila-handloom-weavers", giftReady: true, stock: 25 },

  // ---------- GROW ----------
  { slug: "kitchen-herb-grow-kit", name: "Kitchen Herb Grow Kit", range: "GROW", category: "Kits", price: 390, unit: "Boxed kit", shortLine: "Seed, coir pot, growing medium and a guide written for Indian weather.", description: "The single best first GROW product: basil, coriander and mint seed, biodegradable coir pots, organic potting mix, and a guide that assumes a balcony in Kochi, not a garden in Kent. Giftable, ship-safe, and genuinely likely to succeed.", usage: "Sow, water, place in morning sun. First sprouts in about a week.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", hero: true, featured: true, giftReady: true, stock: 110 },
  { slug: "seed-ball-pack", name: "Native Seed Ball Pack", range: "GROW", category: "Seeds & novelties", price: 120, unit: "12 balls", shortLine: "Clay-and-compost balls of native flower seed. Throw and grow.", description: "Native flowering species rolled in clay and compost. Toss them onto bare soil before the rains; the clay protects the seed until the monsoon does its work.", usage: "No digging. Scatter on soil, let rain do the rest.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", giftReady: true, stock: 220 },
  { slug: "plantable-seed-paper", name: "Plantable Seed Paper Cards", range: "GROW", category: "Seeds & novelties", price: 150, unit: "5 cards", shortLine: "Cards that become flowers. The same paper our tree certificates use.", description: "Handmade paper embedded with flower seed. Write on it, gift it, and then, the unusual part, plant it. Edam's tree certificates are printed on the same stock.", usage: "Write, gift, then tear, plant under a finger of soil, water.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", giftReady: true, stock: 180 },
  { slug: "butterfly-pea-seeds", name: "Butterfly-Pea Flower Seeds", range: "GROW", category: "Seeds", price: 90, unit: "Packet, ~20 seeds", shortLine: "The blue-tea flower. Grow it, dry it, brew it.", description: "Shankupushpam, the climbing vine with the impossible blue flower. Grows happily on a balcony trellis; the dried flowers brew a blue tea that turns violet with lime.", usage: "Soak overnight, sow half an inch deep, give it something to climb.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", stock: 250 },
  { slug: "curry-leaf-plant", name: "Curry Leaf Plant, Potted", range: "GROW", category: "Live plants", price: 240, unit: "20–30 cm, coir pot", shortLine: "The kitchen's most loyal plant, in a biodegradable pot.", description: "A young curry leaf plant from the nursery, shipped in its coir pot. Dispatches Monday–Wednesday only, so it never spends a weekend in a warehouse. If it fails in the first month despite honest care, we replace it. That's the promise.", usage: "Sun, light water, patience in year one. Live plants ship early-week only.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", livePlant: true, stock: 45 },
  { slug: "snake-plant-potted", name: "Snake Plant, Potted", range: "GROW", category: "Live plants", price: 320, unit: "25–35 cm, coir pot", shortLine: "Nearly unkillable, quietly beautiful, the beginner's plant.", description: "The forgiving one. Tolerates low light, irregular watering and first-time plant parents. Ships in a coir pot, early in the week, with a care card and the replacement promise.", usage: "Low light fine; water when the soil is dry two knuckles down.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", livePlant: true, stock: 40 },
  { slug: "terrarium-kit", name: "Terrarium Kit", range: "GROW", category: "Kits", price: 590, unit: "Boxed kit", shortLine: "A self-contained green world: glass, moss, stone and two small plants.", description: "Everything for a table-top terrarium: glass vessel, drainage stone, soil, moss and two hardy miniature plants. The gift that looks like you spent the weekend on it.", usage: "Layer, plant, mist. Indirect light; water sparingly.", image: RANGE_IMG.GROW, maker: "palakkad-seed-savers", featured: true, giftReady: true, stock: 35 },

  // ---------- GIVE ----------
  { slug: "the-kerala-pantry", name: "The Kerala Pantry", range: "GIVE", category: "Hampers", price: 1450, unit: "Wooden tray hamper", shortLine: "Pepper, cardamom, honey, tea and the Fish Curry Base, on a reusable tray.", description: "The flagship edible gift: Malabar black pepper, Idukki cardamom, raw forest honey, Munnar tea and the Malabar Fish Curry Base, arranged on a wooden tray that outlives the occasion. A tree is planted in the recipient's name, inside the price, always.", usage: "Ready to gift. A hand-written note comes free at checkout.", image: RANGE_IMG.GIVE, maker: "bharanikkavu-womens-collective", hero: true, featured: true, giftReady: true, stock: 40 },
  { slug: "taste-of-malabar", name: "Taste of Malabar", range: "GIVE", category: "Hampers", price: 980, unit: "Boxed hamper", shortLine: "The signature blends, the pepper, and a recipe card that works.", description: "Built around the Fish Curry Base hero: the coastal curry base, Malabar black pepper, sambar-rasam podis and a recipe card. A story you can cook.", usage: "Ready to gift.", image: RANGE_IMG.GIVE, maker: "bharanikkavu-womens-collective", giftReady: true, stock: 45 },
  { slug: "the-recharge-box", name: "The Recharge Box", range: "GIVE", category: "Hampers", price: 1150, unit: "Boxed hamper", shortLine: "Soap, body oil, bath soak and the Calm tea: self-care, honestly made.", description: "The Glow Bar, Sleep Body Oil and After-Travel Herbal Tea in one box. The stay's evening ritual, sent to someone's door.", usage: "Ready to gift. Include their name for the tree certificate.", image: RANGE_IMG.GIVE, maker: "bharanikkavu-womens-collective", featured: true, giftReady: true, stock: 40 },
  { slug: "the-green-gift", name: "The Green Gift", range: "GIVE", category: "Hampers", price: 890, unit: "Boxed hamper", shortLine: "Grow kit, seed paper, seed balls, and a tree in their name.", description: "The most on-brand box we make: a Kitchen Herb Grow Kit, plantable seed paper and native seed balls, with a tree planted for the recipient. Strong for corporate gifting and CSR-adjacent occasions.", usage: "Ready to gift. Tree certificate addressed to the recipient.", image: RANGE_IMG.GIVE, maker: "palakkad-seed-savers", featured: true, giftReady: true, stock: 50 },
  { slug: "edam-gift-card", name: "Edam Gift Card", range: "GIVE", category: "Cards & vouchers", price: 1000, unit: "Digital", shortLine: "Delivered by email, redeemable across the store.", description: "A digital gift card for the store, delivered by email and never expiring into a support ticket. The low-friction gift that brings a new person to Edam.", usage: "Choose an amount at checkout; the code arrives by email.", image: RANGE_IMG.GIVE, maker: "bharanikkavu-womens-collective", giftReady: true, stock: 999 },
  { slug: "a-tree-in-their-name", name: "A Tree in Their Name", range: "GIVE", category: "Tree gifting", price: 299, unit: "Tree + certificate", shortLine: "A native tree planted with our Kerala partner, certified in their name.", description: "A native tree planted at a named site by our planting partner, with a certificate on seed paper, digital now and plantable on request. For memorials, weddings, birthdays and the quiet occasions. The ledger page shows the batch it joins.", usage: "Tell us the recipient's name at checkout; the certificate follows by email.", image: "/images/tree-planting.jpg", maker: "palakkad-seed-savers", featured: true, giftReady: true, stock: 999 },
];

const BATCHES = [
  {
    code: "BATCH-2026-03-NILAMBUR",
    site: "Nilambur forest fringe, Karulai range",
    district: "Malappuram",
    partner: "Nilambur Vanam Trust",
    species: "Wild jack, kanjiram, neem",
    plantedCount: 820,
    alive12m: 713,
    plantedOn: "18 March 2026",
    image: "/images/tree-planting.jpg",
    note: "Riparian buffer along a seasonal stream. Survival measured at 12 months: 713 of 820, 87%. The losses were mostly one dry spell in January; replanting fills are planned with the same partner.",
    status: "planted" as const,
  },
  {
    code: "BATCH-2026-06-ATHIRAPPILLY",
    site: "Vazhachal forest fringe, river bank",
    district: "Thrissur",
    partner: "Chalakudy River Guardians",
    species: "Bamboo, wild mango, nalpamara mix",
    plantedCount: 640,
    alive12m: null as number | null,
    plantedOn: "2 June 2026",
    image: "/images/tree-planting.jpg",
    note: "Bank stabilisation planting with the river guardians' volunteer corps. First monsoon establishment looks good; the honest 12-month number publishes June 2027.",
    status: "planted" as const,
  },
  {
    code: "BATCH-2026-09-KUMILY",
    site: "Cardamom hill buffer, Kumily",
    district: "Idukki",
    partner: "Periyar Spice Collective",
    species: "Silver oak, wild pepper host trees, jack",
    plantedCount: 392,
    alive12m: null as number | null,
    plantedOn: "21 September 2026",
    image: "/images/tree-planting.jpg",
    note: "Shade-tree buffer planted with the same collective that grows our pepper. The store and the trees share one landscape.",
    status: "planted" as const,
  },
  {
    code: "BATCH-OPEN-VATTAKKAD",
    site: "Vattakkad village commons",
    district: "Thrissur",
    partner: "Chalakudy River Guardians",
    species: "To be set with the panchayat. Natives only",
    plantedCount: 0,
    alive12m: null as number | null,
    plantedOn: "Planting window: June 2027 (pre-monsoon)",
    image: "/images/tree-planting.jpg",
    note: "The open batch. Trees pledged by orders and stays now are assigned here and planted in the pre-monsoon window. Every tree ID on a certificate resolves to this batch until it closes.",
    status: "open" as const,
  },
];

const JOURNAL = [
  {
    slug: "keep-curry-leaf-alive",
    title: "How to keep a curry leaf plant alive (the honest version)",
    excerpt: "Sun, restraint with water, and patience in year one. Everything the plant actually needs, minus the folklore.",
    body: "A curry leaf plant is not difficult. It is just misunderstood. Give it real sun (four hours minimum, a balcony railing is fine), water only when the top two inches of soil are dry, and resist the urge to harvest heavily in the first year. The plant spends year one building roots; year two onwards, it feeds your kitchen for decades.\n\nFeeding: a handful of compost twice a year beats any fertiliser schedule. Buttermilk diluted ten-to-one is the old trick and it works: mild acidity, a little nitrogen.\n\nThe most common killer is kindness: daily watering. The second is a pot with no drainage. Our kits ship in coir pots with a guide written for Indian weather. If yours fails in the first month despite honest care, the replacement promise applies.",
    tag: "Grow guide",
    image: "/images/range-grow.jpg",
    readingMinutes: 4,
    publishedOn: "12 October 2026",
  },
  {
    slug: "what-named-source-means",
    title: "What we mean when we say “a named source”",
    excerpt: "Every Edam product names the farm, collective or artisan who made it. Here is why that sentence is the whole business.",
    body: "A named source is not a marketing device. It is a structural commitment: if the maker's name is on the page, then the maker can be asked about the product, and so can we. It removes the comfortable anonymity that lets supply chains hide.\n\nIt also changes the economics. When forty-one farming families around Kumily are the named source of your pepper, their price is not a line item to be squeezed. It is the story itself. We publish the name, the place, and the photograph because those are the actual assets of this brand.\n\nThe rule we hold: if a product cannot name its source, it does not list. No exceptions for 'good deals'.",
    tag: "From the makers",
    image: "/images/maker-pepper.jpg",
    readingMinutes: 5,
    publishedOn: "28 September 2026",
  },
  {
    slug: "reading-labels-honestly",
    title: "The Field Notes guide to reading labels",
    excerpt: "“Natural”, “ayurvedic”, “chemical-free”: what these words legally mean (often nothing), and what to look for instead.",
    body: "“Chemical-free” means nothing. Everything is chemicals. “Natural” is unregulated on most shelves. “Ayurvedic” on a label can mean a licensed AYUSH medicine or nothing at all; the licence number tells you which.\n\nWhat to look for instead: a full ingredient list (not 'key ingredients'), a batch number, a manufacturer that exists at a real address, and claims that stay in their lane. A soap that cleans is a soap; a soap that cures is either a drug or a lie.\n\nThis is the lens we apply to our own catalogue before we ask you to apply it to anyone else's, including ours.",
    tag: "Field Notes",
    image: "/images/range-nourish.jpg",
    readingMinutes: 6,
    publishedOn: "5 October 2026",
  },
  {
    slug: "why-never-carbon-neutral",
    title: "Why you will never see “carbon-neutral” here",
    excerpt: "We plant trees and we publish whether they lived. That is a different, smaller, more honest sentence.",
    body: "Carbon-neutral is an accounting position: emissions on one side, offsets on the other, netted to zero on paper. We have nothing against accounting, but it is not what we do, and claiming it would be the exact kind of vagueness this brand exists to refuse.\n\nWhat we do is smaller and checkable: every order and every stay plants a tree with a named Kerala partner, at a named site, in a batch you can look up. Twelve months later we publish how many survived, including when the number disappoints. The March batch at Nilambur came in at 87%. That is on the ledger page, not in a footnote.\n\nA tree is not a licence to consume. It is a promise with an ID on it.",
    tag: "The tree",
    image: "/images/tree-planting.jpg",
    readingMinutes: 4,
    publishedOn: "19 October 2026",
  },
];

async function main() {
  const db = getDb();

  console.log("Seeding makers…");
  const makerIdBySlug = new Map<string, number>();
  for (const m of MAKERS) {
    await db.insert(makers).values(m).onDuplicateKeyUpdate({ set: { story: m.story } });
    const [row] = await db.select({ id: makers.id }).from(makers);
    // re-read by slug for correctness
    const found = await db.query.makers.findFirst({ where: (t, { eq }) => eq(t.slug, m.slug) });
    makerIdBySlug.set(m.slug, (found ?? row).id);
  }

  console.log("Seeding products…");
  for (const p of PRODUCTS) {
    const makerId = makerIdBySlug.get(p.maker)!;
    const makerName = MAKERS.find((m) => m.slug === p.maker)!.name;
    const { maker, ...rest } = p;
    await db
      .insert(products)
      .values({ ...rest, makerId, makerName })
      .onDuplicateKeyUpdate({ set: { price: p.price } });
  }

  console.log("Seeding tree batches…");
  const batchIdByCode = new Map<string, number>();
  for (const b of BATCHES) {
    await db.insert(treeBatches).values(b).onDuplicateKeyUpdate({ set: { note: b.note } });
    const found = await db.query.treeBatches.findFirst({ where: (t, { eq }) => eq(t.code, b.code) });
    batchIdByCode.set(b.code, found!.id);
  }

  console.log("Seeding sample trees…");
  const existing = await db.query.trees.findMany({ columns: { id: true }, limit: 1 });
  if (existing.length === 0) {
    const speciesPool: Record<string, string[]> = {
      "BATCH-2026-03-NILAMBUR": ["Wild jack", "Kanjiram", "Neem"],
      "BATCH-2026-06-ATHIRAPPILLY": ["Bamboo", "Wild mango", "Nalpamara mix"],
      "BATCH-2026-09-KUMILY": ["Silver oak", "Jack", "Wild pepper host"],
    };
    let n = 1;
    for (const b of BATCHES) {
      if (b.status !== "planted") continue;
      const batchId = batchIdByCode.get(b.code)!;
      const pool = speciesPool[b.code] ?? ["Native mix"];
      const count = Math.min(b.plantedCount, 60); // representative sample per batch
      for (let i = 0; i < count; i++) {
        const status = i % 9 === 8 ? "pledged" : i % 3 === 0 ? "planted" : "verified";
        await db.insert(trees).values({
          treeNo: `TR-${String(n).padStart(6, "0")}`,
          species: pool[i % pool.length],
          batchId,
          status: status as "pledged" | "planted" | "verified",
        });
        n++;
      }
    }
    console.log(`Seeded ${n - 1} trees.`);
  }

  console.log("Seeding journal…");
  for (const j of JOURNAL) {
    await db.insert(journalPosts).values(j).onDuplicateKeyUpdate({ set: { excerpt: j.excerpt } });
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
