import { useEffect, useState } from "react";
import meyuLogo from "@/assets/meyu-logo.png";

export function SplashScreen() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setHide(true), 1400);
    const t2 = window.setTimeout(() => setGone(true), 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        hide ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={hide}
    >
      <div
        className="flex flex-col items-center gap-4"
        style={{ animation: "fade-in 0.8s ease-out" }}
      >
        <img src={meyuLogo} alt="MEYU" className="h-20 w-auto drop-shadow-[0_0_24px_var(--gold)]" />
        <div className="text-[10px] uppercase tracking-[0.5em] text-primary">
          Luxury · AI · Fashion
        </div>
      </div>
    </div>
  );
}
