import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Grid, HelpCircle, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              EarnMore 💰
            </motion.div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/categories">
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Browse</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/quiz">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </Link>
            </Button>

            {user ? (
              <>
                <Button variant="secondary" size="sm" asChild className="gap-2">
                  <Link to="/dashboard">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
