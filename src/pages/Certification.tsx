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
                <div className="text-center mb-6">
                    <Award className="w-10 h-10 text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold font-display">Certification</h2>
                    <p className="text-sm text-muted-foreground">Your progress & certificates</p>
                </div>

                {/* Module Scores */}
                {scores && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold font-display mb-3">📊 Module Scores</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {["grammar", "reading", "writing", "speaking", "quiz"].map((mod) => {
                                const Icon = moduleIcons[mod];
                                const score = scores[mod] || 0;
                                return (
                                    <div key={mod} className="stat-card text-center">
                                        <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                                        <p className="text-xs text-muted-foreground capitalize">{mod}</p>
                                        <p className={`text-lg font-bold ${score >= 70 ? "text-green-500" : score >= 40 ? "text-amber-500" : "text-red-400"}`}>
                                            {score}%
                                        </p>
                                    </div>
                                );
                            })}
                            <div className="stat-card text-center border-2 border-primary/30">
                                <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
                                <p className="text-xs text-muted-foreground">Overall</p>
                                <p className={`text-lg font-bold ${scores.overall >= 70 ? "text-green-500" : "text-amber-500"}`}>
                                    {scores.overall}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificates */}
                <div>
                    <h3 className="text-sm font-bold font-display mb-3">🎓 Your Certificates</h3>
                    {certs.length === 0 ? (
                        <div className="stat-card text-center py-8">
                            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm font-semibold text-muted-foreground">No certificates yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Keep practicing! Your instructor will issue a certificate when you're ready.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {certs.map((c) => (
                                <div key={c.id} className="stat-card flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold capitalize">{c.level} Certificate</p>
                                            <p className="text-xs text-muted-foreground">
                                                Issued {c.issuedAt?.toDate?.()?.toLocaleDateString?.() || "Recently"}
                                            </p>
                                        </div>
                                    </div>
                                    <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                                        <Button size="sm" className="gradient-button">
                                            <Download className="w-3 h-3 mr-1" /> Download
                                        </Button>
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Certification;
