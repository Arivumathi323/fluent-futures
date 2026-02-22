import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Users,
    Trophy,
    FolderOpen,
    LogOut,
    Shield,
    Trash2,
    Award,
    Plus,
    ExternalLink,
    Loader2,
    X,
    Video,
    Award,
} from "lucide-react";
import {
    getAllUsers,
    deleteUser,
    getAllBadges,
    createBadge,
    awardBadge,
    removeBadge,
    getResources,
    addResource,
    deleteResource,
    getUserExerciseStats,
    uploadFile,
    addManualXP,
    addMediaSession,
    getMediaSessions,
    deleteMediaSession,
    getCertificationRequests,
    updateCertificationStatus,
} from "@/lib/progressService";
import type { MediaQuestion } from "@/lib/progressService";

type Tab = "users" | "badges" | "resources" | "media" | "certifications";

const AdminDashboard = () => {
    const { profile, logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>("users");

    // === USERS ===
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [userStats, setUserStats] = useState<any>(null);
    const [badgeToAward, setBadgeToAward] = useState("");
    const [xpToAdd, setXpToAdd] = useState("");
    const [xpLoading, setXpLoading] = useState(false);

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data.filter((u: any) => !u.isAdmin));
        } catch {
            toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await deleteUser(uid);
            toast({ title: "Deleted", description: "Student has been removed" });
            setUsers((u) => u.filter((x) => x.uid !== uid));
            if (selectedUser?.uid === uid) setSelectedUser(null);
        } catch {
            toast({ title: "Error", description: "Failed to delete student", variant: "destructive" });
        }
    };

    const handleViewUser = async (u: any) => {
        setSelectedUser(u);
        try {
            const stats = await getUserExerciseStats(u.uid);
            setUserStats(stats);
        } catch {
            setUserStats(null);
        }
    };

    const handleAwardBadge = async () => {
        if (!selectedUser || !badgeToAward.trim()) return;
        try {
            await awardBadge(selectedUser.uid, badgeToAward.trim());
            toast({ title: "Badge awarded", description: `"${badgeToAward}" awarded to ${selectedUser.name}` });
            setBadgeToAward("");
            // Refresh user data
            const refreshed = await getAllUsers();
            setUsers(refreshed.filter((u: any) => !u.isAdmin));
            const updated = refreshed.find((u: any) => u.uid === selectedUser.uid);
            if (updated) setSelectedUser(updated);
        } catch {
            toast({ title: "Error", description: "Failed to award badge", variant: "destructive" });
        }
    };

    const handleRemoveBadge = async (badge: string) => {
        if (!selectedUser) return;
        try {
            await removeBadge(selectedUser.uid, badge);
            toast({ title: "Badge removed" });
            const refreshed = await getAllUsers();
            setUsers(refreshed.filter((u: any) => !u.isAdmin));
            const updated = refreshed.find((u: any) => u.uid === selectedUser.uid);
            if (updated) setSelectedUser(updated);
        } catch {
            toast({ title: "Error", description: "Failed to remove badge", variant: "destructive" });
        }
    };

    const handleAddXP = async () => {
        if (!selectedUser || !xpToAdd) return;
        const points = parseInt(xpToAdd);
        if (isNaN(points) || points <= 0) {
            toast({ title: "Invalid XP", description: "Please enter a positive number", variant: "destructive" });
            return;
        }

        setXpLoading(true);
        try {
            await addManualXP(selectedUser.uid, points);
            toast({ title: "XP added", description: `${points} XP added to ${selectedUser.name}` });
            setXpToAdd("");
            // Refresh
            const refreshed = await getAllUsers();
            setUsers(refreshed.filter((u: any) => !u.isAdmin));
            const updated = refreshed.find((u: any) => u.uid === selectedUser.uid);
            if (updated) setSelectedUser(updated);
        } catch {
            toast({ title: "Error", description: "Failed to add XP", variant: "destructive" });
        } finally {
            setXpLoading(false);
        }
    };

    // === RESOURCES ===
    const [resources, setResources] = useState<any[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [newResource, setNewResource] = useState({ title: "", description: "", url: "", category: "", level: "beginner" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [addLoading, setAddLoading] = useState(false);

    const loadResources = async () => {
        setResourcesLoading(true);
        try {
            const data = await getResources();
            setResources(data);
        } catch {
            toast({ title: "Error", description: "Failed to load resources", variant: "destructive" });
        } finally {
            setResourcesLoading(false);
        }
    };

    const handleAddResource = async () => {
        if (!newResource.title || (!newResource.url && !selectedFile)) {
            toast({ title: "Error", description: "Title and either a URL or a File are required", variant: "destructive" });
            return;
        }
        setAddLoading(true);
        try {
            let finalUrl = newResource.url;

            if (selectedFile) {
                const path = `resources/${Date.now()}_${selectedFile.name}`;
                finalUrl = await uploadFile(selectedFile, path);
            }

            await addResource({
                ...newResource,
                url: finalUrl,
                createdBy: profile?.name || profile?.email || "Admin"
            });
            toast({ title: "Resource added", description: "The learning material is now live." });
            setNewResource({ title: "", description: "", url: "", category: "", level: "beginner" });
            setSelectedFile(null);
            loadResources();
        } catch (error: any) {
            console.error("Add resource error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to add resource. Check firewall/rules.",
                variant: "destructive"
            });
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm("Delete this resource?")) return;
        try {
            await deleteResource(id);
            toast({ title: "Resource deleted" });
            setResources((r) => r.filter((x) => x.id !== id));
        } catch {
            toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
        }
    };

    // === MEDIA SESSIONS ===
    const [mediaSessions, setMediaSessions] = useState<any[]>([]);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [mediaAddLoading, setMediaAddLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [newMedia, setNewMedia] = useState({ title: "", description: "", type: "video" as "audio" | "video", level: "beginner" });
    const [mediaQuestions, setMediaQuestions] = useState<MediaQuestion[]>([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);

    const loadMediaSessions = async () => {
        setMediaLoading(true);
        try {
            const data = await getMediaSessions();
            setMediaSessions(data);
        } catch {
            toast({ title: "Error", description: "Failed to load media sessions", variant: "destructive" });
        } finally {
            setMediaLoading(false);
        }
    };

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

    useEffect(() => {
        if (tab === "users") loadUsers();
        else if (tab === "resources") loadResources();
        else if (tab === "media") loadMediaSessions();
        else if (tab === "certifications") loadCerts();
    }, [tab]);

    // === CERTIFICATIONS ===
    const [certs, setCerts] = useState<any[]>([]);
    const [certsLoading, setCertsLoading] = useState(false);

    const loadCerts = async () => {
        setCertsLoading(true);
        try {
            const data = await getCertificationRequests();
            setCerts(data);
        } catch {
            toast({ title: "Error", description: "Failed to load certifications", variant: "destructive" });
        } finally {
            setCertsLoading(false);
        }
    };

    const handleCertAction = async (certId: string, status: "approved" | "rejected") => {
        try {
            await updateCertificationStatus(certId, status, profile?.uid || "");
            toast({ title: status === "approved" ? "Certificate Approved ✅" : "Certificate Rejected" });
            loadCerts();
        } catch {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    const tabs: { key: Tab; icon: any; label: string }[] = [
        { key: "users", icon: Users, label: "Students" },
        { key: "badges", icon: Trophy, label: "Badges" },
        { key: "resources", icon: FolderOpen, label: "Resources" },
        { key: "media", icon: Video, label: "Media Sessions" },
        { key: "certifications", icon: Award, label: "Certifications" },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Header */}
            <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <h1 className="text-lg font-bold font-display">Admin Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{profile?.email}</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-1" /> Logout
                    </Button>
                </div>
            </header>

            <div className="flex">
                {/* Tab sidebar */}
                <aside className="w-48 bg-card border-r border-border min-h-[calc(100vh-65px)] p-3">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                                }`}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <main className="flex-1 p-6 max-w-4xl">
                    {/* ========== USERS TAB ========== */}
                    {tab === "users" && (
                        <>
                            <h2 className="text-xl font-bold font-display mb-1">Manage Students</h2>
                            <p className="text-muted-foreground text-sm mb-6">View progress, manage badges, or remove students</p>

                            {usersLoading ? (
                                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* User List */}
                                    <div>
                                        <h3 className="text-sm font-bold mb-3">All Students ({users.length})</h3>
                                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                                            {users.length === 0 ? (
                                                <p className="p-6 text-center text-muted-foreground text-sm">No students yet</p>
                                            ) : (
                                                users.map((u) => (
                                                    <div key={u.uid} className={`flex items-center justify-between p-4 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/50 ${selectedUser?.uid === u.uid ? "bg-primary/5" : ""}`} onClick={() => handleViewUser(u)}>
                                                        <div>
                                                            <p className="text-sm font-medium">{u.name || "Unnamed"}</p>
                                                            <p className="text-xs text-muted-foreground">{u.email} • {u.xp || 0} XP</p>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.uid); }}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* User Detail */}
                                    {selectedUser && (
                                        <div>
                                            <h3 className="text-sm font-bold mb-3">Student Details</h3>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base font-display">{selectedUser.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div><span className="text-muted-foreground">Email:</span> {selectedUser.email}</div>
                                                        <div><span className="text-muted-foreground">Level:</span> <span className="capitalize">{selectedUser.level}</span></div>
                                                        <div><span className="text-muted-foreground">XP:</span> {selectedUser.xp || 0}</div>
                                                        <div><span className="text-muted-foreground">Streak:</span> {selectedUser.streak || 0} days</div>
                                                    </div>

                                                    {userStats && (
                                                        <div className="bg-secondary/50 rounded-lg p-3">
                                                            <p className="text-xs font-semibold mb-2">📊 Progress</p>
                                                            <p className="text-xs">Exercises: {userStats.totalExercises} • Avg Score: {userStats.avgScore}%</p>
                                                            {Object.keys(userStats.moduleBreakdown).length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {Object.entries(userStats.moduleBreakdown).map(([mod, count]) => (
                                                                        <span key={mod} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{mod}: {count as number}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Badges */}
                                                    <div>
                                                        <p className="text-xs font-semibold mb-2">🏅 Badges</p>
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {(selectedUser.badges || []).length === 0 ? (
                                                                <p className="text-xs text-muted-foreground">No badges yet</p>
                                                            ) : (
                                                                selectedUser.badges.map((b: string) => (
                                                                    <span key={b} className="inline-flex items-center gap-1 text-xs bg-feature-amber/10 text-feature-amber px-2 py-1 rounded-full">
                                                                        {b}
                                                                        <button onClick={() => handleRemoveBadge(b)} className="hover:text-destructive">
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </span>
                                                                ))
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input value={badgeToAward} onChange={(e) => setBadgeToAward(e.target.value)} placeholder="Badge name..." className="h-8 text-xs" />
                                                            <Button onClick={handleAwardBadge} size="sm" className="gradient-button">
                                                                <Award className="w-3 h-3 mr-1" /> Award
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Manual XP */}
                                                    <div className="pt-2 border-t border-border">
                                                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                                            <Plus className="w-3 h-3 text-primary" /> Manual XP Reward
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="number"
                                                                value={xpToAdd}
                                                                onChange={(e) => setXpToAdd(e.target.value)}
                                                                placeholder="Amount (e.g. 50)"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Button
                                                                onClick={handleAddXP}
                                                                disabled={xpLoading || !xpToAdd}
                                                                size="sm"
                                                                className="gradient-button shrink-0"
                                                            >
                                                                {xpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3 h-3 mr-1" />}
                                                                Add XP
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ========== BADGES TAB ========== */}
                    {tab === "badges" && (
                        <>
                            <h2 className="text-xl font-bold font-display mb-1">Badge Management</h2>
                            <p className="text-muted-foreground text-sm mb-6">Award badges to students from the Students tab</p>
                            <Card className="p-6">
                                <p className="text-sm text-muted-foreground">
                                    To award or remove badges:
                                </p>
                                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
                                    <li>Go to the <strong>Students</strong> tab</li>
                                    <li>Click on a student to view their details</li>
                                    <li>Type a badge name and click <strong>Award</strong></li>
                                    <li>Click the <strong>×</strong> next to a badge to remove it</li>
                                </ol>
                            </Card>
                        </>
                    )}

                    {/* ========== RESOURCES TAB ========== */}
                    {tab === "resources" && (
                        <>
                            <h2 className="text-xl font-bold font-display mb-1">Manage Resources</h2>
                            <p className="text-muted-foreground text-sm mb-6">Add learning materials for students</p>

                            {/* Add Resource Form */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-sm font-display flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Add New Resource
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Title *</Label>
                                            <Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} className="mt-1 h-8 text-sm" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">URL *</Label>
                                            <Input value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} className="mt-1 h-8 text-sm" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">File Upload (PDF, Image, Video)</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Input
                                                type="file"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                className="h-9 text-xs py-1"
                                                accept=".pdf,image/*,video/*"
                                            />
                                            {selectedFile && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedFile(null)}
                                                    className="h-9 px-2 text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1">Or provide a URL below</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Description</Label>
                                        <Textarea value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} className="mt-1 text-sm" rows={2} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Category</Label>
                                            <Input value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} className="mt-1 h-8 text-sm" placeholder="Grammar, Vocabulary..." />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Level</Label>
                                            <select value={newResource.level} onChange={(e) => setNewResource({ ...newResource, level: e.target.value })} className="mt-1 w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm">
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Button onClick={handleAddResource} className="gradient-button" disabled={addLoading}>
                                        {addLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                                        {addLoading ? "Adding..." : "Add Resource"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Resource List */}
                            {resourcesLoading ? (
                                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                            ) : resources.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-8">No resources yet. Add one above!</p>
                            ) : (
                                <div className="space-y-3">
                                    {resources.map((r) => (
                                        <Card key={r.id}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold">{r.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{r.category} • {r.level}</p>
                                                    {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm"><ExternalLink className="w-3 h-3" /></Button>
                                                    </a>
                                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteResource(r.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ====== MEDIA SESSIONS TAB ====== */}
                    {tab === "media" && (
                        <>
                            <Card>
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
                                        <div>
                                            <Label className="text-xs">Media File *</Label>
                                            <input type="file" accept={newMedia.type === "video" ? "video/*" : "audio/*"} onChange={(e) => setMediaFile(e.target.files?.[0] || null)} className="mt-1 w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
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
                    )}

                    {/* ====== CERTIFICATIONS TAB ====== */}
                    {tab === "certifications" && (
                        <>
                            <h2 className="text-lg font-bold mb-4">Certification Requests</h2>
                            {certsLoading ? (
                                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                            ) : certs.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-8">No certification requests yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {certs.map((c) => (
                                        <Card key={c.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-sm font-bold">{c.studentName}</h4>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${c.status === "approved" ? "bg-green-500/10 text-green-500"
                                                                    : c.status === "rejected" ? "bg-red-500/10 text-red-500"
                                                                        : "bg-amber-500/10 text-amber-500"
                                                                }`}>{c.status}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-2">{c.studentEmail} • Level: {c.level}</p>
                                                        <div className="flex gap-3 text-xs">
                                                            <span>Grammar: <strong>{c.modules?.grammar || 0}%</strong></span>
                                                            <span>Reading: <strong>{c.modules?.reading || 0}%</strong></span>
                                                            <span>Writing: <strong>{c.modules?.writing || 0}%</strong></span>
                                                            <span>Speaking: <strong>{c.modules?.speaking || 0}%</strong></span>
                                                            <span>Quiz: <strong>{c.modules?.quiz || 0}%</strong></span>
                                                        </div>
                                                        <p className="text-sm font-bold mt-1">Final Score: {c.finalScore}%</p>
                                                    </div>
                                                    {c.status === "pending" && (
                                                        <div className="flex gap-2 shrink-0">
                                                            <Button size="sm" variant="default" onClick={() => handleCertAction(c.id, "approved")}>✅ Approve</Button>
                                                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleCertAction(c.id, "rejected")}>❌ Reject</Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
