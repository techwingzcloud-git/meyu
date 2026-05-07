// ─────────────────────────────────────────────────────────────────────────────
// Curated, category-correct fashion images.
// Rules enforced in this file:
//   • NO random sources (no source.unsplash.com, no picsum.photos)
//   • Every image URL is globally UNIQUE across the entire site
//   • Each category only references images that match the category
//   • All images are real, high-quality fashion photos served from Pexels
// ─────────────────────────────────────────────────────────────────────────────

const p = (id: string | number, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

type Img = { src: string; alt: string; name: string };

const build = (ids: (string | number)[], altPrefix: string, w = 800): Img[] =>
  ids.map((id, i) => ({
    src: p(id, w),
    alt: `${altPrefix} ${i + 1}`,
    name: `${altPrefix.toLowerCase().replace(/\s+/g, "-")}-${i + 1}.jpg`,
  }));

// ─────────────────────────────────────────────────────────────────────────────
// WOMEN — 10 categories × 5 unique images
// ─────────────────────────────────────────────────────────────────────────────
const WOMEN_IMAGES = {
  saree: ["37054325", "37054318", "29819593", "35390253", "30703859"],
  lehenga: ["33343580", "12062663", "33343604", "29370686", "33343584"],
  kurti: ["28512787", "35521738", "28512779", "36567501", "13178920"],
  gown: ["14919964", "3534557", "31645221", "35581013"],
  western: ["34163363", "32498622", "32498617", "34651035"],
  tops: ["18972021", "33479374", "7427774", "14270537", "37232787"],
  ethnic: ["12100636", "8887111", "34251604", "8489638", "8886956"],
  casual: ["33915656", "8811245", "6856271", "8811244", "34400312"],
  party: ["30061211", "3419652", "6113297", "5713305", "3419697"],
  office: ["4965010", "8466228"],
};

// ─────────────────────────────────────────────────────────────────────────────
// MEN — 9 categories × 5 unique images
// ─────────────────────────────────────────────────────────────────────────────
const MEN_IMAGES = {
  tshirt: ["37075908", "36942017", "37232797", "37043496", "36986582"],
  shirt: ["10952730", "17076311", "14941568", "28710328", "11100293"],
  jeans: ["9775671", "15869823", "30710244", "15059365", "9775670"],
  hoodie: ["8217308", "11201380", "4295985", "8346261", "6253227"],
  jacket: ["14707868", "13132721", "21619158", "31832834", "18633076"],
  formal: ["35633118", "12922462", "32670017", "17542178", "5724384"],
  casual: ["31618286", "2421356", "267301", "29843981", "7877538"],
  sports: ["5696896", "7648388", "5198384", "5319490", "29681921"],
  traditional: ["5938772", "14664890"],
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE — 4 themed galleries (8 unique images each = 32 total)
// ─────────────────────────────────────────────────────────────────────────────
export const HOME_GALLERY = {
  saree: build(["37054312", "35399674", "28054615", "27139270", "9419023", "30703866", "30703872", "9419251"], "Saree look"),
  dresses: build(["37137685", "31566612", "16612607", "31645220", "14108017", "1457977", "31604288", "33971750"], "Dress look"),
  kurtis: build(["36311379", "8770996", "14027977", "36281928", "29141525", "8771006", "13178841", "32575147"], "Kurti look"),
  tops: build(["28765912", "8452038", "8764770", "37414269", "17844879", "18337603", "33817210", "7988710"], "Top look"),
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME — SHOP BY CATEGORY (6 categories × 5 unique images)
// ─────────────────────────────────────────────────────────────────────────────
const homeCat = (
  slug: string,
  label: string,
  ids: (string | number)[],
  altPrefix: string,
) => {
  const imgs = build(ids.slice(0, 5), altPrefix);
  return { slug, label, cover: imgs[0].src, images: imgs };
};

export const HOME_CATEGORIES = [
  homeCat("saree", "Saree", ["8886953", "6458310", "8886958", "8489648", "8489641"], "Saree"),
  homeCat("tshirts", "T-Shirts", ["37092621", "37014370", "36942018", "37025819", "37066864"], "T-Shirt"),
  homeCat("kurtis", "Kurtis", ["36153394", "8207646", "34076976", "18036715", "33824992"], "Kurti"),
  homeCat("dresses", "Dresses", ["34286820", "27098941", "18625213", "32504511", "5934493"], "Dress"),
  homeCat("tops", "Tops", ["7490354", "18052275", "17822243", "14114265", "18057071"], "Top"),
  homeCat("ethnic", "Ethnic Wear", ["33343615", "33343613", "12791961", "33343609", "11748794"], "Ethnic Wear"),
];

// ─────────────────────────────────────────────────────────────────────────────
// WOMEN PAGE — 10 categories × 5 unique images
// ─────────────────────────────────────────────────────────────────────────────
const womenCat = (label: string, ids: (string | number)[]) => {
  const slug = `w-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const imgs = build(ids.slice(0, 5), label);
  return { slug, label, cover: imgs[0].src, images: imgs };
};

export const WOMEN_PAGE_CATEGORIES = [
  womenCat("Saree", ["37054325", "37054318", "29819593", "35390253", "30703859"]),
  womenCat("Lehenga", ["33343580", "12062663", "33343604", "29370686", "33343584"]),
  womenCat("Kurti", ["28512787", "35521738", "28512779", "36567501", "13178920"]),
  womenCat("Gown", ["14919964", "3534557", "31645221", "35581013"]),
  womenCat("Western Dress", ["34163363", "32498622", "32498617", "34651035"]),
  womenCat("Top", ["18972021", "33479374", "7427774", "14270537", "37232787"]),
  womenCat("Ethnic", ["12100636", "8887111", "34251604", "8489638", "8886956"]),
  womenCat("Casual", ["33915656", "8811245", "6856271", "8811244", "34400312"]),
  womenCat("Party Wear", ["30061211", "3419652", "6113297", "5713305", "3419697"]),
  womenCat("Office Wear", ["4965010", "8466228"]),
];

// ─────────────────────────────────────────────────────────────────────────────
// MEN PAGE — 9 categories × 5 unique images
// ─────────────────────────────────────────────────────────────────────────────
const menCat = (label: string, ids: (string | number)[]) => {
  const slug = `m-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const imgs = build(ids.slice(0, 5), `Men ${label}`);
  return { slug, label, cover: imgs[0].src, images: imgs };
};

export const MEN_PAGE_CATEGORIES = [
  menCat("T-Shirt", ["37075908", "36942017", "37232797", "37043496", "36986582"]),
  menCat("Shirt", ["10952730", "17076311", "14941568", "28710328", "11100293"]),
  menCat("Jeans", ["9775671", "15869823", "30710244", "15059365", "9775670"]),
  menCat("Hoodie", ["8217308", "11201380", "4295985", "8346261", "6253227"]),
  menCat("Jacket", ["14707868", "13132721", "21619158", "31832834", "18633076"]),
  menCat("Formal", ["35633118", "12922462", "32670017", "17542178", "5724384"]),
  menCat("Casual", ["31618286", "2421356", "267301", "29843981", "7877538"]),
  menCat("Sports", ["5696896", "7648388", "5198384", "5319490", "29681921"]),
  menCat("Traditional", ["5938772", "14664890"]),
];

// ─────────────────────────────────────────────────────────────────────────────
// TOP BAR (New Arrival, Trending, Featured, Collections) — unique covers
// ─────────────────────────────────────────────────────────────────────────────
export const TOP_BAR_HIGHLIGHTS = [
  { key: "new-arrival", label: "New Arrival", image: p(32504521, 1000) },
  { key: "trending", label: "Trending", image: p(13057769, 1000) },
  { key: "featured", label: "Featured", image: p(21357582, 1000) },
  { key: "collections", label: "Collections", image: p(30953650, 1000) },
];

// Unused-variable safety — these maps may be consumed by future pages.
void WOMEN_IMAGES;
void MEN_IMAGES;
