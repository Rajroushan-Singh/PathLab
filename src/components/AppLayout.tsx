import { ReactNode } from "react";
import TopBar from "./TopBar";
import AppSidebar from "./AppSidebar";

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <TopBar />
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 min-h-[calc(100vh-var(--topbar-height))]">
        {children}
      </main>
    </div>
    <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
      © 2026 HealthLink Secure PHR Platform. All data is encrypted and consent-protected.
    </footer>
  </div>
);

export default AppLayout;
