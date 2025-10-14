import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
  {
    id: 1,
    question: "What's your main goal?",
    options: [
      { value: "fast-cash", label: "Get money fast (under 24h)", category: "payments" },
      { value: "fun-games", label: "Have fun while earning", category: "gaming" },
      { value: "shopping", label: "Save on shopping", category: "shopping" },
      { value: "services", label: "Daily services discounts", category: "other" },
    ],
  },
  {
    id: 2,
    question: "How much time can you spend?",
    options: [
      { value: "5-mins", label: "Just 5 minutes", minPayout: "Instant" },
      { value: "30-mins", label: "Around 30 minutes", minPayout: "2 hours" },
      { value: "flexible", label: "I'm flexible", minPayout: "any" },
    ],
  },
  {
    id: 3,
    question: "Minimum payout you want?",
    options: [
      { value: "any", label: "Any amount works", minBonus: 0 },
      { value: "100", label: "At least ₹100", minBonus: 100 },
      { value: "500", label: "₹500 or more", minBonus: 500 },
    ],
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate("/");
    }
  };

  const getRecommendations = () => {
    // Simple recommendation logic based on first answer
    const firstAnswer = answers[0];
    if (firstAnswer?.includes("payments")) return "payments";
    if (firstAnswer?.includes("gaming")) return "gaming";
    if (firstAnswer?.includes("shopping")) return "shopping";
    return "other";
  };

  if (showResults) {
    const category = getRecommendations();
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Perfect Matches Found!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Based on your answers, we recommend checking out our {category} apps!
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate("/categories")}
                  >
                    See My Recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/")}
                  >
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center p-4 min-h-[80vh]">
        <div className="max-w-2xl w-full">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <div className="flex gap-1">
                      {questions.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-8 rounded-full ${
                            i <= currentQuestion ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{currentQ.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={answers[currentQuestion]}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {currentQ.options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label
                          htmlFor={option.value}
                          className="flex-1 cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleNext}
                    disabled={!hasAnswer}
                  >
                    {currentQuestion < questions.length - 1 ? "Next" : "See Results"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
