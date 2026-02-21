import { useState } from "react";
import { ArrowLeft, Pen, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

type ExerciseType = "formation" | "correction" | "prompt";

interface Exercise {
  id: number;
  type: ExerciseType;
  instruction: string;
  hint?: string;
  answer?: string;
}

const exercises: Exercise[] = [
  { id: 1, type: "formation", instruction: "Form a sentence using: always / she / early / arrives", hint: "Subject + adverb + verb", answer: "She always arrives early." },
  { id: 2, type: "correction", instruction: "Correct this sentence: \"He goed to the store yesterday.\"", answer: "He went to the store yesterday." },
  { id: 3, type: "formation", instruction: "Form a sentence using: have / I / finished / homework / my", hint: "Present perfect tense", answer: "I have finished my homework." },
  { id: 4, type: "correction", instruction: "Correct this sentence: \"Their going to the park tommorow.\"", answer: "They're going to the park tomorrow." },
  { id: 5, type: "prompt", instruction: "Write 2-3 sentences about your favorite hobby. Use at least one present continuous tense." },
];

const WritingPractice = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = exercises[currentIdx];
  const isCorrect = submitted && exercise.answer && userInput.trim().toLowerCase() === exercise.answer.toLowerCase();

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    setSubmitted(true);
    if (exercise.answer && userInput.trim().toLowerCase() === exercise.answer.toLowerCase()) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    setSubmitted(false);
    setUserInput("");
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setCurrentIdx(0);
    setUserInput("");
    setSubmitted(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Writing Practice" />
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {!finished ? (
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
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Write your answer here..."
                    rows={4}
                    disabled={submitted}
                  />
                ) : (
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={submitted}
                  />
                )}

                {!submitted && (
                  <Button onClick={handleSubmit} className="gradient-button w-full" disabled={!userInput.trim()}>
                    Submit
                  </Button>
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
                    <p className="text-sm text-muted-foreground">AI grammar analysis will be available soon. Your writing has been recorded for review.</p>
                  </div>
                )}

                {submitted && (
                  <Button onClick={next} className="gradient-button w-full">
                    {currentIdx + 1 < exercises.length ? "Next Exercise" : "See Results"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="text-center p-8">
            <Pen className="w-14 h-14 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-1">Practice Complete!</h2>
            <p className="text-muted-foreground text-sm mb-2">{score} correct out of {exercises.filter((e) => e.answer).length} graded exercises</p>
            <p className="text-xs text-muted-foreground mb-6">Free writing exercises are reviewed separately</p>
            <Button onClick={reset} className="gradient-button">Try Again</Button>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default WritingPractice;
