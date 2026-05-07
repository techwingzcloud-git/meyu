import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="bg-card border-t border-border mt-24 pb-20 md:pb-0">
    <div className="container py-16">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-cinzel text-2xl text-gradient-gold mb-3">MEYU</h3>
          <p className="text-sm text-muted-foreground italic font-display">
            Simply You. Truly Yours.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="p-2 border border-primary/30 rounded-full hover:bg-primary hover:text-primary-foreground transition-all">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Shop", links: [["New Arrivals", "/shop?category=new-arrivals"], ["Dresses", "/shop?category=dresses"], ["Co-ord Sets", "/shop?category=co-ord-sets"], ["Sale", "/shop?category=sale"]] },
          { title: "Help", links: [["Shipping", "#"], ["Returns", "#"], ["Size Guide", "#"], ["Contact", "#"]] },
          { title: "Company", links: [["About MEYU", "#"], ["Sustainability", "#"], ["Careers", "#"], ["Press", "#"]] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-xs tracking-[0.2em] uppercase text-primary mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="hairline my-10" />
      <p className="text-center text-xs text-muted-foreground tracking-wider">
        © {new Date().getFullYear()} MEYU. Crafted with care in India.
      </p>
    </div>
  </footer>
);
