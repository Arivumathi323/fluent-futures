import { useState } from "react";
import { Menu, HelpCircle } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="lg:ml-64 relative min-h-screen pb-20">
                {/* Top bar for mobile */}
                <header className="flex items-center gap-3 px-5 py-4 bg-card border-b border-border sticky top-0 z-30 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-base font-bold font-display">{title || ""}</h1>
                </header>

                <main>{children}</main>
            </div>

            {/* Bottom Navigation for Mobile Only */}
            <div className="lg:hidden">
                <BottomNav />
            </div>
        </div>
    );
};

export default AppLayout;
