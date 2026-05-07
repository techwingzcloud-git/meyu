import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(46_65%_52%/0.1),transparent_70%)]" />
    <div className="text-center relative">
      <h1 className="font-cinzel text-[10rem] md:text-[14rem] leading-none text-gradient-gold opacity-50">404</h1>
      <h2 className="font-display text-3xl md:text-4xl -mt-8 mb-3">Page not found</h2>
      <p className="text-muted-foreground mb-8">This page seems to have wandered off the runway.</p>
      <Link to="/"><Button variant="hero" size="lg">Back to MEYU</Button></Link>
    </div>
  </div>
);

export default NotFound;
