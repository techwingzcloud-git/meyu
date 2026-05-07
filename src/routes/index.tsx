import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryCircles } from "@/components/CategoryCircles";
import { ProductGrid } from "@/components/ProductGrid";
import { AIChat } from "@/components/AIChat";
import { Footer } from "@/components/Footer";
import { SplashScreen } from "@/components/SplashScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MEYU — Luxury AI Fashion, Intelligently Curated" },
      {
        name: "description",
        content:
          "Discover premium fashion for women & men, personalized by AI. Black & gold luxury shopping experience.",
      },
      { property: "og:title", content: "MEYU — Luxury AI Fashion" },
      { property: "og:description", content: "AI-curated luxury fashion for women & men." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SplashScreen />
      <Navbar />
      <main>
        <Hero />
        <CategoryCircles />
        <ProductGrid />
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}
