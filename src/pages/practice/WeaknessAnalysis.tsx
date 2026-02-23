import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Sparkles, Loader2, Target, Lightbulb, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getUserProgress } from "@/lib/progressService";
import { getWeaknessAnalysis } from "@/lib/gemini";
import { motion } from "framer-motion";

const WeaknessAnalysis = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState("");
    const [mistakeCount, setMistakeCount] = useState(0);

    useEffect(() => {
        if (!profile?.uid) return;

        const loadData = async () => {
            try {
                const exercises = await getUserProgress(profile.uid);
                const allMistakes = exercises.flatMap((e: any) => e.mistakes || []);
                setMistakeCount(allMistakes.length);

                const result = await getWeaknessAnalysis(allMistakes);
                setAnalysis(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [profile?.uid]);

    return (
        <AppLayout title="AI Weakness Engine">
            <div className="px-5 py-6 max-w-2xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </Link>

                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-[2rem] bg-accent/5 border border-accent/10 mb-5 relative group">
                        <Brain className="w-12 h-12 text-accent group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                            <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black font-display tracking-tight text-foreground">Weakness Analysis</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">AI-driven pedagogical insights into your learning gaps</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/30 border border-dashed border-border rounded-[3rem]">
                        <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
                        <p className="text-sm font-bold font-display italic animate-pulse text-muted-foreground">Synthesizing learning patterns...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
                                <Target className="w-6 h-6 text-accent mb-2" />
                                <p className="text-2xl font-black font-display">{mistakeCount}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Mistakes Tracked</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
                                <Sparkles className="w-6 h-6 text-amber-500 mb-2" />
                                <p className="text-2xl font-black font-display">Deep</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Analysis Level</p>
                            </div>
                        </div>

                        {/* Main Analysis Card */}
                        <div className="bg-card border border-accent/20 rounded-[2.5rem] overflow-hidden shadow-xl relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <Brain className="w-40 h-40" />
                            </div>

                            <div className="bg-accent shadow-lg px-8 py-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <Lightbulb className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-white font-black font-display tracking-wide uppercase italic text-sm">Coach's Diagnosis</h3>
                            </div>

                            <CardContent className="p-8">
                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-foreground/90 prose-strong:text-accent prose-strong:font-black">
                                    <div className="whitespace-pre-wrap text-[15px] italic font-medium text-muted-foreground border-l-4 border-accent/30 pl-6 py-2">
                                        {analysis}
                                    </div>
                                </div>

                                <div className="mt-10 space-y-4">
                                    <div className="p-5 rounded-2xl bg-secondary/50 border border-border/50 flex items-start gap-4 transform hover:scale-[1.02] transition-transform">
                                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Recommended Action</p>
                                            <p className="text-sm font-bold text-foreground">Review the related module and focus on the examples provided above.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </div>

                        <div className="text-center pt-6">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Based on your last 30 exercises</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
};

export default WeaknessAnalysis;
