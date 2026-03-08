import React, { useState } from 'react';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addMediaSession, deleteMediaSession, uploadFile } from '@/lib/progressService';

interface MediaQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface MediaManagementProps {
    mediaSessions: any[];
    setMediaSessions: React.Dispatch<React.SetStateAction<any[]>>;
    mediaLoading: boolean;
    loadMediaSessions: () => Promise<void>;
    profile: any;
}

const MediaManagement: React.FC<MediaManagementProps> = ({ mediaSessions, setMediaSessions, mediaLoading, loadMediaSessions, profile }) => {
    const { toast } = useToast();
    const [mediaAddLoading, setMediaAddLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [newMedia, setNewMedia] = useState({ title: "", description: "", type: "video" as "audio" | "video", level: "beginner" });
    const [mediaQuestions, setMediaQuestions] = useState<MediaQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);

    const handleAddMediaSession = async () => {
        if (!newMedia.title || !mediaFile) {
            toast({ title: "Error", description: "Title and a media file are required", variant: "destructive" });
            return;
        }
        const validQs = mediaQuestions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
        if (validQs.length === 0) {
            toast({ title: "Error", description: "Add at least one complete question with all options filled", variant: "destructive" });
            return;
        }
        setMediaAddLoading(true);
        try {
            const path = `media/${Date.now()}_${mediaFile.name}`;
            const mediaUrl = await uploadFile(mediaFile, path);
            await addMediaSession({
                ...newMedia,
                mediaUrl,
                questions: validQs,
                createdBy: profile?.name || profile?.email || "Admin",
            });
            toast({ title: "Session created!", description: "Students can now access this practice session." });
            setNewMedia({ title: "", description: "", type: "video", level: "beginner" });
            setMediaFile(null);
            setMediaQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
            loadMediaSessions();
        } catch (error: any) {
            console.error("Add media session error:", error);
            toast({ title: "Error", description: error.message || "Failed to create session", variant: "destructive" });
        } finally {
            setMediaAddLoading(false);
        }
    };

    const handleDeleteMedia = async (id: string) => {
        if (!confirm("Delete this media session?")) return;
        try {
            await deleteMediaSession(id);
            toast({ title: "Session deleted" });
            setMediaSessions((s) => s.filter((x) => x.id !== id));
        } catch {
            toast({ title: "Error", description: "Failed to delete session", variant: "destructive" });
        }
    };

    const addQuestion = () => {
        setMediaQuestions([...mediaQuestions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    };

    const removeQuestion = (idx: number) => {
        setMediaQuestions(mediaQuestions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const updated = [...mediaQuestions];
        (updated[idx] as any)[field] = value;
        setMediaQuestions(updated);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const updated = [...mediaQuestions];
        updated[qIdx].options[oIdx] = value;
        setMediaQuestions(updated);
    };

    return (
        <>
            <Card className="mb-6">
                <CardHeader><CardTitle className="text-lg">Create Media Session</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Title *</Label>
                            <Input value={newMedia.title} onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })} className="mt-1 h-8 text-sm" placeholder="Session title" />
                        </div>
                        <div>
                            <Label className="text-xs">Type *</Label>
                            <select value={newMedia.type} onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value as "audio" | "video" })} className="mt-1 w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm">
                                <option value="video">🎬 Video</option>
                                <option value="audio">🎧 Audio</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={newMedia.description} onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })} className="mt-1 text-sm" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Level</Label>
                            <select value={newMedia.level} onChange={(e) => setNewMedia({ ...newMedia, level: e.target.value })} className="mt-1 w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">Media File *</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept={newMedia.type === "video" ? "video/*" : "audio/*"}
                                    onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                                    className="h-9 text-xs py-1 flex-1"
                                />
                                {mediaFile && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setMediaFile(null)}
                                        className="h-9 px-2 text-destructive shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MCQ Builder */}
                    <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-bold">MCQ Questions</Label>
                            <Button variant="outline" size="sm" onClick={addQuestion}><Plus className="w-3 h-3 mr-1" />Add Question</Button>
                        </div>
                        {mediaQuestions.map((q, qi) => (
                            <div key={qi} className="bg-secondary/30 rounded-lg p-4 mb-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">Question {qi + 1}</span>
                                    {mediaQuestions.length > 1 && (
                                        <Button variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0" onClick={() => removeQuestion(qi)}><X className="w-3 h-3" /></Button>
                                    )}
                                </div>
                                <Input value={q.question} onChange={(e) => updateQuestion(qi, "question", e.target.value)} placeholder="Enter question" className="h-8 text-sm" />
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-2">
                                            <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, "correctAnswer", oi)} className="accent-primary" />
                                            <Input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="h-7 text-xs" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground">Select the radio button next to the correct answer.</p>
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleAddMediaSession} className="gradient-button" disabled={mediaAddLoading}>
                        {mediaAddLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                        {mediaAddLoading ? "Creating..." : "Create Session"}
                    </Button>
                </CardContent>
            </Card>

            {/* Sessions List */}
            {mediaLoading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
            ) : mediaSessions.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No media sessions yet. Create one above!</p>
            ) : (
                <div className="space-y-3">
                    {mediaSessions.map((s) => (
                        <Card key={s.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${s.type === "video" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>{s.type}</span>
                                        <h4 className="text-sm font-semibold">{s.title}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{s.level} • {s.questions?.length || 0} questions</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteMedia(s.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

export default MediaManagement;
