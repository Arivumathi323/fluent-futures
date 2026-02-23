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
    Upload,
    PieChart as PieIcon,
    BarChart as BarIcon,
    ShieldCheck,
    RotateCw,
    MapPin,
    BookOpen,
    MessageSquare,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
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
    deleteCertificate,
    getAggregateAnalytics,
    getCertificationRequests,
    issueCertificate,
} from "@/lib/progressService";
import type { MediaQuestion } from "@/lib/progressService";
import HumanReview from "./HumanReview";

type Tab = "users" | "badges" | "resources" | "media" | "certifications" | "analytics" | "reviews";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

    const toggleCard = (uid: string) => {
        setFlippedCards(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

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
        else if (tab === "certifications") { loadCerts(); loadUsers(); }
        else if (tab === "analytics") loadAnalytics();
    }, [tab]);

    // === ANALYTICS ===
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const data = await getAggregateAnalytics();
            setAnalytics(data);
        } catch {
            toast({ title: "Error", description: "Failed to load analytics", variant: "destructive" });
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // === CERTIFICATIONS ===
    const [certs, setCerts] = useState<any[]>([]);
    const [certsLoading, setCertsLoading] = useState(false);
    const [certStudentId, setCertStudentId] = useState("");
    const [certLevel, setCertLevel] = useState("beginner");
    const [certFile, setCertFile] = useState<File | null>(null);
    const [certUploading, setCertUploading] = useState(false);

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

    const handleIssueCert = async () => {
        if (!certStudentId || !certFile) return;
        setCertUploading(true);
        try {
            const student = users.find((u) => u.uid === certStudentId);
            if (!student) throw new Error("Student not found");
            await issueCertificate(
                student.uid,
                student.name,
                student.email,
                certLevel,
                certFile,
                profile?.uid || ""
            );
            toast({ title: "Certificate Issued ✅", description: `Certificate sent to ${student.name}` });
            setCertStudentId("");
            setCertFile(null);
            loadCerts();
        } catch {
            toast({ title: "Error", description: "Failed to issue certificate", variant: "destructive" });
        } finally {
            setCertUploading(false);
        }
    };

    const handleDeleteCert = async (certId: string) => {
        if (!confirm("Delete this certificate?")) return;
        try {
            await deleteCertificate(certId);
            toast({ title: "Certificate deleted" });
            loadCerts();
        } catch {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
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
        { key: "reviews", icon: MessageSquare, label: "Human Reviews" },
        { key: "analytics", icon: PieIcon, label: "Analytics" },
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
                <main className="flex-1 p-6">
                    {/* ========== USERS TAB ========== */}
                    {tab === "users" && (
                        <>
                            <h2 className="text-xl font-bold font-display mb-1">Manage Students</h2>
                            <p className="text-muted-foreground text-sm mb-6">View progress, manage badges, or remove students</p>

                            {usersLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* User Search & Header */}
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card/50 p-6 rounded-2xl border border-border/50 shadow-sm mb-6">
                                        <div>
                                            <h3 className="text-xl font-black font-display tracking-tight flex items-center gap-2">
                                                <Users className="w-5 h-5 text-primary" />
                                                Student Directory ({users.length})
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">Manage student identities and view performance</p>
                                        </div>
                                        <div className="relative w-full md:w-80">
                                            <Input
                                                placeholder="Search by name, email or UID..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="h-11 text-sm pl-11 rounded-xl shadow-inner bg-background/50"
                                            />
                                            <Users className="w-4 h-4 absolute left-4 top-3.5 text-muted-foreground/40" />
                                        </div>
                                    </div>

                                    {/* Horizontal Grid Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                                        {users.length === 0 ? (
                                            <p className="p-12 text-center text-muted-foreground text-sm col-span-full bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                                                No students found matching your criteria
                                            </p>
                                        ) : (
                                            users
                                                .filter(u =>
                                                    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    u.uid.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((u, index) => (
                                                    <motion.div
                                                        key={u.uid}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="h-[580px]"
                                                    >
                                                        <div className="perspective-1000 w-full h-full">
                                                            <motion.div
                                                                className="relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer"
                                                                animate={{ rotateY: flippedCards[u.uid] ? 180 : 0 }}
                                                                onClick={() => handleViewUser(u)}
                                                            >
                                                                {/* FRONT SIDE */}
                                                                <div className={`absolute inset-0 backface-hidden bg-card border rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col ${selectedUser?.uid === u.uid ? "ring-4 ring-primary border-transparent" : "border-border shadow-md hover:shadow-2xl transition-shadow"}`}>
                                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleCard(u.uid);
                                                                            }}
                                                                            className="bg-primary text-white px-5 py-2 rounded-b-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:pt-3 transition-all flex items-center gap-2 border-x border-b border-primary/20 group/flip"
                                                                        >
                                                                            <RotateCw className="w-3.5 h-3.5 group-hover/flip:rotate-180 transition-transform duration-500" />
                                                                            Flip Card
                                                                        </button>
                                                                    </div>

                                                                    <div className="h-32 bg-primary/10 relative">
                                                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full" />
                                                                        <div className="p-6 flex justify-between items-start relative z-10 text-primary">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center shadow-md">
                                                                                    <BookOpen className="w-4 h-4 text-white" />
                                                                                </div>
                                                                                <span className="font-bold text-sm tracking-tight italic">EngliLearn</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-end pt-8">
                                                                                <div className="bg-primary/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/20">Rank #{index + 1}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1 px-8 pb-8 flex flex-col items-center">
                                                                        <div className="relative -mt-16 mb-6">
                                                                            <div className="w-36 h-36 rounded-[2.2rem] bg-background border-4 border-white shadow-2xl overflow-hidden relative">
                                                                                {u.photoURL ? (
                                                                                    <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-primary/5 text-primary/30 uppercase">
                                                                                        {u.name?.charAt(0)}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-center space-y-1.5">
                                                                            <h3 className="text-xl font-black font-display tracking-tight text-foreground line-clamp-1">{u.name}</h3>
                                                                            <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">{u.level || "Beginner"} Learner</p>
                                                                            <p className="text-[10px] text-muted-foreground font-medium opacity-70 truncate max-w-[200px]">{u.email}</p>
                                                                        </div>

                                                                        <div className="w-full grid grid-cols-3 gap-2 mt-7 py-4 border-y border-border/50">
                                                                            <div className="text-center">
                                                                                <p className="text-base font-black tracking-tight">{u.xp || 0}</p>
                                                                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Total XP</p>
                                                                            </div>
                                                                            <div className="text-center border-x border-border/30">
                                                                                <p className="text-base font-black tracking-tight">{u.streak || 0}</p>
                                                                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Streak 🔥</p>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <p className="text-base font-black tracking-tight">
                                                                                    {selectedUser?.uid === u.uid && userStats ? userStats.avgScore : (u.xp > 50 ? "82" : "0")}%
                                                                                </p>
                                                                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Accuracy</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="w-full mt-6 space-y-3.5">
                                                                            <div className="flex items-center gap-3 text-sm">
                                                                                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-sm border border-border/50">
                                                                                    <MapPin className="w-4 h-4 text-primary/60" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Campus</p>
                                                                                    <p className="font-semibold text-xs text-foreground/80 line-clamp-1">{u.institution || "Global Learning Center"}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 text-sm">
                                                                                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-sm border border-border/50">
                                                                                    <Award className="w-4 h-4 text-primary/60" />
                                                                                </div>
                                                                                <div className="flex-1 overflow-hidden">
                                                                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Achievements</p>
                                                                                    <div className="flex gap-1.5 mt-0.5">
                                                                                        {(u.badges || []).length > 0 ? u.badges.slice(0, 3).map((b: string) => (
                                                                                            <div key={b} className="w-4.5 h-4.5 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20" title={b}>
                                                                                                <Trophy className="w-2.5 h-2.5 text-amber-600" />
                                                                                            </div>
                                                                                        )) : <span className="text-[10px] italic text-muted-foreground/50">No badges yet</span>}
                                                                                        {(u.badges || []).length > 3 && <span className="text-[9px] font-black text-primary/70">+{(u.badges || []).length - 3}</span>}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-auto w-full pt-6 flex flex-col items-center relative">
                                                                            <div className="scale-[0.8] grayscale opacity-40 group-hover:opacity-100 transition-opacity mb-2">
                                                                                <Barcode
                                                                                    value={u.uid}
                                                                                    height={35}
                                                                                    width={1.0}
                                                                                    fontSize={10}
                                                                                    background="transparent"
                                                                                    displayValue={false}
                                                                                />
                                                                            </div>
                                                                            <p className="text-[8px] font-bold text-muted-foreground tracking-[0.2em] uppercase italic border-t border-border/30 w-full text-center pt-2">Verified Student ID #{u.uid.slice(-6).toUpperCase()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* BACK SIDE */}
                                                                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-card border rounded-[2.5rem] shadow-2xl overflow-hidden p-9 flex flex-col ${selectedUser?.uid === u.uid ? "ring-4 ring-primary border-transparent" : "border-border"}`}>
                                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleCard(u.uid);
                                                                            }}
                                                                            className="bg-primary text-white px-5 py-2 rounded-b-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:pt-3 transition-all flex items-center gap-2 border-x border-b border-primary/20 group/flip"
                                                                        >
                                                                            <RotateCw className="w-3.5 h-3.5 group-hover/flip:rotate-180 transition-transform duration-500" />
                                                                            Flip Back
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex justify-between items-start mb-8 w-full mt-4">
                                                                        <div className="w-20 h-20 bg-white p-2 rounded-[1.2rem] shadow-xl border border-border ring-4 ring-secondary/30">
                                                                            <QRCodeSVG
                                                                                value={`${window.location.origin}/#/id-card/${u.uid}`}
                                                                                size={64}
                                                                            />
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <h4 className="font-black font-display text-sm tracking-tight">Performance Summary</h4>
                                                                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Analytics Node: FF-SEC-{u.uid.slice(-4).toUpperCase()}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1 w-full space-y-8">
                                                                        <div className="relative h-44 w-full">
                                                                            {selectedUser?.uid === u.uid && userStats ? (
                                                                                <>
                                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                                        <PieChart>
                                                                                            <Pie
                                                                                                data={[
                                                                                                    { name: "Success", value: userStats.moduleStats?.reduce((a: any, b: any) => a + b.success, 0) || 0 },
                                                                                                    { name: "Failure", value: userStats.moduleStats?.reduce((a: any, b: any) => a + b.failure, 0) || 0 }
                                                                                                ]}
                                                                                                cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value"
                                                                                                stroke="none"
                                                                                            >
                                                                                                <Cell fill="#22c55e" className="drop-shadow-sm" />
                                                                                                <Cell fill="#ef4444" className="drop-shadow-sm opacity-60" />
                                                                                            </Pie>
                                                                                            <Tooltip />
                                                                                        </PieChart>
                                                                                    </ResponsiveContainer>
                                                                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                                                        <span className="text-3xl font-black text-primary tracking-tighter">{userStats.avgScore}%</span>
                                                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Purity</span>
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                <div className="w-full h-full rounded-full border-4 border-dashed border-muted/50 flex flex-col items-center justify-center opacity-40 bg-muted/10 animate-pulse">
                                                                                    <PieIcon className="w-6 h-6 mb-2" />
                                                                                    <span className="text-[10px] font-black tracking-widest uppercase">Click to Load</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 text-center shadow-sm">
                                                                                <p className="text-2xl font-black tracking-tight">{u.xp > 0 ? Math.floor(u.xp / 10) : 0}</p>
                                                                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Modules Done</p>
                                                                            </div>
                                                                            <div
                                                                                className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-center shadow-sm hover:bg-destructive/10 transition-colors group/trash"
                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.uid); }}
                                                                            >
                                                                                <Trash2 className="w-6 h-6 mx-auto mb-1 text-destructive/60 group-hover/trash:text-destructive group-hover/trash:scale-110 transition-transform" />
                                                                                <p className="text-[9px] text-destructive/40 font-black uppercase tracking-widest group-hover/trash:text-destructive transition-colors">Terminate Profile</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-auto w-full">
                                                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex justify-between items-center shadow-sm">
                                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Security Status</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                                                                                <span className="text-[11px] font-black uppercase tracking-widest text-primary">Secure</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}
                            {selectedUser && (
                                <div className="lg:sticky lg:top-24">
                                    <h3 className="text-sm font-bold mb-3">Student Details Management</h3>
                                    <Card className="shadow-lg border-primary/10">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {selectedUser.name?.charAt(0)}
                                                </div>
                                                <CardTitle className="text-base font-display">{selectedUser.name}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-2">
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="bg-secondary/30 p-2 rounded-lg"><span className="text-muted-foreground block mb-0.5">Email</span> <span className="font-medium truncate block">{selectedUser.email}</span></div>
                                                <div className="bg-secondary/30 p-2 rounded-lg"><span className="text-muted-foreground block mb-0.5">Level</span> <span className="font-medium capitalize block">{selectedUser.level}</span></div>
                                                <div className="bg-secondary/30 p-2 rounded-lg"><span className="text-muted-foreground block mb-0.5">XP</span> <span className="font-medium block">{selectedUser.xp || 0}</span></div>
                                                <div className="bg-secondary/30 p-2 rounded-lg"><span className="text-muted-foreground block mb-0.5">Streak</span> <span className="font-medium block">{selectedUser.streak || 0} days</span></div>
                                            </div>

                                            {userStats && (
                                                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                                                    <p className="text-[10px] uppercase font-bold text-primary/70 mb-2 flex items-center gap-1">
                                                        <PieIcon className="w-3 h-3" /> Detailed Results
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold leading-tight">{userStats.totalExercises}</p>
                                                            <p className="text-[9px] text-muted-foreground uppercase">Exercises</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold leading-tight">{userStats.avgScore}%</p>
                                                            <p className="text-[9px] text-muted-foreground uppercase">Avg Score</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {userStats.moduleStats?.map((m: any) => (
                                                            <div key={m.name} className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded text-[10px] border border-border/50">
                                                                <span className="font-medium">{m.name}:</span> {m.success}/{m.total}
                                                                <span className={`ml-1 font-bold ${m.successRate >= 70 ? "text-green-500" : "text-amber-500"}`}>
                                                                    {m.successRate}%
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div>
                                                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                                    <Trophy className="w-3 h-3 text-feature-amber" /> Badges
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {(selectedUser.badges || []).length === 0 ? (
                                                        <p className="text-xs text-muted-foreground italic">No badges awarded yet</p>
                                                    ) : (
                                                        selectedUser.badges.map((b: string) => (
                                                            <span key={b} className="inline-flex items-center gap-1.5 text-[10px] font-medium bg-feature-amber/10 text-feature-amber px-2.5 py-1 rounded-full border border-feature-amber/20 group">
                                                                {b}
                                                                <button onClick={() => handleRemoveBadge(b)} className="opacity-50 hover:opacity-100 hover:text-destructive transition-opacity">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input value={badgeToAward} onChange={(e) => setBadgeToAward(e.target.value)} placeholder="Enter badge name..." className="h-8 text-xs bg-muted/30" />
                                                    <Button onClick={handleAwardBadge} size="sm" className="gradient-button h-8 text-xs shrink-0">
                                                        <Award className="w-3 h-3 mr-1" /> Award
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Manual XP */}
                                            <div className="pt-2 border-t border-border">
                                                <p className="text-xs font-semibold mb-2 flex items-center gap-1 text-primary/80">
                                                    <Plus className="w-3 h-3" /> Manual XP Reward
                                                </p>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        value={xpToAdd}
                                                        onChange={(e) => setXpToAdd(e.target.value)}
                                                        placeholder="Amount..."
                                                        className="h-8 text-xs bg-muted/30"
                                                    />
                                                    <Button
                                                        onClick={handleAddXP}
                                                        disabled={xpLoading || !xpToAdd}
                                                        size="sm"
                                                        className="gradient-button h-8 shrink-0 text-xs"
                                                    >
                                                        {xpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3 h-3 mr-1" />}
                                                        Reward
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </>
                    )
                    }

                    {/* ========== BADGES TAB ========== */}
                    {
                        tab === "badges" && (
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
                        )
                    }

                    {/* ========== RESOURCES TAB ========== */}
                    {
                        tab === "resources" && (
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
                        )
                    }

                    {/* ====== MEDIA SESSIONS TAB ====== */}
                    {
                        tab === "media" && (
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
                        )
                    }

                    {/* ====== CERTIFICATIONS TAB ====== */}
                    {
                        tab === "certifications" && (
                            <>
                                {/* Issue Certificate Form */}
                                <Card className="mb-6">
                                    <CardContent className="p-4">
                                        <h3 className="text-sm font-bold mb-3">🎓 Issue Certificate</h3>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <Label className="text-xs">Student *</Label>
                                                <select
                                                    value={certStudentId}
                                                    onChange={(e) => setCertStudentId(e.target.value)}
                                                    className="mt-1 w-full h-8 rounded-md border bg-background px-2 text-sm"
                                                >
                                                    <option value="">Select student...</option>
                                                    {users.map((u) => (
                                                        <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Level</Label>
                                                <select
                                                    value={certLevel}
                                                    onChange={(e) => setCertLevel(e.target.value)}
                                                    className="mt-1 w-full h-8 rounded-md border bg-background px-2 text-sm"
                                                >
                                                    <option value="beginner">Beginner</option>
                                                    <option value="intermediate">Intermediate</option>
                                                    <option value="advanced">Advanced</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <Label className="text-xs">Certificate PDF *</Label>
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                                                className="mt-1 h-8 text-xs"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleIssueCert}
                                            disabled={certUploading || !certStudentId || !certFile}
                                            size="sm"
                                            className="gradient-button"
                                        >
                                            {certUploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</> : "📄 Issue Certificate"}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Issued Certificates List */}
                                <h3 className="text-sm font-bold mb-3">Issued Certificates</h3>
                                {certsLoading ? (
                                    <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                                ) : certs.length === 0 ? (
                                    <p className="text-center text-muted-foreground text-sm py-8">No certificates issued yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {certs.map((c) => (
                                            <Card key={c.id}>
                                                <CardContent className="flex items-center justify-between p-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-sm font-bold">{c.studentName}</h4>
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded capitalize bg-green-500/10 text-green-500">Issued</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Level: {c.level} • {c.studentEmail}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                            <Button size="sm" variant="outline">📥 View PDF</Button>
                                                        </a>
                                                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCert(c.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </>
                        )
                    }

                    {/* ====== ANALYTICS TAB ====== */}

                    {tab === "analytics" && (
                        <>
                            <h2 className="text-lg font-bold mb-4">Performance Analytics</h2>
                            {analyticsLoading ? (
                                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
                            ) : !analytics ? (
                                <p className="text-center text-muted-foreground text-sm py-8">No analytics data available.</p>
                            ) : (
                                <div className="space-y-6">
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Total Students</p>
                                                <h3 className="text-2xl font-bold">{analytics.totalStudents}</h3>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Total Exercises</p>
                                                <h3 className="text-2xl font-bold">{analytics.totalExercises}</h3>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Average Score</p>
                                                <h3 className="text-2xl font-bold">{analytics.avgScore}%</h3>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Module Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {analytics.moduleStats.map((module: any) => (
                                            <Card key={module.name}>
                                                <CardHeader className="p-4 pb-0">
                                                    <CardTitle className="text-sm font-bold">{module.name} Performance</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 h-[300px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: "Success", value: module.success },
                                                                    { name: "Failure", value: module.failure },
                                                                ]}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                <Cell fill="#22c55e" />
                                                                <Cell fill="#ef4444" />
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend verticalAlign="bottom" height={36} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="text-center mt-[-160px] relative pointer-events-none">
                                                        <p className="text-xl font-bold">{module.successRate}%</p>
                                                        <p className="text-[10px] text-muted-foreground">Success Rate</p>
                                                    </div>
                                                    <div className="mt-[100px] text-center text-xs text-muted-foreground">
                                                        {module.total} total exercises completed
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {tab === "reviews" && <HumanReview />}
                </main >
            </div >
        </div >
    );
};

export default AdminDashboard;
