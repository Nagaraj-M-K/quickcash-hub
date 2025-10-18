import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-9xl"
          >
            🤔
          </motion.div>
          
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          
          <h2 className="text-3xl font-semibold">Page Not Found</h2>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            Oops! Looks like this page doesn't exist. Let's get you back to earning!
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="h-5 w-5" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="secondary" size="lg" className="gap-2">
              <Link to="/categories">
                <Search className="h-5 w-5" />
                Browse Apps
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
