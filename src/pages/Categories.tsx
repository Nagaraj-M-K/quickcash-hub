import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/AppCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SignupPromptModal } from "@/components/SignupPromptModal";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function Categories() {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    loadAllApps();
  }, []);

  const loadAllApps = async () => {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("category")
      .order("sort_order");

    if (error) {
      console.error("Error loading apps:", error);
    } else {
      setApps(data || []);
    }
  };

  const filterAppsByCategory = (category: string) => {
    const filtered = apps.filter(
      (app) =>
        app.category === category &&
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Limit to 5 apps for non-logged users
    return user ? filtered : filtered.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search across all categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Category Tabs - Sticky Navigation */}
        <div className="sticky top-0 z-10 bg-background pb-4">
          <CategoryTabs>
          {(category) => {
            const categoryApps = filterAppsByCategory(category);
            const allCategoryApps = apps.filter((app) => app.category === category);
            const hasMoreApps = !user && allCategoryApps.length > 5;
            
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryApps.length > 0 ? (
                    categoryApps.map((app) => <AppCard key={app.id} {...app} />)
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground py-12">
                      No apps found in this category
                    </p>
                  )}
                </div>

                {/* Locked Apps Message for Non-Logged Users */}
                {hasMoreApps && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                      <div className="p-6 text-center space-y-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Lock className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <h4 className="text-xl font-bold">
                          {allCategoryApps.length - 5}+ More Apps in {category.charAt(0).toUpperCase() + category.slice(1)} 🔒
                        </h4>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Sign up FREE to unlock all apps and maximize your earnings!
                        </p>
                        <div className="flex gap-3 justify-center pt-2">
                          <Button 
                            onClick={() => window.location.href = "/auth"}
                            className="bg-primary hover:bg-primary-glow"
                          >
                            Sign Up FREE
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setShowSignupModal(true)}
                          >
                            Why Sign Up?
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>
            );
          }}
          </CategoryTabs>
        </div>
      </div>

      {/* Signup Prompt Modal */}
      {showSignupModal && (
        <SignupPromptModal
          trigger="category_access"
          onClose={() => setShowSignupModal(false)}
        />
      )}
    </div>
  );
}
