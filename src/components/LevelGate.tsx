import { Lock } from "lucide-react";

interface LevelGateProps {
  level: "beginner" | "intermediate" | "advanced";
  unlockedLevels?: string[];
  children: React.ReactNode;
}

const levelOrder = ["beginner", "intermediate", "advanced"];

const LevelGate = ({ level, unlockedLevels = ["beginner"], children }: LevelGateProps) => {
  const isUnlocked = unlockedLevels.includes(level);

  if (isUnlocked) return <>{children}</>;

  const requiredLevel = levelOrder[levelOrder.indexOf(level) - 1];

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 rounded-xl backdrop-blur-sm">
        <Lock className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground text-center px-4">
          Complete <span className="capitalize font-semibold">{requiredLevel}</span> to unlock
        </p>
      </div>
    </div>
  );
};

export default LevelGate;
