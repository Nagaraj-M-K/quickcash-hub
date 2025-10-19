import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Home, Grid, BookOpen, LayoutDashboard, LogOut, LogIn, Shield, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleNavClick = () => setIsOpen(false);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              QuickCash 💰
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
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
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                </motion.div>
              );
            })}

            {user ? (
              <Button 
                onClick={signOut} 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={handleNavClick}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}

                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <Button 
                      onClick={() => {
                        signOut();
                        handleNavClick();
                      }} 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  ) : (
                    <Link to="/auth" onClick={handleNavClick}>
                      <Button variant="default" className="w-full justify-start gap-3">
                        <LogIn className="h-5 w-5" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
