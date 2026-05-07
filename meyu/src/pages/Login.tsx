import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const Login = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "Invalid email or password" : error.message);
      return;
    }
    toast.success("Welcome back to MEYU");
    nav("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(46_65%_52%/0.12),transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-primary/20 rounded-lg p-10 shadow-elegant"
      >
        <Link to="/" className="block text-center mb-8">
          <h1 className="font-cinzel text-4xl text-gradient-gold">MEYU</h1>
          <p className="text-[10px] tracking-[0.4em] text-muted-foreground mt-1">SIMPLY YOU. TRULY YOURS.</p>
        </Link>

        <h2 className="font-display text-2xl text-center mb-1">Welcome Back</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Sign in to continue your journey</p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-xs tracking-wider uppercase">Email</Label>
            <Input id="email" type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="mt-1.5 bg-background/50 border-border focus-visible:ring-primary h-11" />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs tracking-wider uppercase">Password</Label>
            <Input id="password" type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="mt-1.5 bg-background/50 border-border focus-visible:ring-primary h-11" />
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? "Entering..." : "Enter MEYU"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
