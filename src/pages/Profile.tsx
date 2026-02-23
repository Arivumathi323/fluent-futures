import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getUserProgress, getUserExerciseStats, updateProfilePhoto, updateUserProfile } from "@/lib/progressService";
import { useToast } from "@/hooks/use-toast";
import {
  Pen,
  Save,
  Camera,
  Loader2,
  Trophy,
  Award,
  BookOpen,
  Share2,
  ExternalLink,
  MapPin,
  ShieldCheck,
  RotateCw
} from "lucide-react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(String(profile?.age || ""));
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserExerciseStats(user.uid).then(setStats).catch(console.error);
      getUserProgress(user.uid).then((ex) => setExercises(ex.slice(0, 10))).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    setName(profile?.name || "");
    setAge(String(profile?.age || ""));
    setInstitution(profile?.institution || "");
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name,
        age: parseInt(age) || 0,
        institution,
      });
      await refreshProfile();
      setEditing(false);
      toast({ title: "Profile updated", description: "Your digital identity has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      await updateProfilePhoto(user.uid, file);
      await refreshProfile();
      toast({ title: "Photo updated", description: "Your ID photo has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#/id-card/${user?.uid}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "Your public ID card link is now in your clipboard." });
  };

  return (
    <AppLayout title="My ID Card">
      <div className="px-5 py-6 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Side: ID Card Display */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-24">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold font-display">Digital ID</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-2"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <RotateCw className="w-3 h-3" /> Flip Card
              </Button>
            </div>

            <div className="perspective-1000 w-full h-[580px]">
              <motion.div
                className="relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Face */}
                <div className="absolute inset-0 backface-hidden bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                  <div className="h-32 bg-primary/10 relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full" />
                    <div className="p-8 flex justify-between items-start relative z-10 text-primary">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">EngliLearn</span>
                      </div>
                      <ShieldCheck className="w-6 h-6 opacity-40" />
                    </div>
                  </div>

                  <div className="flex-1 px-8 pb-8 flex flex-col items-center">
                    <div className="relative -mt-16 mb-6">
                      <div className="w-36 h-36 rounded-[2rem] bg-background border-4 border-white shadow-xl overflow-hidden relative group">
                        {uploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                          </div>
                        ) : profile?.photoURL ? (
                          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-primary/5 text-primary/30 uppercase">
                            {profile?.name?.charAt(0)}
                          </div>
                        )}
                        <div
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("id-photo-input")?.click();
                          }}
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <input
                        id="id-photo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-2xl font-black font-display tracking-tight text-foreground">{profile?.name || "New Learner"}</h3>
                      <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">{profile?.level || "Beginner"} Learner</p>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-2 mt-8 py-4 border-y border-border/50">
                      <div className="text-center">
                        <p className="text-lg font-black">{profile?.xp || 0}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Total XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black">{profile?.streak || 0}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Streak 🔥</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black">{stats?.avgScore || 0}%</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Accuracy</p>
                      </div>
                    </div>

                    <div className="w-full mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary/60" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Campus</p>
                          <p className="font-semibold text-xs">{profile?.institution || "Global Learning Center"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-primary/60" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Rank</p>
                          <p className="font-semibold text-xs">Top 12% Worldwide</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto w-full pt-6 flex flex-col items-center">
                      <div className="scale-[0.8] grayscale opacity-70 mb-1">
                        <Barcode
                          value={user?.uid.slice(0, 12).toUpperCase() || "ENG-STUDENT"}
                          height={40}
                          width={1.5}
                          fontSize={10}
                          background="transparent"
                        />
                      </div>
                      <p className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase italic">Verified Student Identity</p>
                    </div>
                  </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden rotate-y-180 p-8 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-lg mb-6">
                    <QRCodeSVG
                      value={`${window.location.origin}/#/id-card/${user?.uid}`}
                      size={112}
                    />
                  </div>
                  <h4 className="font-black font-display text-lg mb-2">Digital Pass</h4>
                  <p className="text-xs text-muted-foreground text-center mb-8 px-4">
                    Use this QR code for institutional login and progress verification.
                  </p>

                  <div className="w-full space-y-3">
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Access Level</span>
                      <span className="text-xs font-black uppercase tracking-widest text-primary">Student Premium</span>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col gap-3 w-full">
                    <Button
                      className="w-full gradient-button h-12 rounded-xl text-xs gap-2"
                      onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    >
                      <Share2 className="w-4 h-4" /> Copy Public ID Link
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl text-xs gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`${window.location.origin}/#/id-card/${user?.uid}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" /> View Public Card
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side: Settings & Details */}
        <div className="flex-1 space-y-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black font-display tracking-tight">Profile Details</h3>
                <p className="text-xs text-muted-foreground">Manage your student metadata</p>
              </div>
              <Button
                variant={editing ? "ghost" : "outline"}
                size="sm"
                onClick={() => editing ? setEditing(false) : setEditing(true)}
              >
                {editing ? "Cancel" : <><Pen className="w-3 h-3 mr-2" /> Edit Info</>}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  {editing ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  ) : (
                    <p className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-semibold">{profile?.name || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <p className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm text-muted-foreground select-none">{profile?.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Institution / Campus</Label>
                  {editing ? (
                    <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Stanford University" />
                  ) : (
                    <p className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-semibold">{profile?.institution || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Age</Label>
                  {editing ? (
                    <Input value={age} onChange={(e) => setAge(e.target.value)} type="number" />
                  ) : (
                    <p className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-semibold">{profile?.age || "—"}</p>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {editing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 flex justify-end"
                  >
                    <Button onClick={handleSave} className="gradient-button px-8" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Profile Changes
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Badges */}
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold font-display uppercase tracking-widest">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile?.badges && profile.badges.length > 0 ? (
                  profile.badges.map((badge: string) => (
                    <span key={badge} className="px-3 py-1.5 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-tight">
                      🏅 {badge}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic p-4 text-center w-full">No achievements unlocked yet.</p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="stat-card flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold font-display uppercase tracking-widest">Mastery</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>Level {Math.floor((profile?.xp || 0) / 1000) + 1}</span>
                  <span>{Math.round(((profile?.xp || 0) % 1000) / 10)}% to Next Level</span>
                </div>
                <Progress value={(profile?.xp || 0) % 1000 / 10} className="h-2" />
              </div>
            </div>
          </div>

          {/* Activity Table */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-6">
              <RotateCw className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold font-display uppercase tracking-widest">Recent Performance</h3>
            </div>
            <div className="space-y-3">
              {exercises.length > 0 ? (
                exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center font-black text-primary text-xs">
                        {ex.module?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold capitalize">{ex.module}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {ex.completedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{Math.round((ex.score / (ex.totalQuestions || 1)) * 100)}%</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{ex.score} / {ex.totalQuestions} Hits</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto opacity-20 mb-3" />
                  <p className="text-xs">No activity recorded for this period.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Profile;
