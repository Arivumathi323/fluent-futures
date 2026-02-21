import { Link } from "react-router-dom";
import { BookOpen, TrendingUp, Award, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    description: "Engage with comprehensive reading, writing, and speaking exercises",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics and daily reports",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Award,
    title: "Earn Badges",
    description: "Collect achievements and showcase your English mastery",
    color: "bg-feature-pink/10 text-feature-pink",
  },
  {
    icon: Users,
    title: "Leaderboard",
    description: "Compete with other learners and climb to the top",
    color: "bg-feature-pink/10 text-feature-pink",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold font-display gradient-text">EnglishMaster</h1>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-lg text-sm font-medium gradient-button"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold font-display gradient-text mb-6 leading-tight"
        >
          Start Your Journey With Us
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          To learn and improve your English skill and knowledge. We will help you for your English skill.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/signup"
            className="inline-block px-8 py-3.5 rounded-full text-base font-semibold gradient-button"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
          >
            <div className={`feature-icon ${f.color} mb-4`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-display mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Index;
