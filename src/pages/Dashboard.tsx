import { useEffect, useState } from "react";
import { BookOpen, Pen, Mic, Brain, FlaskConical, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProgress, getUserExerciseStats } from "@/lib/progressService";

const modules = [
  { icon: FlaskConical, title: "Grammar Test", desc: "MCQ, fill-in-blank & more", bg: "bg-feature-purple", to: "/grammar" },
  { icon: BookOpen, title: "Reading Practice", desc: "Improve comprehension skills", bg: "bg-feature-blue", to: "/practice/reading" },
  { icon: Pen, title: "Writing Practice", desc: "Express yourself in writing", bg: "bg-accent", to: "/practice/writing" },
  { icon: Mic, title: "Speaking Practice", desc: "Practice pronunciation", bg: "bg-feature-pink", to: "/practice/speaking" },
  { icon: Brain, title: "Quiz Challenge", desc: "Test your knowledge", bg: "bg-feature-green", to: "/practice/quiz" },
  { icon: FolderOpen, title: "Resources", desc: "Learning materials", bg: "bg-feature-amber", to: "/resources" },
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ totalExercises: 0, avgScore: 0 });

  useEffect(() => {
    if (user) {
      getUserExerciseStats(user.uid).then(setStats).catch(console.error);
    }
  }, [user]);

  return (
    <AppLayout title="Home">
      <div className="px-5 py-6 max-w-4xl mx-auto">
        {/* Welcome */}
        <h2 className="text-2xl font-bold font-display mb-1">
          Welcome back, {profile?.name || "Learner"}! 👋
        </h2>
        <p className="text-muted-foreground text-sm mb-6">Continue your English learning journey</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{profile?.streak || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Day Streak 🔥</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{stats.totalExercises}</p>
            <p className="text-xs text-muted-foreground mt-1">Exercises Done ✅</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{stats.avgScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">Average Score 📊</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold font-display">{profile?.badges?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Badges Earned 🏆</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="stat-card mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold font-display">Your XP</span>
            <span className="text-sm font-semibold text-primary">{profile?.xp || 0} XP</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="h-3 rounded-full gradient-button transition-all duration-500"
              style={{ width: `${Math.min(((profile?.xp || 0) % 500) / 5, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {500 - ((profile?.xp || 0) % 500)} XP to next level
          </p>
        </div>

        {/* Continue Learning */}
        <h3 className="text-lg font-bold font-display mb-4">Continue Learning</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => (
            <Link
              key={m.title}
              to={m.to}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className={`feature-icon ${m.bg} text-card mb-4 rounded-xl`}>
                <m.icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold font-display mb-1">{m.title}</h4>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
