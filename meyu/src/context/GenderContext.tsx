import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useLocation } from "react-router-dom";

export type Gender = "men" | "women";

interface GenderCtx {
  gender: Gender;
  setGender: (g: Gender) => void;
  toggleGender: () => void;
}

const Ctx = createContext<GenderCtx | undefined>(undefined);

export const GenderProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  const [gender, setGenderState] = useState<Gender>(() => {
    if (typeof window === "undefined") return "women";
    const stored = localStorage.getItem("meyu_gender") as Gender | null;
    return stored === "men" || stored === "women" ? stored : "women";
  });

  // Sync with route prefix
  useEffect(() => {
    if (location.pathname.startsWith("/men")) setGenderState("men");
    else if (location.pathname.startsWith("/women")) setGenderState("women");
  }, [location.pathname]);

  const setGender = useCallback((g: Gender) => {
    setGenderState(g);
    localStorage.setItem("meyu_gender", g);
  }, []);

  const toggleGender = useCallback(() => {
    setGender(gender === "men" ? "women" : "men");
  }, [gender, setGender]);

  return <Ctx.Provider value={{ gender, setGender, toggleGender }}>{children}</Ctx.Provider>;
};

export const useGender = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGender must be used within GenderProvider");
  return v;
};
