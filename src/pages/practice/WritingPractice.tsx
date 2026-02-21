import { useState } from "react";
import { ArrowLeft, Pen, CheckCircle2, XCircle, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { generateWritingExercises, getWritingFeedback, WritingExercise } from "@/lib/gemini";
import { saveExerciseResult } from "@/lib/progressService";

const WritingPractice = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<WritingExercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [error, setError] = useState("");

  const loadExercises = async () => {
    setLoading(true);
    setError("");
    setFinished(false);
    setScore(0);
    setCurrentIdx(0);
    setExercises([]);
    try {
      const ex = await generateWritingExercises(5);
      setExercises(ex);
    } catch (err: any) {
      setError(err.message || "Failed to generate exercises");
    } finally {
      setLoading(false);
    }
  };

  const exercise = exercises[currentIdx];
  const isCorrect = submitted && exercise?.answer && userInput.trim().toLowerCase() === exercise.answer.toLowerCase();

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setSubmitted(true);
    if (exercise.answer && userInput.trim().toLowerCase() === exercise.answer.toLowerCase()) {
      setScore((s) => s + 1);
    }
    // Get AI feedback for prompts
    if (exercise.type === "prompt") {
      setFeedbackLoading(true);
      try {
        const feedback = await getWritingFeedback(userInput);
        setAiFeedback(feedback);
      } catch {
        setAiFeedback("AI feedback unavailable.");
      } finally {
        setFeedbackLoading(false);
      }
    }
  };

  const next = () => {
    setSubmitted(false);
    setUserInput("");
    setAiFeedback("");
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((c) => c + 1);
    } else {
      setFinished(true);
      if (user) {
        saveExerciseResult(user.uid, "writing", score, exercises.filter((e) => e.answer).length).catch(console.error);
      }
    }
  };

  return (
    <AppLayout title="Writing Practice">
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Start Screen */}
        {exercises.length === 0 && !loading && !error && (
          <Card className="text-center p-8">
            <Pen className="w-14 h-14 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Writing Practice</h2>
            <p className="text-muted-foreground text-sm mb-6">AI-generated exercises with real-time feedback</p>
            <Button onClick={loadExercises} className="gradient-button">Start Practice</Button>
          </Card>
        )}

        {loading && (
          <Card className="text-center p-8">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Generating writing exercises...</p>
          </Card>
        )}

        {error && (
          <Card className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadExercises}>Try Again</Button>
          </Card>
        )}

        {/* Exercise */}
        {!loading && !error && exercises.length > 0 && !finished && exercise && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Pen className="w-4 h-4 text-accent" />
                {exercise.type === "formation" ? "Sentence Formation" : exercise.type === "correction" ? "Error Correction" : "Free Writing"}
              </span>
              <span className="text-sm text-muted-foreground">{currentIdx + 1}/{exercises.length}</span>
            </div>
            <Progress value={((currentIdx + 1) / exercises.length) * 100} className="h-2 mb-6" />

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display leading-relaxed">{exercise.instruction}</CardTitle>
                {exercise.hint && <p className="text-xs text-muted-foreground">💡 Hint: {exercise.hint}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                {exercise.type === "prompt" ? (
                  <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Write your answer here..." rows={4} disabled={submitted} />
                ) : (
                  <Input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type your answer..." disabled={submitted} />
                )}

                {!submitted && (
                  <Button onClick={handleSubmit} className="gradient-button w-full" disabled={!userInput.trim()}>Submit</Button>
                )}

                {submitted && exercise.answer && (
                  <div className={`rounded-xl p-4 ${isCorrect ? "bg-feature-green/10 border border-feature-green/30" : "bg-destructive/10 border border-destructive/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-feature-green" /> : <XCircle className="w-5 h-5 text-destructive" />}
                      <span className="font-semibold text-sm">{isCorrect ? "Correct!" : "Not quite"}</span>
                    </div>
                    {!isCorrect && <p className="text-sm"><strong>Expected:</strong> {exercise.answer}</p>}
                  </div>
                )}

                {submitted && exercise.type === "prompt" && (
                  <div className="rounded-xl p-4 bg-accent/10 border border-accent/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-sm">AI Feedback</span>
                    </div>
                    {feedbackLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Analyzing your writing...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiFeedback}</p>
                    )}
                  </div>
                )}

                {submitted && !feedbackLoading && (
                  <Button onClick={next} className="gradient-button w-full">
                    {currentIdx + 1 < exercises.length ? "Next Exercise" : "See Results"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Results */}
        {finished && (
          <Card className="text-center p-8">
            <Pen className="w-14 h-14 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-1">Practice Complete!</h2>
            <p className="text-muted-foreground text-sm mb-2">{score} correct out of {exercises.filter((e) => e.answer).length} graded exercises</p>
            <p className="text-xs text-muted-foreground mb-6">Free writing exercises received AI feedback</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setExercises([]); setError(""); }} variant="outline">Try Again</Button>
              <Link to="/dashboard"><Button className="gradient-button">Dashboard</Button></Link>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default WritingPractice;
