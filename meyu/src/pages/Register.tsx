import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const Register = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: parsed.data.name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Email already registered" : error.message);
      return;
    }
    if (data.session) {
      toast.success("Welcome to MEYU");
      nav("/select-state");
    } else {
      toast.success("Check your email to confirm");
      nav("/login");
    }
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

        <h2 className="font-display text-2xl text-center mb-1">Join MEYU</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Begin your fashion journey</p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-xs tracking-wider uppercase">Full Name</Label>
            <Input id="name" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-1.5 bg-background/50 h-11" />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs tracking-wider uppercase">Email</Label>
            <Input id="email" type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="mt-1.5 bg-background/50 h-11" />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs tracking-wider uppercase">Password</Label>
            <Input id="password" type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="mt-1.5 bg-background/50 h-11" />
            <p className="text-[11px] text-muted-foreground mt-1.5">Minimum 6 characters</p>
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? "Creating..." : "Enter MEYU"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already a member?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
