import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Moon, Sun, Lock, Bell, LogOut, MessageCircle, Link2, Unlink } from "lucide-react";
import { generateTelegramLinkCode, disconnectTelegram } from "@/lib/progressService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Settings = () => {
    const { profile, logout } = useAuth();
    const { toast } = useToast();
    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPw, setChangingPw] = useState(false);
    const [telegramConnected, setTelegramConnected] = useState(false);
    const [telegramLinkCode, setTelegramLinkCode] = useState("");
    const [loadingTelegram, setLoadingTelegram] = useState(false);

    // Check Telegram status on load
    useEffect(() => {
        if (auth.currentUser) {
            getDoc(doc(db, "users", auth.currentUser.uid)).then((snap) => {
                if (snap.exists() && snap.data().telegramChatId) {
                    setTelegramConnected(true);
                }
            });
        }
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        if (next) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }
        setChangingPw(true);
        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                toast({ title: "Success", description: "Password updated successfully" });
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.code === "auth/requires-recent-login"
                    ? "Please log out and log back in, then try again."
                    : "Failed to update password",
                variant: "destructive",
            });
        } finally {
            setChangingPw(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            toast({ title: "Error", description: "Failed to log out", variant: "destructive" });
        }
    };

    const handleConnectTelegram = async () => {
        if (!auth.currentUser) return;
        setLoadingTelegram(true);
        try {
            const code = await generateTelegramLinkCode(auth.currentUser.uid);
            setTelegramLinkCode(code);
        } catch {
            toast({ title: "Error", description: "Failed to generate link", variant: "destructive" });
        } finally {
            setLoadingTelegram(false);
        }
    };

    const handleDisconnectTelegram = async () => {
        if (!auth.currentUser) return;
        try {
            await disconnectTelegram(auth.currentUser.uid);
            setTelegramConnected(false);
            setTelegramLinkCode("");
            toast({ title: "Telegram disconnected" });
        } catch {
            toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
        }
    };

    return (
        <AppLayout title="Settings">
            <div className="px-5 py-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold font-display mb-1">Settings</h2>
                <p className="text-muted-foreground text-sm mb-6">Manage your preferences</p>

                {/* Theme */}
                <div className="stat-card mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                            <div>
                                <p className="text-sm font-semibold">Dark Mode</p>
                                <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
                            </div>
                        </div>
                        <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                    </div>
                </div>

                {/* Account Info */}
                <div className="stat-card mb-4">
                    <h3 className="text-sm font-bold font-display mb-3">Account Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{profile?.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Level</span>
                            <span className="font-medium capitalize">{profile?.level}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Member Since</span>
                            <span className="font-medium">{profile?.createdAt?.toLocaleDateString() || "Unknown"}</span>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="stat-card mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-bold font-display">Change Password</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs">New Password</Label>
                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                            <Label className="text-xs">Confirm Password</Label>
                            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="mt-1 h-9 text-sm" />
                        </div>
                        <Button onClick={handleChangePassword} disabled={changingPw} size="sm" className="gradient-button">
                            {changingPw ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </div>

                {/* Telegram Integration */}
                <div className="stat-card mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-bold font-display">Telegram Daily Tasks</h3>
                    </div>
                    {telegramConnected ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-green-500">
                                <Link2 className="w-4 h-4" />
                                <span className="font-semibold">Connected ✅</span>
                            </div>
                            <p className="text-xs text-muted-foreground">You'll receive daily grammar, writing, and speaking tasks via Telegram.</p>
                            <Button onClick={handleDisconnectTelegram} variant="outline" size="sm" className="text-destructive">
                                <Unlink className="w-3 h-3 mr-1" /> Disconnect
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Connect your Telegram to receive daily English practice tasks.</p>
                            {telegramLinkCode ? (
                                <div className="space-y-2">
                                    <p className="text-xs">Click the button below to open our Telegram bot:</p>
                                    <a
                                        href={`https://t.me/english_ai_buddybot?start=${telegramLinkCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                            <MessageCircle className="w-3 h-3 mr-1" /> Open Telegram Bot
                                        </Button>
                                    </a>
                                    <p className="text-[10px] text-muted-foreground">Your link code: <strong>{telegramLinkCode}</strong></p>
                                </div>
                            ) : (
                                <Button onClick={handleConnectTelegram} size="sm" className="gradient-button" disabled={loadingTelegram}>
                                    {loadingTelegram ? "Generating..." : "🔗 Connect Telegram"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div className="stat-card">
                    <Button onClick={handleLogout} variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default Settings;
