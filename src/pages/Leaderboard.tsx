import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Trophy, Medal, Award } from "lucide-react";

const topPerformers = [
  { name: "James Chen", initials: "JC", points: 2380, rank: 2 },
  { name: "Emma Wilson", initials: "EW", points: 2450, rank: 1 },
  { name: "Sofia Rodriguez", initials: "SR", points: 2290, rank: 3 },
];

const allUsers = [
  { rank: 4, name: "Liam Harper", points: 2150 },
  { rank: 5, name: "Aisha Patel", points: 2080 },
  { rank: 6, name: "Noah Kim", points: 1950 },
  { rank: 7, name: "Olivia Brown", points: 1890 },
  { rank: 8, name: "You", points: 1720, isUser: true },
];

const podiumOrder = [topPerformers[0], topPerformers[1], topPerformers[2]]; // 2nd, 1st, 3rd

const podiumColors: Record<number, string> = {
  1: "bg-amber-400",
  2: "bg-gray-300",
  3: "bg-amber-500",
};

const podiumHeights: Record<number, string> = {
  1: "h-24",
  2: "h-20",
  3: "h-16",
};

const ringColors: Record<number, string> = {
  1: "ring-amber-400",
  2: "ring-gray-300",
  3: "ring-amber-300",
};

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Leaderboard" />

      <div className="px-5 py-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold font-display mb-1">Leaderboard</h2>
        <p className="text-muted-foreground text-sm mb-8">See how you rank against other learners</p>

        {/* Top 3 Podium */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="w-5 h-5 text-feature-amber" />
            <span className="font-bold font-display text-sm">Top Performers</span>
          </div>

          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map((p) => (
              <div key={p.rank} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ring-4 ${ringColors[p.rank]} flex items-center justify-center bg-secondary text-sm font-bold mb-2`}>
                  {p.initials}
                </div>
                <p className="text-sm font-bold font-display">{p.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{p.points} pts</p>
                <div className={`${podiumColors[p.rank]} ${podiumHeights[p.rank]} w-20 rounded-t-lg flex items-center justify-center`}>
                  {p.rank === 1 ? <Trophy className="w-6 h-6 text-amber-800" /> : <Medal className="w-5 h-5 text-foreground/50" />}
                </div>
                <p className="text-sm font-bold mt-1">{p.rank === 1 ? "1st" : p.rank === 2 ? "2nd" : "3rd"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Full List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {allUsers.map((u) => (
            <div
              key={u.rank}
              className={`flex items-center justify-between px-5 py-4 border-b border-border last:border-0 ${
                u.isUser ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold w-6 text-center text-muted-foreground">#{u.rank}</span>
                <span className="text-sm font-medium">{u.name}</span>
                {u.isUser && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">You</span>}
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{u.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
