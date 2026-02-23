import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    BookOpen,
    Pen,
    Mic,
    Brain,
    TrendingUp,
    Settings,
    LogOut,
    X,
    FolderOpen,
    Trophy,
    Shield,
    HelpCircle,
    Video,
    Award,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { to: "/dashboard", icon: BookOpen, label: "Dashboard" },
    { to: "/grammar", icon: Brain, label: "Grammar" },
    { to: "/practice/reading", icon: BookOpen, label: "Reading" },
    { to: "/practice/writing", icon: Pen, label: "Writing" },
    { to: "/practice/speaking", icon: Mic, label: "Speaking" },
    { to: "/practice/media", icon: Video, label: "A/V Practice" },
    { to: "/practice/quiz", icon: Brain, label: "Quiz" },
    { to: "/profile", icon: TrendingUp, label: "Progress" },
    { to: "/resources", icon: FolderOpen, label: "Resources" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/certification", icon: Award, label: "Certification" },
    { to: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { pathname } = useLocation();
    const { profile, isAdmin, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const userInitial = profile?.name?.charAt(0)?.toUpperCase() || "U";
    const userLevel = profile?.level || "beginner";

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo Section - Using new logo image */}
                <div className="flex flex-col items-center px-6 py-8 border-b border-border">
                    <img
                        src="/favicon.png"
                        alt="EngliLearn"
                        className="h-16 w-auto mb-2 object-contain"
                        onError={(e) => {
                            // Fallback if logo is not found
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-logo');
                            if (fallback) fallback.classList.remove('hidden');
                        }}
                    />
                    <div className="fallback-logo hidden flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center mb-2">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold font-display text-primary">EngliLearn</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Learn • Practice • Speak</p>
                    </div>
                </div>

                {/* User Info */}
                <Link
                    to="/profile"
                    className="flex items-center gap-4 px-6 py-5 border-b border-border hover:bg-secondary/50 transition-colors"
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden border border-primary/20">
                        {profile?.photoURL ? (
                            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide leading-tight">{profile?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{userLevel}</p>
                    </div>
                </Link>

                {/* Navigation - Regular List Layout */}
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                    {navItems.map((item) => {
                        const active = pathname === item.to || pathname.startsWith(item.to + "/");
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${active
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${active ? "text-white" : "text-muted-foreground"}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Admin Link - Integrated in list if admin */}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${pathname.startsWith("/admin")
                                ? "bg-accent/20 text-accent"
                                : "text-accent/70 hover:bg-accent/10 hover:text-accent"
                                }`}
                        >
                            <Shield className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                            <span>Admin Panel</span>
                        </Link>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="px-3 py-4 border-t border-border space-y-1">
                    <button
                        onClick={() => {
                            onClose();
                            window.alert("How can we help you today?");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors w-full"
                    >
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <span>Support / Help</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
