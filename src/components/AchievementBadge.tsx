import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  threshold: number;
  currentProgress: number;
  unlocked: boolean;
}

export const AchievementBadge = ({
  name,
  description,
  icon,
  threshold,
  currentProgress,
  unlocked,
}: AchievementBadgeProps) => {
  const IconComponent = (Icons as any)[icon] as LucideIcon;
  const progress = Math.min((currentProgress / threshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={unlocked ? "animate-badge-pop" : ""}
    >
      <Card className={`relative ${unlocked ? "border-primary shadow-glow" : "opacity-60"}`}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${unlocked ? "bg-primary" : "bg-muted"}`}>
                {IconComponent && (
                  <IconComponent className={`h-6 w-6 ${unlocked ? "text-primary-foreground" : "text-muted-foreground"}`} />
                )}
              </div>
              <div>
                <h3 className="font-bold">{name}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {unlocked && (
              <Badge variant="default" className="bg-primary">
                Unlocked
              </Badge>
            )}
          </div>
          
          {!unlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {currentProgress}/{threshold}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
