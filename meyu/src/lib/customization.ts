import shirtWhite from "@/assets/custom/shirt-base-white.jpg";
import shirtBlack from "@/assets/custom/shirt-base-black.jpg";
import shirtNavy from "@/assets/custom/shirt-base-navy.jpg";
import shirtMaroon from "@/assets/custom/shirt-base-maroon.jpg";

export type StepKey = "base" | "fabric" | "color" | "collar" | "sleeve" | "fit" | "size";

export const CUSTOM_STEPS: { key: StepKey; label: string }[] = [
  { key: "base",   label: "Base" },
  { key: "fabric", label: "Fabric" },
  { key: "color",  label: "Color" },
  { key: "collar", label: "Collar" },
  { key: "sleeve", label: "Sleeve" },
  { key: "fit",    label: "Fit" },
  { key: "size",   label: "Size" },
];

export const BASE_TYPES = [
  { id: "shirt",  label: "Shirt",  basePrice: 2499, image: shirtWhite },
  { id: "suit",   label: "Suit",   basePrice: 14999, image: shirtBlack },
  { id: "blazer", label: "Blazer", basePrice: 9999, image: shirtNavy },
];

export const FABRICS = [
  { id: "premium-cotton",  name: "Premium Cotton",   priceImpact: 0,    swatch: "#F3EFE6" },
  { id: "egyptian-cotton", name: "Egyptian Cotton",  priceImpact: 800,  swatch: "#E8DDC8" },
  { id: "italian-linen",   name: "Italian Linen",    priceImpact: 1200, swatch: "#D9C9A8" },
  { id: "mulberry-silk",   name: "Mulberry Silk",    priceImpact: 2500, swatch: "#C9B27A" },
  { id: "wool-blend",      name: "Wool Blend",       priceImpact: 1800, swatch: "#3A3A3A" },
];

export const COLORS = [
  { id: "white",   name: "Pearl White", hex: "#FFFFFF", image: shirtWhite },
  { id: "black",   name: "Onyx Black",  hex: "#0F0F0F", image: shirtBlack },
  { id: "navy",    name: "Sapphire Navy", hex: "#0F2A4D", image: shirtNavy },
  { id: "maroon",  name: "Bordeaux",    hex: "#6B1F2A", image: shirtMaroon },
  { id: "ivory",   name: "Ivory",       hex: "#F5EFE0", image: shirtWhite },
  { id: "charcoal",name: "Charcoal",    hex: "#262626", image: shirtBlack },
];

export const COLLARS = [
  { id: "classic",  label: "Classic Point", priceImpact: 0,   description: "Timeless point collar, the everyday classic." },
  { id: "spread",   label: "Spread",        priceImpact: 200, description: "Wide opening, perfect for ties and statement knots." },
  { id: "mandarin", label: "Mandarin",      priceImpact: 300, description: "Stand collar, no fold. Modern minimalist." },
];

export const SLEEVES = [
  { id: "full",  label: "Full Sleeve", priceImpact: 0 },
  { id: "half",  label: "Half Sleeve", priceImpact: -200 },
];

export const FITS = [
  { id: "slim",     label: "Slim",     description: "Body-skimming silhouette." },
  { id: "regular",  label: "Regular",  description: "Comfort with structure." },
  { id: "tailored", label: "Tailored", description: "Sharp, hand-finished tailoring.", priceImpact: 500 },
];

export const SIZES = ["S", "M", "L", "XL", "XXL"];

export interface CustomConfig {
  base: string;
  fabric: string;
  color: string;
  collar: string;
  sleeve: string;
  fit: string;
  size: string;
}

export const calcCustomPrice = (cfg: Partial<CustomConfig>): number => {
  const base = BASE_TYPES.find(b => b.id === cfg.base)?.basePrice || 0;
  const fab = FABRICS.find(f => f.id === cfg.fabric)?.priceImpact || 0;
  const col = COLLARS.find(c => c.id === cfg.collar)?.priceImpact || 0;
  const slv = SLEEVES.find(s => s.id === cfg.sleeve)?.priceImpact || 0;
  const fit = (FITS.find(f => f.id === cfg.fit) as any)?.priceImpact || 0;
  return Math.max(0, base + fab + col + slv + fit);
};

export const getColorImage = (colorId: string) =>
  COLORS.find(c => c.id === colorId)?.image || shirtWhite;
