import { Link, useLocation } from "react-router-dom";
import { BookOpen, Trophy, TrendingUp, HelpCircle } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: BookOpen, label: "Home" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/profile", icon: TrendingUp, label: "Profile" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border py-3 px-6 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}

        {/* Help Icon - Prominent "bottom icon" */}
        <button
          onClick={() => window.alert("How can we help you today?")}
          className="flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
        >
          <HelpCircle className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Help</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
