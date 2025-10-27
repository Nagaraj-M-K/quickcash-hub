import { Link, useLocation } from "react-router-dom";
import { Home, Grid, BookOpen, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Blur backdrop with gradient border */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />
      
      {/* Navigation items */}
      <div className="relative flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="flex-1 flex justify-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.88 }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all duration-200",
                  "min-h-[44px] min-w-[44px]",
                  isActive && "bg-primary/10"
                )}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/5 rounded-xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Icon with animation */}
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10"
                >
                  <Icon 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                
                {/* Label */}
                <motion.span 
                  className={cn(
                    "text-[10px] font-medium transition-all relative z-10",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  animate={{ 
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 600 : 500
                  }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};