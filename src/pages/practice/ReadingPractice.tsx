import { useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

interface Passage {
  id: number;
  title: string;
  text: string;
  vocabulary: { word: string; meaning: string }[];
  questions: { question: string; options: string[]; answer: string }[];
}

const passages: Passage[] = [
  {
    id: 1,
    title: "The Water Cycle",
    text: "Water is essential for all living things. The water cycle describes how water moves through the environment. Water evaporates from oceans and lakes, forming clouds through condensation. When the clouds become heavy, precipitation occurs as rain or snow. This water flows into rivers and eventually returns to the ocean, completing the cycle.",
    vocabulary: [
      { word: "evaporates", meaning: "changes from liquid to gas" },
      { word: "condensation", meaning: "the process of gas turning into liquid" },
      { word: "precipitation", meaning: "water falling from clouds as rain or snow" },
    ],
    questions: [
      { question: "What happens when clouds become heavy?", options: ["Evaporation", "Precipitation", "Condensation", "Absorption"], answer: "Precipitation" },
      { question: "Where does water evaporate from?", options: ["Rivers only", "Mountains", "Oceans and lakes", "Underground"], answer: "Oceans and lakes" },
    ],
  },
  {
    id: 2,
    title: "The Invention of the Telephone",
    text: "Alexander Graham Bell is credited with inventing the telephone in 1876. Before the telephone, people communicated over long distances using telegraphs, which transmitted coded messages through electrical signals. Bell's invention revolutionized communication by allowing people to speak directly to each other across great distances. Today, smartphones have evolved far beyond Bell's original device.",
    vocabulary: [
      { word: "credited", meaning: "officially recognized as having done something" },
      { word: "telegraphs", meaning: "devices for sending coded messages via electrical signals" },
      { word: "revolutionized", meaning: "completely changed the way something is done" },
    ],
    questions: [
      { question: "When was the telephone invented?", options: ["1856", "1876", "1896", "1900"], answer: "1876" },
      { question: "What did people use before the telephone?", options: ["Email", "Letters only", "Telegraphs", "Radio"], answer: "Telegraphs" },
    ],
  },
];

const ReadingPractice = () => {
  const [passageIdx, setPassageIdx] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selected, setSelected] = useState("");
  const [finished, setFinished] = useState(false);

  const passage = passages[passageIdx];
  const question = passage.questions[currentQ];
  const isCorrect = showFeedback && selected === question?.answer;

  const handleSelect = (opt: string) => {
    if (showFeedback) return;
    setSelected(opt);
    setShowFeedback(true);
    if (opt === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setShowFeedback(false);
    setSelected("");
    if (currentQ + 1 < passage.questions.length) {
      setCurrentQ((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setShowQuestions(false);
    setCurrentQ(0);
    setScore(0);
    setShowFeedback(false);
    setSelected("");
    setFinished(false);
  };

  const nextPassage = () => {
    reset();
    setPassageIdx((i) => (i + 1) % passages.length);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Reading Practice" />
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {!showQuestions && !finished && (
          <>
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-display">{passage.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground mb-6">{passage.text}</p>
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold font-display mb-3">📚 Vocabulary</h4>
                  <div className="space-y-2">
                    {passage.vocabulary.map((v) => (
                      <div key={v.word} className="flex gap-2 text-sm">
                        <span className="font-semibold text-primary">{v.word}:</span>
                        <span className="text-muted-foreground">{v.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => setShowQuestions(true)} className="gradient-button w-full">
              Answer Questions
            </Button>
          </>
        )}

        {showQuestions && !finished && (
          <>
            <Progress value={((currentQ + 1) / passage.questions.length) * 100} className="h-2 mb-4" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">{question.question}</CardTitle>
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
                  <Button onClick={next} className="gradient-button w-full">{currentQ + 1 < passage.questions.length ? "Next" : "See Results"}</Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {finished && (
          <Card className="text-center p-8">
            <Star className="w-14 h-14 text-feature-amber mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-1">{Math.round((score / passage.questions.length) * 100)}%</h2>
            <p className="text-muted-foreground text-sm mb-6">{score}/{passage.questions.length} correct</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="outline">Retry</Button>
              <Button onClick={nextPassage} className="gradient-button">Next Passage</Button>
            </div>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ReadingPractice;
