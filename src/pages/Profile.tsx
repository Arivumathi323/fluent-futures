import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getUserProgress, getUserExerciseStats } from "@/lib/progressService";
import { updateUserProfile } from "@/lib/progressService";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Pen, Save } from "lucide-react";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(String(profile?.age || ""));
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalExercises: 0, avgScore: 0, moduleBreakdown: {} as Record<string, number> });
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserExerciseStats(user.uid).then(setStats).catch(console.error);
      getUserProgress(user.uid).then((ex) => setExercises(ex.slice(0, 20))).catch(console.error);
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
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const chartData = Object.entries(stats.moduleBreakdown).map(([module, count]) => ({
    module: module.charAt(0).toUpperCase() + module.slice(1),
    exercises: count,
  }));

  return (
    <AppLayout title="Profile">
      <div className="px-5 py-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-display mb-1">Your Profile</h2>
        <p className="text-muted-foreground text-sm mb-6">View and edit your profile information</p>

        {/* Profile Card */}
        <div className="stat-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {(profile?.name?.charAt(0) || "U").toUpperCase()}
              </div>
              <div>
                {editing ? (
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mb-1 h-8 text-sm" />
                ) : (
                  <h3 className="text-lg font-bold font-display">{profile?.name || "User"}</h3>
                )}
                <p className="text-sm text-muted-foreground capitalize">{profile?.level} • {profile?.email}</p>
              </div>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                <Pen className="w-3 h-3 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setEditing(false)} variant="outline" size="sm">Cancel</Button>
                <Button onClick={handleSave} size="sm" className="gradient-button" disabled={saving}>
                  <Save className="w-3 h-3 mr-1" /> {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          {editing && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-xs">Age</Label>
                <Input value={age} onChange={(e) => setAge(e.target.value)} type="number" className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Institution</Label>
                <Input value={institution} onChange={(e) => setInstitution(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{profile?.xp || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total XP</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{profile?.streak || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Day Streak 🔥</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{stats.totalExercises}</p>
            <p className="text-xs text-muted-foreground mt-1">Exercises Done</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{stats.avgScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">Average Score</p>
          </div>
        </div>

        {/* Badges */}
        {profile?.badges && profile.badges.length > 0 && (
          <div className="stat-card mb-6">
            <h3 className="text-sm font-bold font-display mb-3">Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span key={badge} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  🏅 {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Module Breakdown Chart */}
        {chartData.length > 0 && (
          <div className="stat-card mb-6">
            <h3 className="text-sm font-bold font-display mb-1">Module Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Exercises completed per module</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,20%,88%)" />
                  <XAxis dataKey="module" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="exercises" fill="hsl(234, 85%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {exercises.length > 0 && (
          <div className="stat-card">
            <h3 className="text-sm font-bold font-display mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{ex.module}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.completedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {ex.score}/{ex.totalQuestions}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
