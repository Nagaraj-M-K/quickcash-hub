import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, TrendingUp, Gift, Lock } from "lucide-react";

interface SignupPromptModalProps {
  trigger: "limited_apps" | "category_access" | "reward_claim";
  onClose: () => void;
}

export const SignupPromptModal = ({ trigger, onClose }: SignupPromptModalProps) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing modal for smooth entrance
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleSignup = () => {
    navigate("/auth");
  };

  const content = {
    limited_apps: {
      icon: Lock,
      title: "Unlock All Quick Money Apps! 🚀",
      description: "You're seeing only 3 apps. Sign up FREE to access 30+ verified apps and start earning instantly!",
      benefits: [
        "Access to 30+ instant payout apps",
        "Track your earnings in real-time",
        "Earn ₹50-₹1,000 per app instantly"
      ]
    },
    category_access: {
      icon: Gift,
      title: "Want More Categories? 🎁",
      description: "Create a free account to browse Gaming, Shopping, Finance apps and maximize your earnings!",
      benefits: [
        "Browse all app categories",
        "Personalized recommendations",
        "Priority support for verified users"
      ]
    },
    reward_claim: {
      icon: TrendingUp,
      title: "Start Earning Today! 💰",
      description: "Sign up now to track clicks, earn commissions, and claim rewards directly to your UPI!",
      benefits: [
        "Real-time click tracking",
        "Automatic commission credits",
        "Instant UPI withdrawals (₹100+)"
      ]
    }
  };

  const { icon: Icon, title, description, benefits } = content[trigger];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="max-w-md w-full shadow-glow border-2 border-primary/20">
              <CardHeader className="relative pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{description}</p>
                
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleSignup}
                    className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold h-12 text-lg"
                    size="lg"
                  >
                    Sign Up FREE - Start Earning! 🎉
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Maybe Later
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  No credit card required • Takes only 30 seconds
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
