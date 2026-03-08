import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getResources } from "@/lib/progressService";
import { FolderOpen, ExternalLink, BookOpen, Loader2, Play, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
    level: string;
}

const levelColors: Record<string, string> = {
    beginner: "bg-feature-green/10 text-feature-green",
    intermediate: "bg-feature-blue/10 text-feature-blue",
    advanced: "bg-feature-purple/10 text-feature-purple",
};

/** Extracts a YouTube video ID from various YouTube URL formats */
function getYouTubeId(url: string): string | null {
    try {
        const parsed = new URL(url);
        // https://youtu.be/VIDEO_ID
        if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
        // https://www.youtube.com/watch?v=VIDEO_ID
        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v");
        }
    } catch {
        // invalid URL
    }
    return null;
}

/** Returns true if URL is a video (YouTube or direct .mp4 etc.) */
function isVideoUrl(url: string): boolean {
    if (getYouTubeId(url)) return true;
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

/** Returns true if URL is an audio file */
function isAudioUrl(url: string): boolean {
    return /\.(mp3|wav|ogg|aac|flac)(\?.*)?$/i.test(url);
}

interface InlinePlayerProps {
    resource: Resource;
    onClose: () => void;
}

const InlinePlayer = ({ resource, onClose }: InlinePlayerProps) => {
    const ytId = getYouTubeId(resource.url);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h3 className="font-bold font-display text-base leading-tight">{resource.title}</h3>
                        {resource.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Player */}
                <div className="relative w-full bg-black">
                    {ytId ? (
                        <div className="aspect-video">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                title={resource.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : isAudioUrl(resource.url) ? (
                        <div className="p-8 flex flex-col items-center gap-4">
                            <BookOpen className="w-16 h-16 text-primary opacity-40" />
                            <audio controls autoPlay className="w-full max-w-md">
                                <source src={resource.url} />
                                Your browser does not support audio playback.
                            </audio>
                        </div>
                    ) : (
                        <div className="aspect-video">
                            <video controls autoPlay className="w-full h-full">
                                <source src={resource.url} />
                                Your browser does not support video playback.
                            </video>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex justify-end border-t border-border">
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" /> Open original link
                    </a>
                </div>
            </div>
        </div>
    );
};

const Resources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [activeResource, setActiveResource] = useState<Resource | null>(null);

    useEffect(() => {
        getResources()
            .then((data) => setResources(data as Resource[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const categories = ["all", ...new Set(resources.map((r) => r.category))];
    const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);

    const handleResourceClick = (r: Resource) => {
        if (isVideoUrl(r.url) || isAudioUrl(r.url)) {
            setActiveResource(r);
        } else {
            window.open(r.url, "_blank", "noopener noreferrer");
        }
    };

    return (
        <AppLayout title="Resources">
            <div className="px-5 py-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold font-display mb-1">Learning Resources</h2>
                <p className="text-muted-foreground text-sm mb-6">Materials uploaded by your instructors</p>

                {/* Filter */}
                {categories.length > 1 && (
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={filter === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(cat)}
                                className={filter === cat ? "gradient-button" : "capitalize"}
                            >
                                {cat === "all" ? "All" : cat}
                            </Button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Loading resources...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 stat-card">
                        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No resources available yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Ask your admin to add learning materials!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((r) => {
                            const isMedia = isVideoUrl(r.url) || isAudioUrl(r.url);
                            const ytId = getYouTubeId(r.url);

                            return (
                                <Card
                                    key={r.id}
                                    className="hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                                    onClick={() => handleResourceClick(r)}
                                >
                                    {/* YouTube Thumbnail */}
                                    {ytId && (
                                        <div className="relative w-full aspect-video bg-black">
                                            <img
                                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                                alt={r.title}
                                                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelColors[r.level] || "bg-secondary"}`}>
                                                {r.level}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{r.category}</span>
                                        </div>
                                        <CardTitle className="text-sm font-display">{r.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                                        <div className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                            {isMedia ? (
                                                <><Play className="w-3 h-3" /> Watch / Play</>
                                            ) : (
                                                <><ExternalLink className="w-3 h-3" /> Open Resource</>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Inline Player Modal */}
            {activeResource && (
                <InlinePlayer
                    resource={activeResource}
                    onClose={() => setActiveResource(null)}
                />
            )}
        </AppLayout>
    );
};

export default Resources;
