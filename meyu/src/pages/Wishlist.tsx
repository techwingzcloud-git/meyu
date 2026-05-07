import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ProductCard";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlist } = useShop();
  const nav = useNavigate();

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-32 text-center">
          <h2 className="font-display text-3xl mb-4">Sign in to view wishlist</h2>
          <Button variant="hero" size="lg" onClick={() => nav("/login")}>Sign In</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10 md:py-16">
        <div className="text-center mb-12">
          <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-5xl">Your Wishlist</h1>
          <p className="text-muted-foreground text-sm mt-2">{wishlist.length} saved item{wishlist.length !== 1 && "s"}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">Tap the heart on any product to save it here.</p>
            <Link to="/shop"><Button variant="hero">Browse Collection</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map((w, i) => w.product && (
              <ProductCard key={w.id} product={w.product} index={i} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Wishlist;
