import { Bell, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileSidebar from "./MobileSidebar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TopBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(),
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const notifications = notificationsData?.results || notificationsData || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem("lab_token");
    navigate("/");
  };

  const labName = dashboardData?.name || "Loading...";
  const labInitials = labName !== "Loading..." ? labName.substring(0, 2).toUpperCase() : "L";

  return (
    <>
      <header className="sticky top-0 z-50 h-[var(--topbar-height)] border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-secondary" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">H</span>
            </div>
            <span className="font-semibold text-foreground text-lg">HealthLink</span>
            <span className="hidden sm:inline text-xs text-muted-foreground ml-1 bg-secondary px-2 py-0.5 rounded">PATHLAB PORTAL</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((n: any, i: number) => (
                  <DropdownMenuItem key={n.id || i} className="flex flex-col items-start p-3 gap-1 cursor-default focus:bg-secondary/50">
                    <span className="font-medium text-sm">{n.title || "Notification"}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{n.message || n.description || "You have a new alert."}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : "Just now"}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none rounded-full focus-visible:ring-2 focus-visible:ring-ring">
                <span className="hidden sm:block text-sm font-medium text-right leading-tight">
                  {labName}<br />
                  <span className="text-xs text-muted-foreground font-normal">PathLab</span>
                </span>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary hover:bg-primary/20 transition-colors">
                  {labInitials}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default TopBar;
