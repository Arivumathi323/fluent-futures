import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Timer, Trophy, Zap, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  answer: string;
}

const quizQuestions: QuizQuestion[] = [
  { id: 1, category: "Grammar", question: "Choose the correct sentence:", options: ["She don't like apples.", "She doesn't likes apples.", "She doesn't like apples.", "She not like apples."], answer: "She doesn't like apples." },
  { id: 2, category: "Vocabulary", question: "What does 'benevolent' mean?", options: ["Harmful", "Kind and generous", "Loud", "Lazy"], answer: "Kind and generous" },
  { id: 3, category: "Reading", question: "Which word is a synonym for 'happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], answer: "Joyful" },
  { id: 4, category: "Grammar", question: "I ___ to the gym every morning.", options: ["goes", "go", "going", "gone"], answer: "go" },
  { id: 5, category: "Vocabulary", question: "'Ephemeral' means something that is:", options: ["Permanent", "Short-lived", "Large", "Colorful"], answer: "Short-lived" },
  { id: 6, category: "Grammar", question: "By the time we arrived, the movie ___.", options: ["started", "has started", "had started", "starts"], answer: "had started" },
  { id: 7, category: "Reading", question: "An antonym for 'generous' is:", options: ["Kind", "Stingy", "Brave", "Gentle"], answer: "Stingy" },
  { id: 8, category: "Grammar", question: "If I ___ you, I would apologize.", options: ["am", "was", "were", "be"], answer: "were" },
  { id: 9, category: "Vocabulary", question: "What does 'ubiquitous' mean?", options: ["Rare", "Found everywhere", "Hidden", "Ancient"], answer: "Found everywhere" },
  { id: 10, category: "Grammar", question: "She asked me where I ___.", options: ["live", "lived", "living", "lives"], answer: "lived" },
];

const TIMER_SECONDS = 120;

const QuizChallenge = () => {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selected, setSelected] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[currentQ];
  const isCorrect = showFeedback && selected === question?.answer;

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished, timeLeft]);

  const handleSelect = (opt: string) => {
    if (showFeedback) return;
    setSelected(opt);
    setShowFeedback(true);
    if (opt === question.answer) setScore((s) => s + 1);
  };

  const next = useCallback(() => {
    setShowFeedback(false);
    setSelected("");
    if (currentQ + 1 < quizQuestions.length) {
      setCurrentQ((c) => c + 1);
    } else {
      setFinished(true);
    }
  }, [currentQ]);

  const reset = () => {
    setStarted(false);
    setCurrentQ(0);
    setScore(0);
    setShowFeedback(false);
    setSelected("");
    setTimeLeft(TIMER_SECONDS);
    setFinished(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (!started) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Quiz Challenge" />
        <div className="px-5 py-6 max-w-2xl mx-auto text-center">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <Card className="p-8 mt-8">
            <Zap className="w-16 h-16 text-feature-amber mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Quiz Challenge</h2>
            <p className="text-muted-foreground text-sm mb-2">{quizQuestions.length} questions • {Math.floor(TIMER_SECONDS / 60)} min timer</p>
            <p className="text-xs text-muted-foreground mb-6">Mixed questions from Grammar, Vocabulary & Reading</p>
            <Button onClick={() => setStarted(true)} className="gradient-button px-8">Start Challenge</Button>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Results" />
        <div className="px-5 py-6 max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <Trophy className="w-16 h-16 text-feature-amber mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-display mb-1">{pct}%</h2>
            <p className="text-muted-foreground text-sm mb-1">{score}/{quizQuestions.length} correct</p>
            <p className="text-xs text-muted-foreground mb-6">Time remaining: {formatTime(timeLeft)}</p>
            <Progress value={pct} className="h-3 mb-6" />
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline"><Link to="/dashboard">Dashboard</Link></Button>
              <Button onClick={reset} className="gradient-button">Retry</Button>
            </div>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Quiz Challenge" />
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold bg-secondary px-3 py-1 rounded-full">{question.category}</span>
          <span className={`flex items-center gap-1 text-sm font-semibold ${timeLeft < 30 ? "text-destructive" : "text-muted-foreground"}`}>
            <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
          </span>
        </div>
        <Progress value={((currentQ + 1) / quizQuestions.length) * 100} className="h-2 mb-4" />
        <p className="text-xs text-muted-foreground mb-4">{currentQ + 1}/{quizQuestions.length}</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display leading-relaxed">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((opt) => {
              const correct = showFeedback && opt === question.answer;
              const wrong = showFeedback && selected === opt && opt !== question.answer;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={showFeedback}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    correct ? "border-feature-green bg-feature-green/10" :
                    wrong ? "border-destructive bg-destructive/10" :
                    "border-border hover:border-primary/50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
            {showFeedback && (
              <div className={`rounded-xl p-4 flex items-center gap-2 ${isCorrect ? "bg-feature-green/10" : "bg-destructive/10"}`}>
                {isCorrect ? <CheckCircle2 className="w-5 h-5 text-feature-green" /> : <XCircle className="w-5 h-5 text-destructive" />}
                <span className="text-sm font-semibold">{isCorrect ? "Correct!" : `Answer: ${question.answer}`}</span>
              </div>
            )}
            {showFeedback && (
              <Button onClick={next} className="gradient-button w-full">{currentQ + 1 < quizQuestions.length ? "Next" : "Finish"}</Button>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default QuizChallenge;
