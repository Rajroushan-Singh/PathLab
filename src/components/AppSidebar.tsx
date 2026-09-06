import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, PlusCircle, FileText, Share2, LogOut, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/overview" },
  { label: "Patients", icon: Users, path: "/patients" },
  { label: "Create Request", icon: PlusCircle, path: "/create-request" },
  { label: "Consent Requests", icon: ClipboardList, path: "/consent-requests" },
  { label: "Reports Vault", icon: FileText, path: "/reports-vault" },
  { label: "Send Reports", icon: Share2, path: "/send-reports" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card h-[calc(100vh-var(--topbar-height))] sticky top-[var(--topbar-height)]">
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path === "/consent-requests" && location.pathname.startsWith("/consent"));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
