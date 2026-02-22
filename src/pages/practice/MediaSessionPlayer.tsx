import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Video, Headphones, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { saveExerciseResult } from "@/lib/progressService";

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
}

type Phase = "media" | "quiz" | "results";

const MediaSessionPlayer = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user } = useAuth();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<Phase>("media");
    const [mediaEnded, setMediaEnded] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [showFeedback, setShowFeedback] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        loadSession();
    }, [sessionId]);

    const loadSession = async () => {
        if (!sessionId) return;
        try {
            const snap = await getDoc(doc(db, "mediaSessions", sessionId));
            if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() };
                setSession(data);
                setAnswers(new Array((data as any).questions?.length || 0).fill(null));
            }
        } catch (err) {
            console.error("Failed to load session:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMediaEnd = () => {
        setMediaEnded(true);
    };

    const handleStartQuiz = () => {
        setPhase("quiz");
    };

    const handleSelectAnswer = (optionIndex: number) => {
        if (showFeedback) return;
        setSelectedAnswer(optionIndex);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;
        const newAnswers = [...answers];
        newAnswers[currentQ] = selectedAnswer;
        setAnswers(newAnswers);
        setShowFeedback(true);
    };

    const handleNextQuestion = async () => {
        const questions: Question[] = session.questions || [];
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        } else {
            // Calculate score and save
            const score = answers.reduce((sum, a, i) => {
                return sum + (a === questions[i]?.correctAnswer ? 1 : 0);
            }, 0);
            // Include the current answer (just submitted)
            const finalAnswers = [...answers];
            finalAnswers[currentQ] = selectedAnswer;
            const finalScore = finalAnswers.reduce((sum, a, i) => {
                return sum + (a === questions[i]?.correctAnswer ? 1 : 0);
            }, 0);

            if (user) {
                try {
                    await saveExerciseResult(user.uid, `media-${session.type}`, finalScore, questions.length);
                } catch (err) {
                    console.error("Failed to save result:", err);
                }
            }
            setPhase("results");
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </AppLayout>
        );
    }

    if (!session) {
        return (
            <AppLayout>
                <div className="p-6 text-center">
                    <p className="text-lg text-muted-foreground">Session not found.</p>
                    <Link to="/practice/media" className="text-primary underline mt-2 inline-block">
                        ← Back to sessions
                    </Link>
                </div>
            </AppLayout>
        );
    }

    const questions: Question[] = session.questions || [];
    const finalAnswers = [...answers];
    if (phase === "results" && selectedAnswer !== null) {
        finalAnswers[currentQ] = selectedAnswer;
    }
    const totalScore = finalAnswers.reduce((sum, a, i) => {
        return sum + (a === questions[i]?.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = questions.length > 0 ? Math.round((totalScore / questions.length) * 100) : 0;

    return (
        <AppLayout>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <Link to="/practice/media" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to sessions
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${session.type === "video" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                        }`}>
                        {session.type === "video" ? <Video className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                        {session.type}
                    </span>
                    <h1 className="text-2xl font-bold">{session.title}</h1>
                </div>

                {/* Phase 1: Media */}
                {phase === "media" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                            {session.type === "video" ? (
                                <video
                                    ref={videoRef}
                                    src={session.mediaUrl}
                                    controls
                                    onEnded={handleMediaEnd}
                                    className="w-full aspect-video bg-black"
                                    controlsList="nodownload"
                                />
                            ) : (
                                <div className="p-8 flex flex-col items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Headphones className="w-12 h-12 text-purple-500" />
                                    </div>
                                    <p className="text-muted-foreground text-center max-w-md">
                                        Listen carefully to the audio. Questions will unlock after you finish listening.
                                    </p>
                                    <audio
                                        ref={audioRef}
                                        src={session.mediaUrl}
                                        controls
                                        onEnded={handleMediaEnd}
                                        className="w-full max-w-lg"
                                        controlsList="nodownload"
                                    />
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {session.description}
                        </p>

                        <div className="text-center">
                            {!mediaEnded ? (
                                <p className="text-sm text-amber-500 font-medium">
                                    ⏳ Please {session.type === "video" ? "watch the full video" : "listen to the full audio"} before proceeding.
                                </p>
                            ) : (
                                <Button onClick={handleStartQuiz} className="gradient-button px-8 py-3 text-base font-semibold">
                                    Start Quiz ({questions.length} questions)
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Phase 2: Quiz */}
                {phase === "quiz" && questions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Progress */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Question {currentQ + 1} of {questions.length}</span>
                            <div className="flex gap-1">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-colors ${i < currentQ ? "bg-primary" : i === currentQ ? "bg-primary animate-pulse" : "bg-secondary"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-card rounded-xl border border-border p-6">
                            <h2 className="text-xl font-bold mb-6">{questions[currentQ].question}</h2>

                            <div className="space-y-3">
                                {questions[currentQ].options.map((opt, i) => {
                                    const isCorrect = i === questions[currentQ].correctAnswer;
                                    const isSelected = selectedAnswer === i;

                                    let optionClass = "bg-secondary hover:bg-secondary/80 border-transparent cursor-pointer";
                                    if (showFeedback) {
                                        if (isCorrect) optionClass = "bg-green-500/10 border-green-500 text-green-600";
                                        else if (isSelected && !isCorrect) optionClass = "bg-red-500/10 border-red-500 text-red-500";
                                        else optionClass = "bg-secondary border-transparent opacity-50";
                                    } else if (isSelected) {
                                        optionClass = "bg-primary/10 border-primary text-primary";
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectAnswer(i)}
                                            disabled={showFeedback}
                                            className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all font-medium ${optionClass}`}
                                        >
                                            <span className="inline-flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {opt}
                                                {showFeedback && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                                {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex justify-end">
                                {!showFeedback ? (
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={selectedAnswer === null}
                                        variant="default"
                                        size="default"
                                    >
                                        Submit Answer
                                    </Button>
                                ) : (
                                    <Button onClick={handleNextQuestion} variant="default" size="default">
                                        {currentQ < questions.length - 1 ? "Next Question →" : "See Results"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Phase 3: Results */}
                {phase === "results" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-xl border border-border p-8 text-center space-y-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Trophy className="w-10 h-10 text-primary" />
                        </div>

                        <h2 className="text-3xl font-extrabold">
                            {percentage >= 80 ? "Excellent! 🎉" : percentage >= 50 ? "Good Job! 👍" : "Keep Practicing! 💪"}
                        </h2>

                        <div className="text-6xl font-black gradient-text">
                            {percentage}%
                        </div>

                        <p className="text-muted-foreground">
                            You got <strong className="text-foreground">{totalScore}</strong> out of <strong className="text-foreground">{questions.length}</strong> questions correct.
                        </p>

                        <p className="text-sm text-primary font-medium">
                            +{Math.round((totalScore / questions.length) * 20)} XP earned!
                        </p>

                        {/* Answer Review */}
                        <div className="text-left space-y-3 mt-6">
                            <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Answer Review</h3>
                            {questions.map((q, i) => {
                                const userAnswer = finalAnswers[i];
                                const isCorrect = userAnswer === q.correctAnswer;
                                return (
                                    <div key={i} className={`p-4 rounded-lg border ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                                        <div className="flex items-start gap-2">
                                            {isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                                            <div>
                                                <p className="font-medium text-sm">{q.question}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Your answer: <strong>{q.options[userAnswer ?? -1] || "—"}</strong>
                                                    {!isCorrect && <> · Correct: <strong className="text-green-500">{q.options[q.correctAnswer]}</strong></>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 justify-center pt-4">
                            <Link to="/practice/media">
                                <Button variant="outline" size="default">← Back to Sessions</Button>
                            </Link>
                            <Button variant="default" size="default" onClick={() => { setPhase("media"); setMediaEnded(false); setCurrentQ(0); setSelectedAnswer(null); setAnswers(new Array(questions.length).fill(null)); setShowFeedback(false); }}>
                                Retry
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
};

export default MediaSessionPlayer;
