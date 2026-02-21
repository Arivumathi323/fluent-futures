import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getResources } from "@/lib/progressService";
import { FolderOpen, ExternalLink, BookOpen, Loader2 } from "lucide-react";
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

const Resources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        getResources()
            .then((data) => setResources(data as Resource[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const categories = ["all", ...new Set(resources.map((r) => r.category))];
    const filtered = filter === "all" ? resources : resources.filter((r) => r.category === filter);

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
                        {filtered.map((r) => (
                            <Card key={r.id} className="hover:shadow-md transition-shadow">
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
                                    <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" /> Open Resource
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Resources;
