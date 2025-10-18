import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementBadge } from "@/components/AchievementBadge";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { TrendingUp, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);

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

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(profileData);

    // Fetch achievements
    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*")
      .order("threshold", { ascending: true });
    
    setAchievements(achievementsData || []);

    // Fetch user achievements
    const { data: userAchievementsData } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id);
    
    setUserAchievements(userAchievementsData || []);

    // Fetch recent clicks
    const { data: clicksData } = await supabase
      .from("clicks")
      .select("*, apps(*)")
      .eq("user_id", user.id)
      .order("clicked_at", { ascending: false })
      .limit(5);
    
    setRecentClicks(clicksData || []);
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || "Earner"}! 👋
          </h1>
          <p className="text-muted-foreground mb-8">Track your earnings and achievements</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{profile?.total_clicks || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Pending Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">₹{profile?.pending_earnings || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-gaming/10 to-gaming/5 border-gaming/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gaming" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gaming">₹{profile?.total_earnings || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Your Achievements 🏆</CardTitle>
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
                <p className="text-muted-foreground">No achievements yet. Start clicking to earn!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recent Activity 📊</CardTitle>
            </CardHeader>
            <CardContent>
              {recentClicks.length > 0 ? (
                <div className="space-y-4">
                  {recentClicks.map((click) => (
                    <div
                      key={click.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-semibold">{click.apps?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(click.clicked_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{click.apps?.bonus_amount}</p>
                        <p className="text-xs text-muted-foreground">{click.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent activity. Start clicking referrals to see your progress!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
