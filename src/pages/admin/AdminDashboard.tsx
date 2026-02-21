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
} from "@/lib/progressService";

type Tab = "users" | "badges" | "resources";

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

    useEffect(() => {
        if (tab === "users") loadUsers();
        else if (tab === "resources") loadResources();
    }, [tab]);

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    const tabs: { key: Tab; icon: any; label: string }[] = [
        { key: "users", icon: Users, label: "Students" },
        { key: "badges", icon: Trophy, label: "Badges" },
        { key: "resources", icon: FolderOpen, label: "Resources" },
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
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
