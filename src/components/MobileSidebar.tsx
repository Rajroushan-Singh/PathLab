import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, PlusCircle, FileText, Share2, LogOut, X, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/overview" },
  { label: "Patients", icon: Users, path: "/patients" },
  { label: "Create Request", icon: PlusCircle, path: "/create-request" },
  { label: "Consent Requests", icon: ClipboardList, path: "/consent-requests" },
  { label: "Reports Vault", icon: FileText, path: "/reports-vault" },
  { label: "Send Reports", icon: Share2, path: "/send-reports" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ open, onClose }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border shadow-xl flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-foreground">Menu</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose(); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={() => { navigate("/login"); onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileSidebar;
