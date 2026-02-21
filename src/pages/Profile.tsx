import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const weeklyData = [
  { day: "Mon", reading: 45, writing: 30, speaking: 40 },
  { day: "Tue", reading: 60, writing: 50, speaking: 35 },
  { day: "Wed", reading: 40, writing: 40, speaking: 50 },
  { day: "Thu", reading: 70, writing: 60, speaking: 45 },
  { day: "Fri", reading: 80, writing: 70, speaking: 60 },
  { day: "Sat", reading: 65, writing: 55, speaking: 50 },
  { day: "Sun", reading: 70, writing: 55, speaking: 60 },
];

const scoreData = [
  { week: "Week 1", score: 45 },
  { week: "Week 2", score: 62 },
  { week: "Week 3", score: 76 },
  { week: "Week 4", score: 85 },
];

const todayReport = [
  { label: "Reading Practice", value: 80, count: "2 exercises completed", color: "bg-feature-blue" },
  { label: "Writing Practice", value: 50, count: "1 exercise completed", color: "bg-accent" },
  { label: "Speaking Practice", value: 60, count: "3 phrases practiced", color: "bg-feature-pink" },
  { label: "Quiz Challenges", value: 100, count: "1 quiz completed", color: "bg-feature-green" },
];

const stats = [
  { icon: "📅", label: "Days Active", value: "23", change: "+3 this week" },
  { icon: "✅", label: "Exercises Done", value: "147", change: "+15 this week" },
  { icon: "📈", label: "Average Score", value: "85%", change: "+5% improvement" },
  { icon: "🏅", label: "Badges Earned", value: "12", change: "3 more to unlock" },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Profile" />

      <div className="px-5 py-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-display mb-1">Progress Tracking</h2>
        <p className="text-muted-foreground text-sm mb-6">Monitor your learning journey with detailed analytics</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold font-display">{s.value}</p>
              <p className="text-xs text-feature-green mt-1">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <div className="stat-card mb-6">
          <h3 className="text-sm font-bold font-display mb-1">Weekly Activity</h3>
          <p className="text-xs text-muted-foreground mb-4">Minutes spent on each activity this week</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,20%,88%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="reading" fill="hsl(217,91%,60%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="writing" fill="hsl(270,70%,55%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="speaking" fill="hsl(152,69%,45%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Trend */}
        <div className="stat-card mb-6">
          <h3 className="text-sm font-bold font-display mb-1">Score Improvement</h3>
          <p className="text-xs text-muted-foreground mb-4">Your average score over the past month</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,20%,88%)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(270,70%,55%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Report */}
        <div className="stat-card">
          <h3 className="text-sm font-bold font-display mb-1">Today's Report</h3>
          <p className="text-xs text-muted-foreground mb-4">Your activity for 2/21/2026</p>
          <div className="space-y-4">
            {todayReport.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-muted-foreground">{r.count}</span>
                </div>
                <Progress value={r.value} className="h-2.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
