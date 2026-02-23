import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Award, Download, BookOpen, Pen, Mic, Brain, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getModuleScores, getStudentCertifications } from "@/lib/progressService";

const Certification = () => {
    const { profile } = useAuth();
    const [scores, setScores] = useState<any>(null);
    const [certs, setCerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.uid) return;
        const load = async () => {
            try {
                const [s, c] = await Promise.all([
                    getModuleScores(profile.uid),
                    getStudentCertifications(profile.uid),
                ]);
                setScores(s);
                setCerts(c);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [profile?.uid]);

    const moduleIcons: Record<string, any> = {
        grammar: Brain,
        reading: BookOpen,
        writing: Pen,
        speaking: Mic,
        quiz: FlaskConical,
    };

    const getTier = (level: string, accuracy: number) => {
        const lvlNum = parseInt(level?.match(/\d+/)?.[0] || "1");
        if (lvlNum >= 6 && accuracy >= 90) return { name: "Gold", class: "from-amber-400 to-yellow-600 text-white" };
        if (lvlNum >= 3 && accuracy >= 80) return { name: "Silver", class: "from-slate-300 to-slate-500 text-white" };
        return { name: "Bronze", class: "from-orange-400 to-orange-700 text-white" };
    };

    if (loading) {
        return (
            <AppLayout title="Certification">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Certification">
            <div className="px-5 py-6 max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-[2rem] bg-primary/5 border border-primary/10 mb-4">
                        <Award className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black font-display tracking-tight">Certification Center</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Earn tiered credentials as you master English</p>
                </div>

                {/* Module Scores */}
                {scores && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black font-display uppercase tracking-widest text-primary/70 italic">Performance Metrics</h3>
                            <div className="px-2.5 py-1 rounded-full bg-secondary text-[10px] font-bold">Updated Recently</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {["grammar", "reading", "writing", "speaking", "quiz"].map((mod) => {
                                const Icon = moduleIcons[mod];
                                const score = scores[mod] || 0;
                                return (
                                    <div key={mod} className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3 shadow-inner">
                                            <Icon className="w-5 h-5 text-primary/60" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">{mod}</p>
                                        <p className={`text-xl font-black ${score >= 70 ? "text-green-500" : score >= 40 ? "text-amber-500" : "text-red-400"}`}>
                                            {score}%
                                        </p>
                                    </div>
                                );
                            })}
                            <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 text-center shadow-md relative overflow-hidden group">
                                <Award className="w-5 h-5 mx-auto mb-1 text-primary relative z-10" />
                                <p className="text-[10px] text-primary/60 uppercase font-black tracking-widest mb-1 relative z-10">Overall Mastery</p>
                                <p className={`text-2xl font-black relative z-10 ${scores.overall >= 70 ? "text-green-600" : "text-amber-600"}`}>
                                    {scores.overall}%
                                </p>
                                <div className="absolute inset-0 bg-primary/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificates */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black font-display uppercase tracking-widest text-primary/70 italic">Your Credentials</h3>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-amber-400" title="Gold" />
                            <div className="w-3 h-3 rounded-full bg-slate-300" title="Silver" />
                            <div className="w-3 h-3 rounded-full bg-orange-400" title="Bronze" />
                        </div>
                    </div>
                    {certs.length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-[2.5rem] text-center py-12 px-6">
                            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 opacity-50">
                                <Award className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-black font-display mb-1 text-muted-foreground/80">Path to Certification</p>
                            <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                                Complete 5+ exercises with an overall average score of 70% or higher to qualify for your first credential.
                            </p>
                            <Button className="mt-6 rounded-xl bg-secondary text-primary font-bold hover:bg-primary/10" disabled>
                                Request Evaluation
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {certs.map((c) => {
                                const tier = getTier(c.level, scores?.overall || 0);
                                return (
                                    <div key={c.id} className="bg-card border border-border rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                        <div className={`absolute top-0 right-0 px-6 py-1.5 rounded-bl-2xl bg-gradient-to-r ${tier.class} text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                            {tier.name} Tier
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                <Award className={`w-8 h-8 ${tier.name === 'Gold' ? 'text-amber-500' : tier.name === 'Silver' ? 'text-slate-400' : 'text-orange-600'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black font-display text-lg tracking-tight mb-0.5 capitalize">{c.level} Learner</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                                    Issued: {c.issuedAt?.toDate?.()?.toLocaleDateString?.() || "Recently"}
                                                </p>
                                            </div>
                                            <div className="hidden sm:block">
                                                <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                                                    <Button size="sm" className="rounded-xl px-5 h-10 font-bold bg-secondary hover:bg-primary/10 text-primary border-none shadow-none">
                                                        <Download className="w-3.5 h-3.5 mr-2" /> Download
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Certification;
