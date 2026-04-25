import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { CategoryPage } from "@/components/CategoryPage";

import dress from "@/assets/p-dress.jpg";
import coord from "@/assets/p-coord.jpg";
import top from "@/assets/p-top.jpg";
import ethnic from "@/assets/p-ethnic.jpg";
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
import jacket from "@/assets/p-jacket.jpg";
import shrug from "@/assets/c-shrug.jpg";
import blazerW from "@/assets/c-blazer-w.jpg";
import coat from "@/assets/c-coat.jpg";
import cape from "@/assets/c-cape.jpg";

import fCotton from "@/assets/f-cotton.jpg";
import fSilk from "@/assets/f-silk.jpg";
import fGeorgette from "@/assets/f-georgette.jpg";
import fRayon from "@/assets/f-rayon.jpg";
import fChiffon from "@/assets/f-chiffon.jpg";
import fLinen from "@/assets/f-linen.jpg";
import fVelvet from "@/assets/f-velvet.jpg";
import fOrganza from "@/assets/f-organza.jpg";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "Shop Women — MEYU" },
      {
        name: "description",
        content:
          "Shop women's dresses, ethnic, bottom wear & outerwear. Vibrant luxury fashion curated by MEYU.",
      },
      { property: "og:title", content: "Shop Women — MEYU" },
      {
        property: "og:description",
        content: "Vibrant luxury fashion for women — ethnic, dresses, bottom wear & outerwear.",
      },
    ],
  }),
  component: WomenPage,
});

function WomenPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CategoryPage
        gender="women"
        pageTitle="Shop Women"
        breadcrumb="Women"
        pageKicker="Women · Premium Edit"
        pageBlurb="Explore our wide range of women's fashion — festive couture, everyday luxury and modern silhouettes."
        fabrics={[
          { name: "Cotton", image: fCotton },
          { name: "Silk", image: fSilk },
          { name: "Georgette", image: fGeorgette },
          { name: "Rayon", image: fRayon },
          { name: "Chiffon", image: fChiffon },
          { name: "Linen", image: fLinen },
          { name: "Velvet", image: fVelvet },
          { name: "Organza", image: fOrganza },
        ]}
        shopMenu={[
          { name: "Shop All", image: dress },
          { name: "Dresses", image: dress },
          { name: "Tops", image: top },
          { name: "Co-ord Sets", image: coord },
          { name: "Ethnic Wear", image: ethnic },
        ]}
        featured={[
          { name: "Dresses", image: dress, badge: "Trending" },
          { name: "Co-ord Sets", image: coord, badge: "New" },
          { name: "Tops", image: top },
          { name: "Ethnic", image: ethnic, badge: "Hot" },
        ]}
        sections={[
          {
            title: "Ethnic Wear",
            subtitle: "Festive · Couture",
            cols: 3,
            items: [
              { name: "Kurtis", image: kurti, badge: "Bestseller" },
              { name: "Sarees", image: saree, badge: "Silk" },
              { name: "Lehenga", image: lehenga, badge: "Bridal" },
              { name: "Anarkali", image: anarkali },
              { name: "Dupattas", image: dupatta },
            ],
          },
          {
            title: "Bottom Wear",
            subtitle: "Everyday · Edit",
            cols: 5,
            items: [
              { name: "Jeans", image: jeans },
              { name: "Trousers", image: trousers },
              { name: "Skirts", image: skirt },
              { name: "Palazzo", image: palazzo },
              { name: "Shorts", image: shorts },
            ],
          },
          {
            title: "Outerwear",
            subtitle: "Layer · Luxe",
            cols: 5,
            items: [
              { name: "Jackets", image: jacket },
              { name: "Shrugs", image: shrug },
              { name: "Blazers", image: blazerW },
              { name: "Coats", image: coat },
              { name: "Capes", image: cape },
            ],
          },
        ]}
      />
      <Footer />
      <AIChat />
    </div>
  );
}
