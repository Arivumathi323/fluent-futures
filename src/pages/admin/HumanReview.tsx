import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle2, User, Clock, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingReviews, submitReviewFeedback } from "@/lib/progressService";
import { useToast } from "@/hooks/use-toast";

const HumanReview = () => {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await getPendingReviews();
            setRequests(data);
        } catch {
            toast({ title: "Error", description: "Failed to load review requests", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleSubmitFeedback = async (id: string) => {
        const text = feedback[id];
        if (!text?.trim()) return;

        setSubmittingId(id);
        try {
            await submitReviewFeedback(id, text, profile?.name || "Verified Teacher");
            toast({ title: "Feedback Sent", description: "The student will be notified." });
            setRequests(r => r.filter(x => x.id !== id));
        } catch {
            toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
        } finally {
            setSubmittingId(null);
        }
    };

    const filtered = requests.filter(r =>
        r.userName?.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.prompt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card/50 p-6 rounded-2xl border border-border/50 shadow-sm">
                <div>
                    <h3 className="text-xl font-black font-display tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Student Review Queue ({requests.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Provide expert feedback on student writing and speaking work</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Input
                        placeholder="Search by student, type or prompt..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 text-sm pl-11 rounded-xl shadow-inner bg-background/50"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-3.5 text-muted-foreground/40" />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Scanning for pending submissions...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl">
                    <CheckCircle2 className="w-16 h-16 text-feature-green/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold font-display">Inbox Zero!</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">No pending student reviews at the moment. All learners are currently on track.</p>
                    <Button onClick={loadRequests} variant="ghost" className="mt-6 text-xs uppercase font-black tracking-widest gap-2">
                        <Loader2 className="w-4 h-4" /> Refresh Queue
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map((r) => (
                        <Card key={r.id} className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm border border-border/30">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-border/50 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black font-display">{r.userName}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                ID: {r.userId.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-y border-border/30">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Type</span>
                                            <Badge variant={(r.type === 'writing' ? 'secondary' : 'outline') as any} className="text-[9px] uppercase font-black">
                                                {r.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Submitted</span>
                                            <span className="text-[10px] font-bold text-foreground/70 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {r.submittedAt?.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-background/40 p-3 rounded-xl border border-border/50">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-2">Prompt/Context</p>
                                        <p className="text-xs font-semibold leading-relaxed text-foreground/80 italic">"{r.prompt}"</p>
                                    </div>
                                </div>

                                <div className="flex-1 p-6 flex flex-col space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Student's Response
                                        </p>
                                        <div className="p-5 rounded-2xl bg-background/60 border border-border/50 shadow-inner">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/90">
                                                {r.content}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Filter className="w-4 h-4" /> Teacher Assessment
                                        </p>
                                        <Textarea
                                            value={feedback[r.id] || ""}
                                            onChange={(e) => setFeedback({ ...feedback, [r.id]: e.target.value })}
                                            placeholder="Write your constructive feedback, corrections, and encouragement here..."
                                            className="min-h-[120px] bg-background/40 border-primary/20 focus:border-primary rounded-2xl text-sm"
                                        />
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                onClick={() => handleSubmitFeedback(r.id)}
                                                className="gradient-button h-11 px-8 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all shrink-0"
                                                disabled={!feedback[r.id]?.trim() || submittingId === r.id}
                                            >
                                                {submittingId === r.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                Send Review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HumanReview;
