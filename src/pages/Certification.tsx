import { useEffect, useState } from "react";
import { Award, CheckCircle, Clock, XCircle, BookOpen, Pen, Mic, Brain, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getModuleScores, requestCertification, getStudentCertification, CERT_PASS_MARK } from "@/lib/progressService";
import type { ModuleScores } from "@/lib/progressService";
import { useToast } from "@/hooks/use-toast";

const moduleConfig = [
    { key: "grammar", label: "Grammar", icon: FlaskConical, color: "text-purple-500" },
    { key: "reading", label: "Reading", icon: BookOpen, color: "text-blue-500" },
    { key: "writing", label: "Writing", icon: Pen, color: "text-orange-500" },
    { key: "speaking", label: "Speaking", icon: Mic, color: "text-pink-500" },
    { key: "quiz", label: "Quiz", icon: Brain, color: "text-green-500" },
];

const Certification = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [scores, setScores] = useState<ModuleScores | null>(null);
    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [s, c] = await Promise.all([
                getModuleScores(user!.uid),
                getStudentCertification(user!.uid),
            ]);
            setScores(s);
            setCert(c);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async () => {
        if (!user || !profile || !scores) return;
        setRequesting(true);
        try {
            await requestCertification(
                user.uid,
                profile.name || "Student",
                profile.email || user.email || "",
                scores,
                profile.level || "beginner"
            );
            toast({ title: "Request Sent! 🎉", description: "Your certification request has been submitted for admin review." });
            loadData();
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to request certification", variant: "destructive" });
        } finally {
            setRequesting(false);
        }
    };

    const eligible = scores && scores.overall >= CERT_PASS_MARK && scores.totalExercises >= 5;

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-extrabold font-display gradient-text">Certification</h1>
                    </div>
                    <p className="text-muted-foreground mb-8">Complete all modules with ≥{CERT_PASS_MARK}% average score to earn your certificate.</p>

                    {/* Module Scores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {moduleConfig.map((m) => {
                            const score = scores ? (scores as any)[m.key] : 0;
                            const passed = score >= CERT_PASS_MARK;
                            return (
                                <motion.div
                                    key={m.key}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`bg-card rounded-xl border p-4 text-center ${passed ? "border-green-500/30" : "border-border"}`}
                                >
                                    <m.icon className={`w-8 h-8 mx-auto mb-2 ${m.color}`} />
                                    <p className="text-sm font-bold mb-1">{m.label}</p>
                                    <p className={`text-2xl font-black ${passed ? "text-green-500" : score > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                                        {score}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {passed ? "✅ Passed" : score > 0 ? "⚠️ Below pass" : "Not attempted"}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Overall Score */}
                    <div className="bg-card rounded-xl border border-border p-6 mb-8 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Overall Average Score</p>
                        <p className={`text-5xl font-black ${(scores?.overall || 0) >= CERT_PASS_MARK ? "text-green-500" : "text-amber-500"}`}>
                            {scores?.overall || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Pass mark: {CERT_PASS_MARK}% • Exercises completed: {scores?.totalExercises || 0}
                        </p>
                    </div>

                    {/* Certification Status / Request */}
                    {cert ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`rounded-xl border p-6 text-center ${cert.status === "approved"
                                    ? "bg-green-500/5 border-green-500/30"
                                    : cert.status === "rejected"
                                        ? "bg-red-500/5 border-red-500/30"
                                        : "bg-amber-500/5 border-amber-500/30"
                                }`}
                        >
                            {cert.status === "approved" && (
                                <>
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h2 className="text-2xl font-extrabold text-green-500 mb-1">Certificate Approved! 🎉</h2>
                                    <p className="text-muted-foreground">Congratulations! Your certification has been approved by the admin.</p>
                                    <p className="text-sm text-muted-foreground mt-2">Final Score: <strong>{cert.finalScore}%</strong> • Level: <strong className="capitalize">{cert.level}</strong></p>
                                </>
                            )}
                            {cert.status === "pending" && (
                                <>
                                    <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                                    <h2 className="text-2xl font-extrabold text-amber-500 mb-1">Review Pending</h2>
                                    <p className="text-muted-foreground">Your certification request is being reviewed by the admin.</p>
                                    <p className="text-sm text-muted-foreground mt-2">Final Score: <strong>{cert.finalScore}%</strong></p>
                                </>
                            )}
                            {cert.status === "rejected" && (
                                <>
                                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <h2 className="text-2xl font-extrabold text-red-500 mb-1">Not Approved</h2>
                                    <p className="text-muted-foreground">Your certification was not approved. Keep practicing and try again!</p>
                                    {eligible && (
                                        <Button onClick={handleRequest} className="gradient-button mt-4" disabled={requesting}>
                                            {requesting ? "Requesting..." : "Request Again"}
                                        </Button>
                                    )}
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <div className="bg-card rounded-xl border border-border p-6 text-center">
                            {eligible ? (
                                <>
                                    <Award className="w-12 h-12 text-primary mx-auto mb-3" />
                                    <h2 className="text-xl font-bold mb-2">You're eligible for certification!</h2>
                                    <p className="text-muted-foreground mb-4">Your overall score meets the pass mark. Request your certificate now.</p>
                                    <Button onClick={handleRequest} className="gradient-button px-8" disabled={requesting}>
                                        {requesting ? "Submitting..." : "🎓 Request Certification"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <h2 className="text-xl font-bold mb-2">Not yet eligible</h2>
                                    <p className="text-muted-foreground">
                                        Complete more exercises and achieve ≥{CERT_PASS_MARK}% average to unlock certification.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
};

export default Certification;
