import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Home, Grid, BookOpen, LayoutDashboard, LogOut, LogIn, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Categories", path: "/categories", icon: Grid },
    { label: "Quiz", path: "/quiz", icon: BookOpen },
  ];

  const userNavItems = user
    ? [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }]
    : [];

  const adminNavItem = isAdmin
    ? [{ label: "Admin", path: "/admin", icon: Shield }]
    : [];

  const allNavItems = [...navItems, ...userNavItems, ...adminNavItem];

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              QuickCash 💰
            </motion.div>
          </Link>

          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-1 md:gap-2 px-2 md:px-4"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs md:text-sm">{item.label}</span>
                    </Button>
                  </Link>
                </motion.div>
              );
            })}

            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 md:gap-2 px-2 md:px-4"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs md:text-sm">Logout</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-1 md:gap-2 px-2 md:px-4">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs md:text-sm">Login</span>
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
