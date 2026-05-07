import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Package, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import { useGender } from "@/context/GenderContext";
import { MEN_CATEGORIES, WOMEN_CATEGORIES } from "@/lib/constants";
import { SmartSearch } from "@/components/SmartSearch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { cartCount, wishlistCount } = useShop();
  const { gender, setGender } = useGender();
  const CATEGORIES = gender === "men" ? MEN_CATEGORIES : WOMEN_CATEGORIES;
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/shop?search=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setQ("");
    }
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/50 py-3"
          : "bg-gradient-to-b from-background/70 to-transparent backdrop-blur-sm py-5"
      )}>
        <div className="container flex items-center justify-between gap-6">
          {/* Mobile menu */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-gradient-gold transition-transform group-hover:scale-105">
              MEYU
            </h1>
            <p className="hidden md:block text-[10px] tracking-[0.3em] text-muted-foreground text-center -mt-1">
              SIMPLY YOU
            </p>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {/* Gender switch */}
            <div className="flex items-center gap-1 border border-border rounded-full p-0.5">
              {(["women", "men"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => { setGender(g); nav(g === "men" ? "/men" : "/women"); }}
                  className={cn(
                    "px-4 py-1 text-[11px] tracking-[0.2em] uppercase rounded-full transition-all",
                    gender === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >{g}</button>
              ))}
            </div>
            {CATEGORIES.slice(0, 5).map(c => (
              <NavLink
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="nav-link"
              >
                {c.label}
              </NavLink>
            ))}
            <NavLink to="/customize" className="nav-link text-primary">
              ✦ Customize
            </NavLink>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link to="/wishlist" className="p-2 hover:text-primary transition-colors relative" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 hover:text-primary transition-colors relative" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <DropdownMenuLabel className="font-display">
                    Hello, {profile?.name?.split(" ")[0] || "there"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => nav("/account")}>
                    <User className="h-4 w-4 mr-2" /> My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/orders")}>
                    <Package className="h-4 w-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => nav("/admin")}>
                      <Shield className="h-4 w-4 mr-2 text-primary" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="goldOutline" size="sm" onClick={() => nav("/login")} className="ml-2 hidden md:inline-flex">
                Sign In
              </Button>
            )}
          </div>
        </div>

      </header>

      {searchOpen && <SmartSearch onClose={() => setSearchOpen(false)} />}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <span className="font-cinzel text-xl text-gradient-gold">MEYU</span>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-1">
              {CATEGORIES.map(c => (
                <Link
                  key={c.slug}
                  to={`/shop?category=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-border/40 text-sm tracking-wide uppercase hover:text-primary"
                >
                  {c.label}
                </Link>
              ))}
              {!user && (
                <Button variant="gold" className="mt-6" onClick={() => { setMobileOpen(false); nav("/login"); }}>
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-4 py-2">
          <Link to="/" className="flex flex-col items-center gap-1 text-[10px] py-1">
            <Menu className="h-5 w-5" /> Home
          </Link>
          <Link to="/shop" className="flex flex-col items-center gap-1 text-[10px] py-1">
            <Search className="h-5 w-5" /> Shop
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center gap-1 text-[10px] py-1 relative">
            <Heart className="h-5 w-5" /> Wishlist
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-1 text-[10px] py-1 relative">
            <ShoppingBag className="h-5 w-5" /> Bag
            {cartCount > 0 && (
              <span className="absolute top-0 right-1/4 bg-primary text-primary-foreground text-[9px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
};
