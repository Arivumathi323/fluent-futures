import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard } from "@/lib/progressService";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  uid: string;
  rank: number;
  name: string;
  xp: number;
  level: string;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(20)
      .then((data) => setLeaders(data as LeaderboardEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  const podiumColors: Record<number, string> = { 1: "bg-amber-400", 2: "bg-gray-300", 3: "bg-amber-500" };
  const podiumHeights: Record<number, string> = { 1: "h-24", 2: "h-20", 3: "h-16" };
  const ringColors: Record<number, string> = { 1: "ring-amber-400", 2: "ring-gray-300", 3: "ring-amber-300" };

  return (
    <AppLayout title="Leaderboard">
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold font-display mb-1">Leaderboard</h2>
        <p className="text-muted-foreground text-sm mb-8">See how you rank against other learners</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 stat-card">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No learners yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <div className="flex items-center gap-2 mb-8">
                  <Trophy className="w-5 h-5 text-feature-amber" />
                  <span className="font-bold font-display text-sm">Top Performers</span>
                </div>
                <div className="flex items-end justify-center gap-4">
                  {podiumOrder.map((p) => (
                    <div key={p.uid} className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full ring-4 ${ringColors[p.rank]} flex items-center justify-center bg-secondary text-sm font-bold mb-2`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold font-display">{p.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">{p.xp} XP</p>
                      <div className={`${podiumColors[p.rank]} ${podiumHeights[p.rank]} w-20 rounded-t-lg flex items-center justify-center`}>
                        {p.rank === 1 ? <Trophy className="w-6 h-6 text-amber-800" /> : <Medal className="w-5 h-5 text-foreground/50" />}
                      </div>
                      <p className="text-sm font-bold mt-1">{p.rank === 1 ? "1st" : p.rank === 2 ? "2nd" : "3rd"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {(top3.length < 3 ? leaders : rest).map((u) => (
                <div
                  key={u.uid}
                  className={`flex items-center justify-between px-5 py-4 border-b border-border last:border-0 ${u.uid === user?.uid ? "bg-primary/5" : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold w-6 text-center text-muted-foreground">#{u.rank}</span>
                    <span className="text-sm font-medium">{u.name}</span>
                    {u.uid === user?.uid && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">You</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{u.xp} XP</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
