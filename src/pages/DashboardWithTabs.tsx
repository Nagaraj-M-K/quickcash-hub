import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementBadge } from "@/components/AchievementBadge";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";
import { User, History, Gift, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const DashboardWithTabs = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);
  const [upiId, setUpiId] = useState("");
  const [updatingUpi, setUpdatingUpi] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(profileData);
    setUpiId(profileData?.upi_id || "");

    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*")
      .order("threshold", { ascending: true });
    
    setAchievements(achievementsData || []);

    const { data: userAchievementsData } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id);
    
    setUserAchievements(userAchievementsData || []);

    const { data: clicksData } = await supabase
      .from("clicks")
      .select("*, apps(*)")
      .eq("user_id", user.id)
      .order("clicked_at", { ascending: false })
      .limit(10);
    
    setRecentClicks(clicksData || []);
  };

  const handleUpdateUpi = async () => {
    if (!upiId.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setUpdatingUpi(true);
    try {
      const { error } = await supabase.functions.invoke('update-upi', {
        body: { upiId }
      });

      if (error) throw error;

      toast.success("UPI ID updated successfully!");
      await fetchDashboardData();
    } catch (error: any) {
      console.error("Error updating UPI:", error);
      toast.error(error.message || "Failed to update UPI ID");
    } finally {
      setUpdatingUpi(false);
    }
  };

  const handleClaimRewards = () => {
    if (!profile?.upi_id) {
      toast.error("Please add your UPI ID first");
      return;
    }
    if ((profile?.confirmed_earnings || 0) < 100) {
      toast.error("Minimum ₹100 required for payout");
      return;
    }
    toast.success("Payout request submitted! You'll receive payment within 24 hours.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          💰
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      <BottomNav />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || "Earner"}! 👋
          </h1>
          <p className="text-muted-foreground mb-8">Track your earnings and achievements</p>
        </motion.div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="min-h-[44px]">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="min-h-[44px]">
              <History className="h-4 w-4 mr-2" />
              Referral History
            </TabsTrigger>
            <TabsTrigger value="rewards" className="min-h-[44px]">
              <Gift className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ""} disabled className="mt-2" />
                </div>
                <div>
                  <Label>Total Referrals</Label>
                  <Input value={recentClicks.length} disabled className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  UPI Details for Payouts
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add your UPI ID to receive instant payouts (Min ₹100)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="upi"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleUpdateUpi} 
                      disabled={updatingUpi || !upiId.trim()}
                      className="bg-primary hover:bg-primary-glow min-h-[44px]"
                    >
                      {updatingUpi ? "Saving..." : "Save UPI"}
                    </Button>
                  </div>
                  {profile?.upi_id && (
                    <p className="text-sm text-muted-foreground">
                      Current UPI: <span className="font-semibold">{profile.upi_id}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <AchievementBadge
                          name={achievement.name}
                          description={achievement.description}
                          currentProgress={
                            achievement.name.includes("Click")
                              ? profile?.total_clicks || 0
                              : profile?.total_earnings || 0
                          }
                          threshold={achievement.threshold}
                          icon={achievement.icon}
                          unlocked={unlockedAchievementIds.has(achievement.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No achievements yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                {recentClicks.length > 0 ? (
                  <div className="space-y-4">
                    {recentClicks.map((click) => (
                      <div
                        key={click.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 gap-2"
                      >
                        <div>
                          <p className="font-semibold">{click.apps?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(click.clicked_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {click.is_my_referral ? "My Referral" : "Direct"}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="font-bold text-primary">₹{click.apps?.bonus_amount}</p>
                          <p className="text-xs text-muted-foreground capitalize">{click.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No referral history yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{profile?.total_clicks || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">₹{profile?.pending_earnings || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-gaming/10 to-gaming/5">
                <CardHeader>
                  <CardTitle className="text-lg">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gaming">₹{profile?.total_earnings || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Claim Your Rewards</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Minimum ₹100 required for payout
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{profile?.confirmed_earnings || 0}
                  </p>
                </div>
                <Button 
                  onClick={handleClaimRewards}
                  className="w-full min-h-[44px] bg-primary hover:bg-primary-glow"
                  disabled={(profile?.confirmed_earnings || 0) < 100 || !profile?.upi_id}
                >
                  Claim ₹{profile?.confirmed_earnings || 0}+
                </Button>
                {!profile?.upi_id && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please add your UPI ID in Profile tab to claim rewards
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardWithTabs;
