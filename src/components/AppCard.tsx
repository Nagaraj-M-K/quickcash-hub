import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, ExternalLink } from "lucide-react";
import { trackClick, getUtmParams } from "@/utils/tracking";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AppCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  bonusAmount: number;
  payoutTime: string;
  taskDescription: string;
  referralLink: string;
  isFeatured?: boolean;
}

export const AppCard = ({
  id,
  name,
  category,
  description,
  bonusAmount,
  payoutTime,
  taskDescription,
  referralLink,
  isFeatured,
}: AppCardProps) => {
  const { user } = useAuth();

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      payments: "bg-payments",
      gaming: "bg-gaming",
      shopping: "bg-shopping",
      other: "bg-other",
    };
    return colors[cat] || "bg-primary";
  };

  const handleClick = async () => {
    const utmParams = getUtmParams();
    await trackClick(id, user?.id || null, utmParams);
    
    toast.success("Opening referral link!", {
      description: user 
        ? "Your click is being tracked for rewards" 
        : "Sign in to track your rewards",
    });

    // Add UTM params to referral link
    const url = new URL(referralLink);
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set("ref_source", "earnmore");
    
    window.open(url.toString(), "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="relative overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer border-2 hover:border-primary/30">
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            HOT DEAL
          </div>
        )}
        
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{name}</h3>
                <Badge variant="secondary" className={`${getCategoryColor(category)} text-white`}>
                  {category}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-semibold">Earn: ₹{bonusAmount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Payout: {payoutTime}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">{taskDescription}</p>
          </div>

          <Button 
            onClick={handleClick}
            className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold"
            size="lg"
          >
            Get ₹{bonusAmount} Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
