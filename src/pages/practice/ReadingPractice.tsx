import { useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { generateReadingPassage, ReadingPassage } from "@/lib/gemini";
import { saveExerciseResult } from "@/lib/progressService";

const ReadingPractice = () => {
  const { user } = useAuth();
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const loadPassage = async (level: "beginner" | "intermediate" | "advanced" = "beginner") => {
    setLoading(true);
    setError("");
    setFinished(false);
    setScore(0);
    setCurrentQ(0);
    setSelected("");
    setAnswered(false);
    try {
      const p = await generateReadingPassage(level);
      setPassage(p);
    } catch (err: any) {
      setError(err.message || "Failed to generate passage");
    } finally {
      setLoading(false);
    }
  };

  const question = passage?.questions?.[currentQ];

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === question?.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected("");
    setAnswered(false);
    if (passage && currentQ + 1 < passage.questions.length) {
      setCurrentQ((c) => c + 1);
    } else {
      setFinished(true);
      if (user && passage) {
        saveExerciseResult(user.uid, "reading", score, passage.questions.length).catch(console.error);
      }
    }
  };

  return (
    <AppLayout title="Reading Practice">
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Start Screen */}
        {!passage && !loading && !error && (
          <Card className="text-center p-8">
            <BookOpen className="w-14 h-14 text-feature-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Reading Practice</h2>
            <p className="text-muted-foreground text-sm mb-6">AI-generated passages with comprehension questions</p>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                <Button key={level} onClick={() => loadPassage(level)} variant="outline" className="capitalize h-12 font-semibold">
                  {level}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {loading && (
          <Card className="text-center p-8">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Generating reading passage...</p>
          </Card>
        )}

        {error && (
          <Card className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadPassage()}>Try Again</Button>
          </Card>
        )}

        {/* Passage + Questions */}
        {passage && !finished && !loading && (
          <>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base font-display">{passage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-4">{passage.text}</p>
                {passage.vocabulary && passage.vocabulary.length > 0 && (
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2">📚 Vocabulary</p>
                    <div className="space-y-1">
                      {passage.vocabulary.map((v, i) => (
                        <p key={i} className="text-xs">
                          <strong>{v.word}</strong>: {v.meaning}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {question && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Question {currentQ + 1}</span>
                  <span className="text-sm text-muted-foreground">{currentQ + 1}/{passage.questions.length}</span>
                </div>
                <Progress value={((currentQ + 1) / passage.questions.length) * 100} className="h-2 mb-4" />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-display">{question.question}</CardTitle>
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
                          className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${answered
                              ? isCorrect ? "border-feature-green bg-feature-green/10" : isSelected ? "border-destructive bg-destructive/10" : "border-border"
                              : "border-border hover:border-primary/30"
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
                    {answered && (
                      <Button onClick={next} className="gradient-button w-full mt-3">
                        {currentQ + 1 < passage.questions.length ? "Next Question" : "See Results"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Results */}
        {finished && passage && (
          <Card className="text-center p-8">
            <Star className="w-14 h-14 text-feature-amber mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-1">Reading Complete!</h2>
            <p className="text-lg font-semibold text-primary mb-4">{score}/{passage.questions.length}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setPassage(null); setError(""); }} variant="outline">New Passage</Button>
              <Link to="/dashboard"><Button className="gradient-button">Dashboard</Button></Link>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ReadingPractice;
