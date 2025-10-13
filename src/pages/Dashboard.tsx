import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementBadge } from "@/components/AchievementBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Award, Wallet } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    const [profileRes, achievementsRes, userAchievementsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase.from("achievements").select("*").order("threshold"),
      supabase.from("user_achievements").select("achievement_id").eq("user_id", user!.id)
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (achievementsRes.data) setAchievements(achievementsRes.data);
    if (userAchievementsRes.data) {
      setUserAchievements(new Set(userAchievementsRes.data.map(ua => ua.achievement_id)));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button variant="ghost" onClick={signOut}>Sign Out</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">
              <Award className="mr-2 h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Wallet className="mr-2 h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  {...achievement}
                  currentProgress={profile?.total_clicks || 0}
                  unlocked={userAchievements.has(achievement.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="text-sm text-muted-foreground">Total Earnings</h3>
                <p className="text-3xl font-bold text-primary">₹{profile?.total_earnings || 0}</p>
              </div>
              <div className="bg-accent/10 p-6 rounded-lg">
                <h3 className="text-sm text-muted-foreground">Pending</h3>
                <p className="text-3xl font-bold text-accent">₹{profile?.pending_earnings || 0}</p>
              </div>
              <div className="bg-secondary/10 p-6 rounded-lg">
                <h3 className="text-sm text-muted-foreground">Total Clicks</h3>
                <p className="text-3xl font-bold text-secondary">{profile?.total_clicks || 0}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
