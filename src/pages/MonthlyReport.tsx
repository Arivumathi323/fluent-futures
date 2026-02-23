import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Download, Sparkles, Loader2, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getUserExerciseStats } from "@/lib/progressService";
import { getMonthlyFluencyAnalysis } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const MonthlyReport = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [analysis, setAnalysis] = useState("");

    useEffect(() => {
        if (!profile?.uid) return;

        const loadData = async () => {
            try {
                const s = await getUserExerciseStats(profile.uid);
                setStats(s);

                const result = await getMonthlyFluencyAnalysis(s);
                setAnalysis(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [profile?.uid]);

    const handleDownload = () => {
        window.print(); // Simple PDF fallback
    };

    return (
        <AppLayout title="Monthly Fluency Report">
            <div className="px-5 py-6 max-w-3xl mx-auto print:p-0">
                <div className="print:hidden">
                    <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Monthly Review</span>
                        </div>
                        <h2 className="text-4xl font-black font-display tracking-tight text-foreground">Fluency Report</h2>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Detailed breakdown of your English journey this month</p>
                    </div>
                    <Button onClick={handleDownload} className="gradient-button rounded-2xl h-12 px-6 font-bold shadow-lg print:hidden">
                        <Download className="w-4 h-4 mr-2" /> Export to PDF
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/30 border border-dashed border-border rounded-[3rem]">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-sm font-bold font-display italic animate-pulse text-muted-foreground">Generating your fluency breakdown...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Analysis Header */}
                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-indigo-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                <TrendingUp className="w-64 h-64" />
                            </div>
                            <CardContent className="p-10 relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-black font-display tracking-widest uppercase italic text-sm opacity-90">AI Learning Milestone</h3>
                                </div>
                                <p className="text-xl md:text-2xl font-bold leading-relaxed italic border-l-4 border-white/30 pl-8 py-2">
                                    "{analysis}"
                                </p>
                            </CardContent>
                        </Card>

                        {/* Performance Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <BarChart3 className="w-6 h-6 text-primary mb-3" />
                                <p className="text-3xl font-black font-display tracking-tight">{stats.avgScore}%</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Average Mastery</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <TrendingUp className="w-6 h-6 text-green-500 mb-3" />
                                <p className="text-3xl font-black font-display tracking-tight">{stats.totalExercises}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Exercises Finished</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                                <FileText className="w-6 h-6 text-feature-purple mb-3" />
                                <p className="text-3xl font-black font-display tracking-tight">{stats.moduleStats?.length || 0}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Active Modules</p>
                            </div>
                        </div>

                        {/* Module Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black font-display uppercase tracking-widest text-primary/70 italic ml-2">Module Performance</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {stats.moduleStats?.map((m: any) => (
                                    <div key={m.name} className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/5 transition-colors`}>
                                                <FileText className="w-6 h-6 text-primary/40" />
                                            </div>
                                            <div>
                                                <h4 className="font-black font-display text-lg tracking-tight">{m.name}</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{m.total} Total Attempts</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-black uppercase text-muted-foreground mb-1">Success Rate</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden hidden sm:block">
                                                        <div className="h-full bg-primary" style={{ width: `${m.successRate}%` }} />
                                                    </div>
                                                    <span className="text-lg font-black text-primary">{m.successRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center pt-8 border-t border-border/50 opacity-60">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Fluency Intelligence Engine v1.0</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
};

export default MonthlyReport;
