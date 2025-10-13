import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/AppCard";
import { FomoTimer } from "@/components/FomoTimer";
import { SocialProof } from "@/components/SocialProof";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Sparkles, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedApps();
  }, []);

  const loadFeaturedApps = async () => {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(7);

    if (error) {
      console.error("Error loading apps:", error);
    } else {
      setApps(data || []);
    }
    setLoading(false);
  };

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">EarnMore</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  <Award className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button onClick={() => navigate("/categories")}>Browse All</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold">
            Earn Quick Money with
            <span className="text-primary"> India's Top Apps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant payouts from ₹50 to ₹1,000 in minutes. No tricks, just easy money!
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/quiz")} className="bg-primary hover:bg-primary-glow">
              <Sparkles className="mr-2 h-5 w-5" />
              Take Quick Quiz
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/categories")}>
              Browse All Apps
            </Button>
          </div>
        </motion.div>

        {/* FOMO Timer */}
        <div className="max-w-xl mx-auto mb-12">
          <FomoTimer message="🔥 Special offer ends in" />
        </div>

        {/* Social Proof */}
        <div className="max-w-2xl mx-auto mb-12">
          <SocialProof />
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Featured Apps */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">⚡ Quick Money Apps</h3>
            <span className="text-sm text-muted-foreground">(Instant Payouts)</span>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <AppCard key={app.id} {...app} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 EarnMore. Affiliate disclosure: We earn commissions from referrals.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
