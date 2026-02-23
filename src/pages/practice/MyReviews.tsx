import { useEffect, useState } from "react";
import { ArrowLeft, Clock, CheckCircle2, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentReviews } from "@/lib/progressService";

const MyReviews = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getStudentReviews(user.uid)
            .then(setReviews)
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <AppLayout title="Human Review Tracking">
            <div className="px-5 py-6 max-w-2xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold font-display tracking-tight">Teacher Feedback</h2>
                        <p className="text-sm text-muted-foreground">Track requests submitted for verified teacher review</p>
                    </div>
                    <ShieldCheck className="w-10 h-10 text-primary opacity-20" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading your reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <Card className="text-center p-12 bg-muted/20 border-dashed border-2">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-1">No reviews yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">Submit your writing or speaking exercises for professional feedback.</p>
                        <div className="flex gap-3 justify-center">
                            <Link to="/practice/writing"><Button size="sm">Writing Practice</Button></Link>
                            <Link to="/practice/speaking"><Button size="sm">Speaking Practice</Button></Link>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <Card key={r.id} className={`overflow-hidden border-l-4 ${r.status === 'reviewed' ? 'border-l-feature-green' : 'border-l-feature-amber'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={r.type === 'writing' ? 'secondary' : 'outline'} className="text-[10px] uppercase font-black tracking-widest">
                                                    {r.type}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                                    {r.submittedAt?.toDate().toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base font-display line-clamp-1">{r.prompt}</CardTitle>
                                        </div>
                                        {r.status === 'reviewed' ? (
                                            <Badge className="bg-feature-green/10 text-feature-green border-feature-green/20">Reviewed</Badge>
                                        ) : (
                                            <Badge className="bg-feature-amber/10 text-feature-amber border-feature-amber/20 animate-pulse">Pending</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/30 rounded-lg p-3 mb-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Your Submission
                                        </p>
                                        <p className="text-sm text-foreground/80 line-clamp-3 italic">"{r.content}"</p>
                                    </div>

                                    {r.status === 'reviewed' ? (
                                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                                    {r.reviewedBy?.charAt(0) || "T"}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Teacher Feedback</p>
                                                    <p className="text-xs font-semibold">{r.reviewedBy || "Verified Instructor"}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{r.feedback}</p>
                                        </div>
                                    ) : (
                                        <div className="py-2 flex items-center gap-2 text-muted-foreground italic">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span className="text-xs">A teacher is currently analyzing your work...</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default MyReviews;
