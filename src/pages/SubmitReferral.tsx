import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SubmitReferral() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appName: "",
    category: "other",
    link: "",
    bonusAmount: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to submit referral links");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      // Store in a submissions table or send notification to admin
      const { error } = await supabase.from("referral_submissions").insert({
        user_id: user.id,
        app_name: formData.appName,
        category: formData.category,
        referral_link: formData.link,
        bonus_amount: parseInt(formData.bonusAmount),
        description: formData.description,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Referral link submitted! We'll review it soon.");
      setFormData({
        appName: "",
        category: "other",
        link: "",
        bonusAmount: "",
        description: "",
      });
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      toast.error(error.message || "Failed to submit referral");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNav />
      <BottomNav />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Submit a Referral Link
              </CardTitle>
              <CardDescription>
                Share your favorite referral apps and earn rewards when they're approved!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name *</Label>
                  <Input
                    id="appName"
                    placeholder="e.g., PhonePe, Paytm"
                    value={formData.appName}
                    onChange={(e) =>
                      setFormData({ ...formData, appName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="payments">Payments</option>
                    <option value="gaming">Gaming</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Referral Link *</Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://example.com/refer?code=YOUR_CODE"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonusAmount">Bonus Amount (₹) *</Label>
                  <Input
                    id="bonusAmount"
                    type="number"
                    placeholder="100"
                    value={formData.bonusAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, bonusAmount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe how to earn the bonus..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-glow"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Referral"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>💡 Tip:</strong> Make sure the referral link includes your
                  referral code. Once approved, your link will be featured on our
                  platform!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}