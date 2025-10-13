import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface FomoTimerProps {
  endTime?: Date;
  message?: string;
}

export const FomoTimer = ({ 
  endTime = new Date(Date.now() + 48 * 60 * 60 * 1000),
  message = "Limited time offer ends in"
}: FomoTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Expired");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-accent/10 border border-accent rounded-lg p-4 flex items-center gap-3"
    >
      <Clock className="h-5 w-5 text-accent" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-2xl font-bold text-accent">{timeLeft}</p>
      </div>
    </motion.div>
  );
};
