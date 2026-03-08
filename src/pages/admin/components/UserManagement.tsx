import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, RotateCw, BookOpen, MapPin, Award, Trophy, Barcode, PieChart as PieIcon, Trash2, X, Plus, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
    getAllUsers, 
    getUserExerciseStats, 
    deleteUser, 
    awardBadge, 
    removeBadge, 
    addManualXP 
} from '@/lib/progressService';

import { UserProfileData } from '@/lib/progressService';

// Interfaces for component props
interface UserManagementProps {
    users: UserProfileData[];
    setUsers: React.Dispatch<React.SetStateAction<UserProfileData[]>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    usersLoading: boolean;
    setUsersLoading: React.Dispatch<React.SetStateAction<boolean>>;
    hasMoreUsers?: boolean;
    onLoadMoreUsers?: () => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
    users, 
    setUsers, 
    searchQuery, 
    setSearchQuery, 
    usersLoading, 
    setUsersLoading,
    hasMoreUsers = false,
    onLoadMoreUsers
}) => {
    const { toast } = useToast();
    
    // Local state for user management
    const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
    const [userStats, setUserStats] = useState<any>(null); // Keeping userStats any for now as it's complex, could be strongly typed later
    const [badgeToAward, setBadgeToAward] = useState("");
    const [xpToAdd, setXpToAdd] = useState("");
    const [xpLoading, setXpLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

    const toggleCard = (uid: string) => {
        setFlippedCards(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

    const handleViewUser = async (u: UserProfileData) => {
        setSelectedUser(u);
        try {
            const stats = await getUserExerciseStats(u.uid);
            setUserStats(stats);
        } catch {
            setUserStats(null);
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

    const handleAwardBadge = async () => {
        if (!selectedUser || !badgeToAward.trim()) return;
        try {
            await awardBadge(selectedUser.uid, badgeToAward.trim());
            toast({ title: "Badge awarded", description: `"${badgeToAward}" awarded to ${selectedUser.name}` });
            setBadgeToAward("");
            // Refresh user data
            const refreshed = await getAllUsers(50); // Refresh fetches first 50
            setUsers(refreshed.users.filter((u) => !u.isAdmin));
            const updated = refreshed.users.find((u) => u.uid === selectedUser.uid);
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
            const refreshed = await getAllUsers(50); // Refresh fetches first 50
            setUsers(refreshed.users.filter((u) => !u.isAdmin));
            const updated = refreshed.users.find((u) => u.uid === selectedUser.uid);
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
            const refreshed = await getAllUsers(50); // Refresh fetches first 50
            setUsers(refreshed.users.filter((u) => !u.isAdmin));
            const updated = refreshed.users.find((u) => u.uid === selectedUser.uid);
            if (updated) setSelectedUser(updated);
        } catch {
            toast({ title: "Error", description: "Failed to add XP", variant: "destructive" });
        } finally {
            setXpLoading(false);
        }
    };

    return (
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
                    
                    {hasMoreUsers && onLoadMoreUsers && (
                        <div className="flex justify-center pb-12">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="rounded-full shadow-sm"
                                disabled={isLoadingMore}
                                onClick={async () => {
                                    setIsLoadingMore(true);
                                    try {
                                        await onLoadMoreUsers();
                                    } finally {
                                        setIsLoadingMore(false);
                                    }
                                }}
                            >
                                {isLoadingMore ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching records...</>
                                ) : (
                                    <><RotateCw className="w-4 h-4 mr-2" /> Load More Students</>
                                )}
                            </Button>
                        </div>
                    )}
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
    );
};

export default UserManagement;
