import { BookOpen, Pen, Mic, Brain, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const stats = [
  { value: "23", label: "Day Streak 🔥" },
  { value: "147", label: "Exercises Done ✅" },
  { value: "85%", label: "Average Score 📊" },
  { value: "12", label: "Badges Earned 🏆" },
];

const modules = [
  { icon: FlaskConical, title: "Grammar Test", desc: "MCQ, fill-in-blank & more", bg: "bg-feature-purple", to: "/grammar" },
  { icon: BookOpen, title: "Reading Practice", desc: "Improve comprehension skills", bg: "bg-feature-blue", to: "/practice/reading" },
  { icon: Pen, title: "Writing Practice", desc: "Express yourself in writing", bg: "bg-accent", to: "/practice/writing" },
  { icon: Mic, title: "Speaking Practice", desc: "Practice pronunciation", bg: "bg-feature-pink", to: "/practice/speaking" },
  { icon: Brain, title: "Quiz Challenge", desc: "Test your knowledge", bg: "bg-feature-green", to: "/practice/quiz" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Home" />

      <div className="px-5 py-6 max-w-4xl mx-auto">
        {/* Welcome */}
        <h2 className="text-2xl font-bold font-display mb-1">Welcome back, Learner! 👋</h2>
        <p className="text-muted-foreground text-sm mb-6">Continue your English learning journey</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <p className="text-2xl font-bold font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Continue Learning */}
        <h3 className="text-lg font-bold font-display mb-4">Continue Learning</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      <BottomNav />
    </div>
  );
};

export default Dashboard;
