import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Mic, MicOff, Send, Volume2, Sparkles, Loader2, Briefcase, Coffee, Headphones, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { startScenarioChat } from "@/lib/gemini";
import { textToSpeech, playAudioBlob } from "@/lib/elevenlabs";
import { saveExerciseResult } from "@/lib/progressService";
import { motion, AnimatePresence } from "framer-motion";

const scenarios = [
    { id: "interview", title: "Job Interview", icon: Briefcase, desc: "Practice for your dream job", bg: "bg-blue-500", systemPrompt: "You are a hiring manager at a top tech company. Conduct a professional job interview." },
    { id: "meeting", title: "Office Meeting", icon: Users, desc: "Collaborate with colleagues", bg: "bg-purple-500", systemPrompt: "You are a lead project manager. We are in a team meeting discussing next week's goals." },
    { id: "restaurant", title: "Restaurant", icon: Coffee, desc: "Order food and chat", bg: "bg-orange-500", systemPrompt: "You are a polite waiter at a fine dining restaurant." },
    { id: "support", title: "Customer Support", icon: Headphones, desc: "Solve technical issues", bg: "bg-green-500", systemPrompt: "You are a frustrated customer calling about a broken product. The student is the support agent." },
];

interface Message {
    role: "user" | "model";
    text: string;
}

const ScenarioLearning = () => {
    const { user } = useAuth();
    const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null);
    const [chatSession, setChatSession] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [ttsLoading, setTtsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStartScenario = (scenario: typeof scenarios[0]) => {
        setSelectedScenario(scenario);
        const session = startScenarioChat(scenario.systemPrompt);
        setChatSession(session);

        // Initial message
        setLoading(true);
        session.sendMessage("Let's begin the scenario. Please start as the interlocutor.")
            .then(result => {
                setMessages([{ role: "model", text: result.response.text() }]);
            })
            .finally(() => setLoading(false));
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !chatSession || loading) return;

        const userMsg = text.trim();
        setInputText("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);

        try {
            const result = await chatSession.sendMessage(userMsg);
            const aiText = result.response.text();
            setMessages(prev => [...prev, { role: "model", text: aiText }]);

            if (user) {
                saveExerciseResult(user.uid, "speaking", 1, 1).catch(console.error);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setLoading(false);
        }
    };

    const listenToMessage = async (text: string) => {
        setTtsLoading(true);
        try {
            const blob = await textToSpeech(text);
            playAudioBlob(blob);
        } catch (err: any) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            speechSynthesis.speak(utterance);
        } finally {
            setTtsLoading(false);
        }
    };

    const startRecording = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            handleSendMessage(result);
        };

        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    }, [handleSendMessage]);

    const stopRecording = useCallback(() => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }, []);

    if (!selectedScenario) {
        return (
            <AppLayout title="Scenario Learning">
                <div className="px-5 py-6 max-w-4xl mx-auto">
                    <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>

                    <h2 className="text-2xl font-bold font-display mb-2">Real-Life Scenarios</h2>
                    <p className="text-muted-foreground text-sm mb-8">Practice English in common everyday situations with our AI coach.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenarios.map((s) => (
                            <Card
                                key={s.id}
                                className="cursor-pointer hover:shadow-lg transition-all border-border/50 group"
                                onClick={() => handleStartScenario(s)}
                            >
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg font-display">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={selectedScenario.title}>
            <div className="px-4 py-6 h-[calc(100vh-140px)] max-w-2xl mx-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedScenario(null)}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Exit Roleplay
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Session</span>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative group ${m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-card border border-border rounded-tl-none"
                                    }`}>
                                    <p className="text-sm leading-relaxed">{m.text}</p>
                                    {m.role === "model" && (
                                        <button
                                            onClick={() => listenToMessage(m.text)}
                                            className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-secondary rounded-lg"
                                        >
                                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-none flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-auto pt-4 border-t border-border">
                    <div className="flex gap-2">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${isRecording ? "bg-destructive text-white animate-pulse" : "bg-secondary text-foreground hover:bg-secondary/80"
                                }`}
                        >
                            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                            placeholder="Type your response..."
                            className="flex-1 rounded-xl bg-secondary/50 border-transparent focus:border-primary/30"
                        />
                        <Button
                            onClick={() => handleSendMessage(inputText)}
                            disabled={!inputText.trim() || loading}
                            className="rounded-xl gradient-button"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ScenarioLearning;
