import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/AppCard";
import { FomoTimer } from "@/components/FomoTimer";
import { SocialProof } from "@/components/SocialProof";
import { SignupPromptModal } from "@/components/SignupPromptModal";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Sparkles, Lock, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    loadFeaturedApps();
  }, [user]);

  const loadFeaturedApps = async () => {
    const limit = user ? 7 : 3; // Show only 3 apps for non-logged users
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("is_featured", true)
      .order("sort_order")
      .limit(limit);

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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">⚡ Quick Money Apps</h3>
              <span className="text-sm text-muted-foreground">(Instant Payouts)</span>
            </div>
            {!user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignupModal(true)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Unlock 30+ Apps
                </Button>
              </motion.div>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <AppCard 
                    key={app.id}
                    id={app.id}
                    name={app.name}
                    category={app.category}
                    description={app.description}
                    bonusAmount={app.bonus_amount}
                    payoutTime={app.payout_time}
                    taskDescription={app.task_description}
                    referralLink={app.referral_link}
                    isFeatured={app.is_featured}
                  />
                ))}
              </div>

              {/* Locked Apps Preview for Non-Logged Users */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />
                    <div className="relative z-20 p-8 text-center space-y-4">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Lock className="h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <h4 className="text-2xl font-bold">27+ More Apps Locked 🔒</h4>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Sign up FREE to unlock Gaming, Shopping, Finance apps and earn up to ₹10,000/month!
                      </p>
                      <div className="flex gap-4 justify-center pt-4">
                        <Button 
                          size="lg"
                          onClick={() => navigate("/auth")}
                          className="bg-primary hover:bg-primary-glow"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Sign Up FREE
                        </Button>
                        <Button 
                          size="lg"
                          variant="outline"
                          onClick={() => setShowSignupModal(true)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
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

      {/* Signup Prompt Modal */}
      {showSignupModal && (
        <SignupPromptModal
          trigger="limited_apps"
          onClose={() => setShowSignupModal(false)}
        />
      )}
    </div>
  );
}
