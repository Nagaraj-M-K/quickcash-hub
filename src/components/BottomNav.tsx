import { Link, useLocation } from "react-router-dom";
import { Home, Grid, BookOpen, LayoutDashboard, Shield, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { motion } from "framer-motion";

export const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Categories", path: "/categories", icon: Grid },
    { label: "Quiz", path: "/quiz", icon: BookOpen },
  ];

  if (user) {
    navItems.push({ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard });
  }

  if (isAdmin) {
    navItems.push({ label: "Admin", path: "/admin", icon: Shield });
  }

  // Don't show bottom nav on auth page
  if (location.pathname === "/auth" || location.pathname === "/auth/callback") {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};