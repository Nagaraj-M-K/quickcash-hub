import { Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const SocialProof = () => {
  const stats = [
    { icon: Users, label: "Active Users", value: "5,000+" },
    { icon: TrendingUp, label: "Earned Today", value: "₹50,000+" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6"
    >
      <div className="grid grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-2">
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
