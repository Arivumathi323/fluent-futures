import { Menu } from "lucide-react";

const AppHeader = ({ title }: { title: string }) => (
  <header className="flex items-center justify-between px-5 py-4 bg-card border-b border-border sticky top-0 z-40">
    <button className="p-1 text-muted-foreground hover:text-foreground">
      <Menu className="w-6 h-6" />
    </button>
    <h1 className="text-base font-bold font-display">{title}</h1>
    <div className="w-6" />
  </header>
);

export default AppHeader;
