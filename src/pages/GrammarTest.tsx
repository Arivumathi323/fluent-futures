import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

type Difficulty = "beginner" | "intermediate" | "advanced";
type QuestionType = "mcq" | "fill" | "correction";

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

const questionBank: Record<Difficulty, Question[]> = {
  beginner: [
    { id: 1, type: "mcq", question: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes", explanation: "With third person singular (she/he/it), we use 'goes'." },
    { id: 2, type: "mcq", question: "They ___ playing football now.", options: ["is", "are", "was", "am"], answer: "are", explanation: "'They' takes 'are' as the helping verb." },
    { id: 3, type: "fill", question: "I ___ (be) a student.", answer: "am", explanation: "'I' always takes 'am'." },
    { id: 4, type: "fill", question: "The cat ___ (sit) on the mat.", answer: "sits", explanation: "Simple present with singular noun uses 's' form." },
    { id: 5, type: "correction", question: "He don't like ice cream.", answer: "He doesn't like ice cream.", explanation: "Third person singular uses 'doesn't' not 'don't'." },
    { id: 6, type: "mcq", question: "I ___ my homework yesterday.", options: ["do", "did", "does", "done"], answer: "did", explanation: "'Yesterday' indicates past tense, so we use 'did'." },
  ],
  intermediate: [
    { id: 1, type: "mcq", question: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], answer: "were", explanation: "In second conditional (unreal), we use 'were' for all subjects." },
    { id: 2, type: "mcq", question: "She has been working here ___ 2018.", options: ["for", "since", "from", "at"], answer: "since", explanation: "'Since' is used with a specific point in time." },
    { id: 3, type: "fill", question: "By the time he arrived, she ___ (leave) already.", answer: "had left", explanation: "Past perfect is used for an action completed before another past action." },
    { id: 4, type: "fill", question: "The report ___ (write) by the manager.", answer: "was written", explanation: "Passive voice in past simple: was/were + past participle." },
    { id: 5, type: "correction", question: "Neither the students nor the teacher were happy about the cancellation.", answer: "Neither the students nor the teacher was happy about the cancellation.", explanation: "With 'neither...nor', the verb agrees with the nearer subject." },
    { id: 6, type: "mcq", question: "I wish I ___ harder when I was young.", options: ["study", "studied", "had studied", "studying"], answer: "had studied", explanation: "'Wish' + past perfect expresses regret about the past." },
  ],
  advanced: [
    { id: 1, type: "mcq", question: "Scarcely ___ the station when the train departed.", options: ["I had reached", "had I reached", "I reached", "did I reach"], answer: "had I reached", explanation: "After negative adverbs like 'scarcely', we use inverted word order." },
    { id: 2, type: "mcq", question: "The manager insisted that the report ___ submitted by Friday.", options: ["is", "was", "be", "will be"], answer: "be", explanation: "Subjunctive mood uses base form after verbs like 'insist'." },
    { id: 3, type: "fill", question: "Had she known about the delay, she ___ (not come) so early.", answer: "would not have come", explanation: "Third conditional: Had + past participle, would have + past participle." },
    { id: 4, type: "fill", question: "The phenomenon, ___ (study) extensively, remains unexplained.", answer: "having been studied", explanation: "Perfect participle passive for an action completed before the main clause." },
    { id: 5, type: "correction", question: "Between you and I, this project is doomed to fail.", answer: "Between you and me, this project is doomed to fail.", explanation: "'Between' is a preposition; it takes object pronouns (me, not I)." },
    { id: 6, type: "mcq", question: "Not until the results were announced ___ the gravity of the situation.", options: ["she realized", "did she realize", "she did realize", "realized she"], answer: "did she realize", explanation: "'Not until' at the start requires subject-verb inversion." },
  ],
};

const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
  beginner: { label: "Beginner 🌱", color: "bg-feature-green text-primary-foreground" },
  intermediate: { label: "Intermediate 📘", color: "bg-primary text-primary-foreground" },
  advanced: { label: "Advanced 🔥", color: "bg-accent text-accent-foreground" },
};

const GrammarTest = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = difficulty ? questionBank[difficulty] : [];
  const question = questions[currentQ];

  const handleAnswer = (ans: string) => {
    if (showFeedback) return;
    setAnswers({ ...answers, [question.id]: ans });
    setShowFeedback(true);
    if (ans.toLowerCase().trim() === question.answer.toLowerCase().trim()) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    if (currentQ + 1 < questions.length) {
      setCurrentQ((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setDifficulty(null);
    setCurrentQ(0);
    setAnswers({});
    setShowFeedback(false);
    setScore(0);
    setFinished(false);
  };

  const isCorrect = showFeedback && answers[question?.id]?.toLowerCase().trim() === question?.answer.toLowerCase().trim();

  if (!difficulty) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Grammar Test" />
        <div className="px-5 py-6 max-w-2xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold font-display mb-2">Choose Difficulty</h2>
          <p className="text-muted-foreground text-sm mb-8">Select your level to begin the grammar test</p>
          <div className="grid gap-4">
            {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="bg-card rounded-xl border border-border p-6 text-left hover:shadow-md transition-shadow"
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${difficultyLabels[d].color}`}>
                  {difficultyLabels[d].label}
                </span>
                <p className="text-sm text-muted-foreground">
                  {d === "beginner" && "Basic grammar: tenses, articles, pronouns"}
                  {d === "intermediate" && "Conditionals, passive voice, perfect tenses"}
                  {d === "advanced" && "Subjunctive, inversion, complex structures"}
                </p>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Results" />
        <div className="px-5 py-6 max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-2xl border border-border p-8 mt-8">
            <Trophy className="w-16 h-16 text-feature-amber mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-display mb-2">{pct}%</h2>
            <p className="text-muted-foreground mb-1">You scored {score} out of {questions.length}</p>
            <p className="text-sm text-muted-foreground mb-6 capitalize">{difficulty} Level</p>
            <Progress value={pct} className="h-3 mb-6" />
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="outline">Try Another Level</Button>
              <Button onClick={() => { setFinished(false); setCurrentQ(0); setAnswers({}); setScore(0); }} className="gradient-button">
                Retry
              </Button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Grammar Test" />
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyLabels[difficulty].color}`}>
            {difficultyLabels[difficulty].label}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentQ + 1} / {questions.length}
          </span>
        </div>
        <Progress value={((currentQ + 1) / questions.length) * 100} className="h-2 mb-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display leading-relaxed">{question.question}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize">{question.type === "mcq" ? "Multiple Choice" : question.type === "fill" ? "Fill in the Blank" : "Sentence Correction"}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.type === "mcq" && question.options?.map((opt) => {
              const selected = answers[question.id] === opt;
              const correct = showFeedback && opt === question.answer;
              const wrong = showFeedback && selected && opt !== question.answer;
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={showFeedback}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                    correct ? "border-feature-green bg-feature-green/10 text-foreground" :
                    wrong ? "border-destructive bg-destructive/10 text-foreground" :
                    selected ? "border-primary bg-primary/5" :
                    "border-border hover:border-primary/50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}

            {(question.type === "fill" || question.type === "correction") && !showFeedback && (
              <form onSubmit={(e) => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem("ans") as HTMLInputElement).value; handleAnswer(v); }}>
                <Input name="ans" placeholder={question.type === "fill" ? "Type your answer..." : "Correct the sentence..."} className="mb-3" />
                <Button type="submit" className="gradient-button w-full">Submit</Button>
              </form>
            )}

            {showFeedback && (
              <div className={`rounded-xl p-4 ${isCorrect ? "bg-feature-green/10 border border-feature-green/30" : "bg-destructive/10 border border-destructive/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <CheckCircle2 className="w-5 h-5 text-feature-green" /> : <XCircle className="w-5 h-5 text-destructive" />}
                  <span className="font-semibold text-sm">{isCorrect ? "Correct!" : "Incorrect"}</span>
                </div>
                {!isCorrect && <p className="text-sm mb-1"><strong>Answer:</strong> {question.answer}</p>}
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                <Button onClick={nextQuestion} className="mt-4 gradient-button w-full">
                  {currentQ + 1 < questions.length ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default GrammarTest;
