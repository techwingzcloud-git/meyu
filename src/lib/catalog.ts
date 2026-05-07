// Category-specific image imports (each image used in its matching category)
import dress from "@/assets/p-dress.jpg";
import coord from "@/assets/p-coord.jpg";
import topImg from "@/assets/p-top.jpg";
import ethnic from "@/assets/p-ethnic.jpg";
import shirt from "@/assets/p-shirt.jpg";
import tshirt from "@/assets/p-tshirt.jpg";
import jacket from "@/assets/p-jacket.jpg";
import mensEthnic from "@/assets/p-mens-ethnic.jpg";

import kurti from "@/assets/c-kurti.jpg";
import saree from "@/assets/c-saree.jpg";
import lehenga from "@/assets/c-lehenga.jpg";
import anarkali from "@/assets/c-anarkali.jpg";
import dupatta from "@/assets/c-dupatta.jpg";

import jeans from "@/assets/c-jeans.jpg";
import trousers from "@/assets/c-trousers.jpg";
import skirt from "@/assets/c-skirt.jpg";
import palazzo from "@/assets/c-palazzo.jpg";
import shorts from "@/assets/c-shorts.jpg";

import shrug from "@/assets/c-shrug.jpg";
import blazerW from "@/assets/c-blazer-w.jpg";
import coat from "@/assets/c-coat.jpg";
import cape from "@/assets/c-cape.jpg";

import shirtCasual from "@/assets/c-shirt-casual.jpg";
import shirtFormal from "@/assets/c-shirt-formal.jpg";
import shirtPrinted from "@/assets/c-shirt-printed.jpg";
import shirtLinen from "@/assets/c-shirt-linen.jpg";

import teePlain from "@/assets/c-tee-plain.jpg";
import teeGraphic from "@/assets/c-tee-graphic.jpg";
import teePolo from "@/assets/c-tee-polo.jpg";
import teeOversized from "@/assets/c-tee-oversized.jpg";

import hoodie from "@/assets/c-hoodie.jpg";
import blazerM from "@/assets/c-blazer-m.jpg";
import chinos from "@/assets/c-chinos.jpg";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  gender: "women" | "men";
  category: string; // canonical category slug used for filtering
};

// Each product uses an image that matches its actual category — never reused across categories.
export const products: Product[] = [
  // WOMEN — Dresses
  {
    id: "w-dress-1",
    name: "Crimson Satin Gown",
    brand: "Maison Aria",
    price: 4499,
    oldPrice: 7999,
    image: dress,
    gender: "women",
    category: "Dresses",
  },
  {
    id: "w-dress-2",
    name: "Ruby Slip Dress",
    brand: "Velour",
    price: 2899,
    oldPrice: 4299,
    image: dress,
    gender: "women",
    category: "Dresses",
  },

  // WOMEN — Tops
  {
    id: "w-top-1",
    name: "Silk Square Top",
    brand: "Ivoire",
    price: 1899,
    oldPrice: 2999,
    image: topImg,
    gender: "women",
    category: "Tops",
  },
  {
    id: "w-top-2",
    name: "Pastel Bow Blouse",
    brand: "Ivoire",
    price: 1599,
    oldPrice: 2199,
    image: topImg,
    gender: "women",
    category: "Tops",
  },

  // WOMEN — Co-ords
  {
    id: "w-coord-1",
    name: "Noir Co-ord Set",
    brand: "Velour",
    price: 3299,
    oldPrice: 5499,
    image: coord,
    gender: "women",
    category: "Co-ord Sets",
  },
  {
    id: "w-coord-2",
    name: "Emerald Two-Piece",
    brand: "Velour",
    price: 3799,
    oldPrice: 5999,
    image: coord,
    gender: "women",
    category: "Co-ord Sets",
  },

  // WOMEN — Ethnic: Kurtis
  {
    id: "w-kurti-1",
    name: "Emerald A-Line Kurti",
    brand: "Suriya",
    price: 1499,
    oldPrice: 2499,
    image: kurti,
    gender: "women",
    category: "Kurtis",
  },
  {
    id: "w-kurti-2",
    name: "Floral Anarkali Kurti",
    brand: "Raahi",
    price: 1799,
    oldPrice: 2799,
    image: kurti,
    gender: "women",
    category: "Kurtis",
  },

  // WOMEN — Ethnic: Sarees
  {
    id: "w-saree-1",
    name: "Ruby Banarasi Saree",
    brand: "Suriya",
    price: 5999,
    oldPrice: 9999,
    image: saree,
    gender: "women",
    category: "Sarees",
  },
  {
    id: "w-saree-2",
    name: "Royal Silk Saree",
    brand: "Heritage",
    price: 7499,
    oldPrice: 11999,
    image: saree,
    gender: "women",
    category: "Sarees",
  },

  // WOMEN — Ethnic: Lehenga
  {
    id: "w-lehenga-1",
    name: "Bridal Pink Lehenga",
    brand: "Raahi",
    price: 12999,
    oldPrice: 19999,
    image: lehenga,
    gender: "women",
    category: "Lehenga",
  },
  {
    id: "w-lehenga-2",
    name: "Festive Gold Lehenga",
    brand: "Suriya",
    price: 9999,
    oldPrice: 15999,
    image: lehenga,
    gender: "women",
    category: "Lehenga",
  },

  // WOMEN — Ethnic: Anarkali
  {
    id: "w-anarkali-1",
    name: "Royal Blue Anarkali",
    brand: "Suriya",
    price: 6999,
    oldPrice: 11999,
    image: anarkali,
    gender: "women",
    category: "Anarkali",
  },

  // WOMEN — Ethnic: Dupattas
  {
    id: "w-dupatta-1",
    name: "Phulkari Dupatta",
    brand: "Heritage",
    price: 1299,
    oldPrice: 1999,
    image: dupatta,
    gender: "women",
    category: "Dupattas",
  },

  // WOMEN — Bottom Wear
  {
    id: "w-jeans-1",
    name: "High-Rise Skinny Jeans",
    brand: "North&Co",
    price: 1899,
    oldPrice: 2799,
    image: jeans,
    gender: "women",
    category: "Jeans",
  },
  {
    id: "w-trousers-1",
    name: "Tailored Wide Trousers",
    brand: "Atelier 9",
    price: 2199,
    oldPrice: 3199,
    image: trousers,
    gender: "women",
    category: "Trousers",
  },
  {
    id: "w-skirt-1",
    name: "Pleated Midi Skirt",
    brand: "Ivoire",
    price: 1799,
    oldPrice: 2499,
    image: skirt,
    gender: "women",
    category: "Skirts",
  },
  {
    id: "w-palazzo-1",
    name: "Floral Palazzo",
    brand: "Suriya",
    price: 1399,
    oldPrice: 1999,
    image: palazzo,
    gender: "women",
    category: "Palazzo",
  },
  {
    id: "w-shorts-1",
    name: "Linen Shorts",
    brand: "Velour",
    price: 999,
    oldPrice: 1499,
    image: shorts,
    gender: "women",
    category: "Shorts",
  },

  // WOMEN — Outerwear
  {
    id: "w-jacket-1",
    name: "Gold-Zip Biker Jacket",
    brand: "Rovere",
    price: 5999,
    oldPrice: 8999,
    image: jacket,
    gender: "women",
    category: "Jackets",
  },
  {
    id: "w-shrug-1",
    name: "Sequin Evening Shrug",
    brand: "Maison Aria",
    price: 2499,
    oldPrice: 3999,
    image: shrug,
    gender: "women",
    category: "Shrugs",
  },
  {
    id: "w-blazer-1",
    name: "Tailored Power Blazer",
    brand: "Atelier 9",
    price: 3999,
    oldPrice: 5999,
    image: blazerW,
    gender: "women",
    category: "Blazers",
  },
  {
    id: "w-coat-1",
    name: "Wool Camel Coat",
    brand: "Rovere",
    price: 6999,
    oldPrice: 10999,
    image: coat,
    gender: "women",
    category: "Coats",
  },
  {
    id: "w-cape-1",
    name: "Embroidered Evening Cape",
    brand: "Maison Aria",
    price: 4499,
    oldPrice: 6999,
    image: cape,
    gender: "women",
    category: "Capes",
  },

  // MEN — Shirts
  {
    id: "m-shirt-c-1",
    name: "Cobalt Casual Shirt",
    brand: "Atelier 9",
    price: 1599,
    oldPrice: 2299,
    image: shirtCasual,
    gender: "men",
    category: "Casual Shirts",
  },
  {
    id: "m-shirt-f-1",
    name: "Midnight Formal Shirt",
    brand: "Atelier 9",
    price: 1799,
    oldPrice: 2499,
    image: shirtFormal,
    gender: "men",
    category: "Formal Shirts",
  },
  {
    id: "m-shirt-p-1",
    name: "Tropical Printed Shirt",
    brand: "Rovere",
    price: 1499,
    oldPrice: 2199,
    image: shirtPrinted,
    gender: "men",
    category: "Printed Shirts",
  },
  {
    id: "m-shirt-l-1",
    name: "Sand Linen Shirt",
    brand: "North&Co",
    price: 1699,
    oldPrice: 2399,
    image: shirtLinen,
    gender: "men",
    category: "Linen Shirts",
  },

  // MEN — T-Shirts
  {
    id: "m-tee-pl-1",
    name: "Essential Plain Tee",
    brand: "North&Co",
    price: 699,
    oldPrice: 1199,
    image: teePlain,
    gender: "men",
    category: "Plain",
  },
  {
    id: "m-tee-g-1",
    name: "Bold Graphic Tee",
    brand: "North&Co",
    price: 899,
    oldPrice: 1499,
    image: teeGraphic,
    gender: "men",
    category: "Graphic",
  },
  {
    id: "m-tee-po-1",
    name: "Emerald Polo Tee",
    brand: "Atelier 9",
    price: 1299,
    oldPrice: 1799,
    image: teePolo,
    gender: "men",
    category: "Polo",
  },
  {
    id: "m-tee-o-1",
    name: "Oversized Drop Tee",
    brand: "Rovere",
    price: 1199,
    oldPrice: 1699,
    image: teeOversized,
    gender: "men",
    category: "Oversized",
  },

  // MEN — Bottom Wear
  {
    id: "m-jeans-1",
    name: "Slim Fit Indigo Jeans",
    brand: "North&Co",
    price: 2199,
    oldPrice: 3199,
    image: jeans,
    gender: "men",
    category: "Jeans",
  },
  {
    id: "m-trousers-1",
    name: "Classic Pleat Trousers",
    brand: "Atelier 9",
    price: 2499,
    oldPrice: 3499,
    image: trousers,
    gender: "men",
    category: "Trousers",
  },
  {
    id: "m-chinos-1",
    name: "Tan Chinos",
    brand: "Rovere",
    price: 1899,
    oldPrice: 2699,
    image: chinos,
    gender: "men",
    category: "Chinos",
  },
  {
    id: "m-shorts-1",
    name: "Tailored Shorts",
    brand: "North&Co",
    price: 1199,
    oldPrice: 1699,
    image: shorts,
    gender: "men",
    category: "Shorts",
  },

  // MEN — Outerwear
  {
    id: "m-jacket-1",
    name: "Heritage Bomber Jacket",
    brand: "Rovere",
    price: 4999,
    oldPrice: 7499,
    image: jacket,
    gender: "men",
    category: "Jackets",
  },
  {
    id: "m-hoodie-1",
    name: "Burgundy Pullover Hoodie",
    brand: "North&Co",
    price: 2299,
    oldPrice: 3299,
    image: hoodie,
    gender: "men",
    category: "Hoodies",
  },
  {
    id: "m-blazer-1",
    name: "Sharp Notch Blazer",
    brand: "Atelier 9",
    price: 5499,
    oldPrice: 7999,
    image: blazerM,
    gender: "men",
    category: "Blazers",
  },

  // MEN — Ethnic
  {
    id: "m-ethnic-1",
    name: "Heritage Sherwani",
    brand: "Raahi",
    price: 8499,
    oldPrice: 13999,
    image: mensEthnic,
    gender: "men",
    category: "Ethnic",
  },
];

export function findProducts(filter: { gender?: "women" | "men"; category?: string; q?: string }) {
  const q = filter.q?.trim().toLowerCase();
  return products.filter((p) => {
    if (filter.gender && p.gender !== filter.gender) return false;
    if (filter.category && p.category.toLowerCase() !== filter.category.toLowerCase()) return false;
    if (q) {
      const hay = `${p.name} ${p.brand} ${p.category} ${p.gender}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export const categories: Record<"women" | "men", { name: string; image: string }[]> = {
  women: [
    { name: "Dresses", image: dress },
    { name: "Co-ord Sets", image: coord },
    { name: "Tops", image: topImg },
    { name: "Sarees", image: saree },
    { name: "Lehenga", image: lehenga },
    { name: "Kurtis", image: kurti },
    { name: "Jeans", image: jeans },
    { name: "Jackets", image: jacket },
  ],
  men: [
    { name: "Casual Shirts", image: shirtCasual },
    { name: "Formal Shirts", image: shirtFormal },
    { name: "Plain", image: teePlain },
    { name: "Polo", image: teePolo },
    { name: "Jeans", image: jeans },
    { name: "Chinos", image: chinos },
    { name: "Hoodies", image: hoodie },
    { name: "Jackets", image: jacket },
  ],
};

export const womenMenu = [
  { title: "Shop", links: ["Shop All", "Dresses", "Tops", "Co-ord Sets", "Ethnic Wear"] },
  { title: "Ethnic", links: ["Kurtis", "Sarees", "Lehenga", "Anarkali", "Dupattas"] },
  { title: "Bottom Wear", links: ["Jeans", "Trousers", "Skirts", "Palazzo", "Shorts"] },
  { title: "Outerwear", links: ["Jackets", "Shrugs", "Blazers", "Coats", "Capes"] },
];

export const menMenu = [
  {
    title: "Shop",
    links: ["Shop All", "Casual Shirts", "Formal Shirts", "Printed Shirts", "Linen Shirts"],
  },
  { title: "T-Shirts", links: ["Plain", "Graphic", "Polo", "Oversized"] },
  { title: "Bottom Wear", links: ["Jeans", "Trousers", "Chinos", "Shorts"] },
  { title: "Outerwear", links: ["Jackets", "Hoodies", "Blazers"] },
];
