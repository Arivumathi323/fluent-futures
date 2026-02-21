import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Timer, Trophy, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { generateQuizQuestions, QuizQuestion } from "@/lib/gemini";
import { saveExerciseResult } from "@/lib/progressService";

const QuizChallenge = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);

  const SECONDS_PER_QUESTION = 30;

  const loadQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = await generateQuizQuestions(8);
      setQuestions(qs);
      setCurrentIdx(0);
      setScore(0);
      setFinished(false);
      setStarted(true);
      setTimeLeft(SECONDS_PER_QUESTION * qs.length);
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!started || finished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  // Save on finish
  useEffect(() => {
    if (finished && user && questions.length > 0) {
      saveExerciseResult(user.uid, "quiz", score, questions.length).catch(console.error);
    }
  }, [finished]);

  const question = questions[currentIdx];

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === question.answer) setScore((s) => s + 1);
    // Auto advance after 1.5s
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((c) => c + 1);
        setSelected("");
        setAnswered(false);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  const reset = () => {
    setQuestions([]);
    setCurrentIdx(0);
    setSelected("");
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setStarted(false);
    setTimeLeft(0);
    setError("");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AppLayout title="Quiz Challenge">
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Start Screen */}
        {!started && !loading && !error && (
          <Card className="text-center p-8">
            <Zap className="w-14 h-14 text-feature-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Quiz Challenge</h2>
            <p className="text-muted-foreground text-sm mb-6">AI-generated timed quiz. Answer before time runs out!</p>
            <Button onClick={loadQuiz} className="gradient-button">Start Quiz</Button>
          </Card>
        )}

        {loading && (
          <Card className="text-center p-8">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Generating quiz questions...</p>
          </Card>
        )}

        {error && (
          <Card className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadQuiz}>Try Again</Button>
          </Card>
        )}

        {/* Quiz */}
        {started && !finished && !loading && question && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary">{question.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{currentIdx + 1}/{questions.length}</span>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Timer className="w-4 h-4" />
                  <span className={timeLeft < 30 ? "text-destructive" : ""}>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
            <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2 mb-6" />

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display leading-relaxed">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {question.options.map((opt) => {
                  const isCorrect = opt === question.answer;
                  const isSelected = selected === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      disabled={answered}
                      className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-colors ${answered
                          ? isCorrect ? "border-feature-green bg-feature-green/10" : isSelected ? "border-destructive bg-destructive/10" : "border-border"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-feature-green" />}
                        {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {/* Results */}
        {finished && (
          <Card className="text-center p-8">
            <Trophy className="w-14 h-14 text-feature-amber mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-1">Quiz Complete!</h2>
            <p className="text-lg font-semibold text-primary mb-2">{score}/{questions.length}</p>
            <p className="text-muted-foreground text-sm mb-6">
              {score === questions.length ? "Perfect! 🎉" : score > questions.length / 2 ? "Good job! 👏" : "Keep trying! 💪"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="outline">Try Again</Button>
              <Link to="/dashboard"><Button className="gradient-button">Dashboard</Button></Link>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default QuizChallenge;
