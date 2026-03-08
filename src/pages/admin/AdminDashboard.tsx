import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Users,
    Trophy,
    FolderOpen,
    LogOut,
    Shield,
    Video,
    PieChart as PieIcon,
    Award,
    MessageSquare,
} from "lucide-react";
import {
    getAllUsers,
    getResources,
    getMediaSessions,
    getCertificationRequests,
    getAggregateAnalytics,
} from "@/lib/progressService";
import HumanReview from "./HumanReview";

// Import the new sub-components
import UserManagement from "./components/UserManagement";
import BadgeManagement from "./components/BadgeManagement";
import ResourceManagement from "./components/ResourceManagement";
import MediaManagement from "./components/MediaManagement";
import CertificationsManagement from "./components/CertificationsManagement";
import AnalyticsView from "./components/AnalyticsView";

type Tab = "users" | "badges" | "resources" | "media" | "certifications" | "analytics" | "reviews";

const AdminDashboard = () => {
    const { profile, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>("users");

    // === STATE ===
    const [users, setUsers] = useState<any[]>([]);
    const [lastUsersDoc, setLastUsersDoc] = useState<any>(null);
    const [hasMoreUsers, setHasMoreUsers] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [resources, setResources] = useState<any[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);

    const [mediaSessions, setMediaSessions] = useState<any[]>([]);
    const [mediaLoading, setMediaLoading] = useState(false);

    const [certs, setCerts] = useState<any[]>([]);
    const [certsLoading, setCertsLoading] = useState(false);

    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // === DATA LOADERS ===
    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await getAllUsers(50);
            setUsers(data.users.filter((u: any) => !u.isAdmin));
            setLastUsersDoc(data.lastDoc);
            setHasMoreUsers(data.users.length === 50);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setUsersLoading(false);
        }
    };

    const loadMoreUsers = async () => {
        if (!hasMoreUsers || !lastUsersDoc) return;
        try {
            const data = await getAllUsers(50, lastUsersDoc);
            setUsers(prev => [...prev, ...data.users.filter((u: any) => !u.isAdmin)]);
            setLastUsersDoc(data.lastDoc);
            setHasMoreUsers(data.users.length === 50);
        } catch (error) {
            console.error("Failed to load more users", error);
        }
    };

    const loadResources = async () => {
        setResourcesLoading(true);
        try {
            const data = await getResources();
            setResources(data);
        } catch (error) {
             console.error("Failed to load resources", error);
        } finally {
            setResourcesLoading(false);
        }
    };

    const loadMediaSessions = async () => {
        setMediaLoading(true);
        try {
            const data = await getMediaSessions();
            setMediaSessions(data);
        } catch (error) {
             console.error("Failed to load media sessions", error);
        } finally {
            setMediaLoading(false);
        }
    };

    const loadCerts = async () => {
        setCertsLoading(true);
        try {
            const data = await getCertificationRequests();
            setCerts(data);
        } catch (error) {
             console.error("Failed to load certifications", error);
        } finally {
            setCertsLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const data = await getAggregateAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Load data based on active tab
    useEffect(() => {
        if (tab === "users") loadUsers();
        else if (tab === "resources") loadResources();
        else if (tab === "media") loadMediaSessions();
        else if (tab === "certifications") { loadCerts(); loadUsers(); }
        else if (tab === "analytics") loadAnalytics();
    }, [tab]);

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
                    {tab === "users" && (
                        <UserManagement 
                            users={users} 
                            setUsers={setUsers} 
                            searchQuery={searchQuery} 
                            setSearchQuery={setSearchQuery} 
                            usersLoading={usersLoading} 
                            setUsersLoading={setUsersLoading} 
                            hasMoreUsers={hasMoreUsers}
                            onLoadMoreUsers={loadMoreUsers}
                        />
                    )}
                    
                    {tab === "badges" && <BadgeManagement />}
                    
                    {tab === "resources" && (
                        <ResourceManagement 
                            resources={resources} 
                            setResources={setResources} 
                            resourcesLoading={resourcesLoading} 
                            loadResources={loadResources} 
                            profile={profile} 
                        />
                    )}
                    
                    {tab === "media" && (
                        <MediaManagement 
                            mediaSessions={mediaSessions} 
                            setMediaSessions={setMediaSessions} 
                            mediaLoading={mediaLoading} 
                            loadMediaSessions={loadMediaSessions} 
                            profile={profile} 
                        />
                    )}
                    
                    {tab === "certifications" && (
                        <CertificationsManagement 
                            users={users} 
                            certs={certs} 
                            certsLoading={certsLoading} 
                            loadCerts={loadCerts} 
                            profile={profile} 
                        />
                    )}
                    
                    {tab === "analytics" && (
                        <AnalyticsView 
                            analytics={analytics} 
                            analyticsLoading={analyticsLoading} 
                        />
                    )}
                    
                    {tab === "reviews" && <HumanReview />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
