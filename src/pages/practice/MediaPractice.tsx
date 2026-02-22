import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Headphones, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { getMediaSessions } from "@/lib/progressService";

const MediaPractice = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "video" | "audio">("all");

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await getMediaSessions();
            setSessions(data);
        } catch (err) {
            console.error("Failed to load media sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === "all" ? sessions : sessions.filter((s) => s.type === filter);

    return (
        <AppLayout>
            <div className="p-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl font-extrabold font-display gradient-text mb-2">
                        Audio & Video Practice
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Watch videos or listen to audio, then answer questions to test your understanding.
                    </p>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-8">
                        {(["all", "video", "audio"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === t
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                {t === "all" ? "All Sessions" : t === "video" ? "🎬 Video" : "🎧 Audio"}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                            Loading sessions...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-xl border border-border">
                            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-semibold text-muted-foreground">No sessions available yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Your admin will add audio & video practice sessions soon.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((session, i) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                    <Link
                                        to={`/practice/media/${session.id}`}
                                        className="block bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all group"
                                    >
                                        {/* Type Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${session.type === "video"
                                                    ? "bg-blue-500/10 text-blue-500"
                                                    : "bg-purple-500/10 text-purple-500"
                                                }`}>
                                                {session.type === "video" ? <Video className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                                                {session.type}
                                            </span>
                                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded capitalize">
                                                {session.level}
                                            </span>
                                        </div>

                                        {/* Title & Description */}
                                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                                            {session.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {session.description}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {session.questions?.length || 0} questions
                                            </span>
                                            <span className="flex items-center gap-1 text-primary font-semibold group-hover:translate-x-1 transition-transform">
                                                <Play className="w-3.5 h-3.5" />
                                                Start
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
};

export default MediaPractice;
