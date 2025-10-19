import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const ManageClicks = () => {
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchClicks();
  }, []);

  const fetchClicks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clicks")
      .select(`
        *,
        apps (name, bonus_amount, commission_rate, my_commission_rate),
        profiles (email, full_name)
      `)
      .order("clicked_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching clicks:", error);
      toast.error("Failed to load clicks");
    } else {
      setClicks(data || []);
    }
    setLoading(false);
  };

  const updateClickStatus = async (clickId: string, newStatus: string) => {
    setUpdating(clickId);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-rewards', {
        body: { clickId, status: newStatus }
      });

      if (error) throw error;

      toast.success(`Click status updated to ${newStatus}`);
      await fetchClicks();
    } catch (error: any) {
      console.error("Error updating click:", error);
      toast.error(error.message || "Failed to update click status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
      confirmed: { color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
      rejected: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const calculateCommission = (click: any) => {
    if (!click.apps) return 0;
    const rate = click.is_my_referral 
      ? (click.apps.my_commission_rate || 0.50)
      : (click.apps.commission_rate || 0.30);
    return (click.apps.bonus_amount * rate).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">💰</div>
          <p className="text-muted-foreground">Loading clicks...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Manage Referral Clicks
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {clicks.length} clicks
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clicks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No clicks recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {clicks.map((click, index) => (
                <motion.div
                  key={click.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-lg">{click.apps?.name || "Unknown App"}</p>
                            {click.is_my_referral && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                Premium (50%)
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            User: {click.profiles?.email || click.anonymous_id || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(click.clicked_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Bonus:</span>
                          <span className="font-semibold ml-1">₹{click.apps?.bonus_amount || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Commission:</span>
                          <span className="font-semibold text-primary ml-1">
                            ₹{click.commission_amount || calculateCommission(click)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(click.status)}
                      
                      <Select
                        value={click.status}
                        onValueChange={(value) => updateClickStatus(click.id, value)}
                        disabled={updating === click.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};