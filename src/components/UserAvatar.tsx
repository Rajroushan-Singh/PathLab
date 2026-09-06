import { useState } from "react";
import { cn } from "@/lib/utils";

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  consentStatus?: "Granted" | "Expired" | "N/A";
}

interface Props {
  user: UserInfo;
  onNavigate: () => void;
}

const consentColor = {
  Granted: "text-success",
  Expired: "text-destructive",
  "N/A": "text-muted-foreground",
};

const UserAvatar = ({ user, onNavigate }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const initials = user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U";

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
      >
        {initials.toUpperCase()}
      </button>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-card border border-border rounded-lg shadow-lg p-3 animate-fade-in pointer-events-none">
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>
          {user.consentStatus && (
            <p className={cn("text-xs font-medium mt-1", consentColor[user.consentStatus] || "text-muted-foreground")}>
              Consent: {user.consentStatus}
            </p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-b border-r border-border rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
