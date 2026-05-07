import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children, requireOnboarded = true, adminOnly = false }: {
  children: ReactNode;
  requireOnboarded?: boolean;
  adminOnly?: boolean;
}) => {
  const { user, profile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-gold rounded-full h-12 w-12 bg-gold-gradient" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  if (requireOnboarded && profile && !profile.onboarded) return <Navigate to="/select-state" replace />;
  return <>{children}</>;
};
