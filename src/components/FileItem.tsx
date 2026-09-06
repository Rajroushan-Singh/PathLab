import { FileText, Image, FileSpreadsheet, Pill, Eye, Download, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { useNavigate } from "react-router-dom";
import { patientDetailPath } from "@/lib/patientRef";

export interface APIReport {
  id: string;
  report_uid: string;
  original_filename: string;
  description: string;
  file_size_mb: number;
  issued_date: string;
  created_at: string;
  user_name: string;
  user_uid: string;
  user_phone: string;
  is_consent_based: boolean;
  consent_expires_at: string | null;
  is_deleted: boolean;
}

const fileTypeIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return <FileText className="w-5 h-5 text-destructive" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "dicom": return <Image className="w-5 h-5 text-primary" />;
    default: return <FileSpreadsheet className="w-5 h-5 text-warning" />;
  }
};

const statusBadge = (file: APIReport) => {
  if (file.is_deleted) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Deleted</span>;
  }
  if (file.is_consent_based) {
    const expired = file.consent_expires_at && new Date(file.consent_expires_at) < new Date();
    if (expired) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Expired Consent</span>;
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">Consented</span>;
  }
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">Own Report</span>;
};

interface Props {
  file: APIReport;
  onClick: () => void;
  onView?: () => void;
}

export const FileCardGrid = ({ file, onClick, onView }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {fileTypeIcon(file.original_filename)}
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{file.original_filename.split('.').pop()?.toUpperCase()}</span>
          </div>
          {statusBadge(file)}
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">{file.original_filename}</h3>
        <p className="text-xs text-muted-foreground mb-3">{file.report_uid} · {file.file_size_mb} MB</p>

        <div className="flex items-center justify-between">
          <UserAvatar user={{
            id: file.user_uid,
            name: file.user_name,
            phone: file.user_phone,
            consentStatus: file.is_consent_based ? (file.consent_expires_at && new Date(file.consent_expires_at) < new Date() ? "Expired" : "Granted") : "N/A"
          }} onNavigate={() => file.user_uid && navigate(patientDetailPath(file.user_uid))} />
          <p className="font-medium text-foreground text-[13px]">
            {new Date(file.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200" 
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              if (onView) onView();
              else onClick();
            }}
          >
            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </button>
          <button className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 ml-auto" title="More" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FileRowList = ({ file, onClick, onView }: Props) => {
  const navigate = useNavigate();

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer hover:bg-primary/5 transition-all duration-300 border-b border-border hover:border-primary/30 last:border-b-0"
    >
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap group-hover:text-foreground transition-colors">
        {new Date(file.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      </td>
      <td className="py-3 px-4">
        <UserAvatar user={{
            id: file.user_uid,
            name: file.user_name,
            phone: file.user_phone,
            consentStatus: file.is_consent_based ? (file.consent_expires_at && new Date(file.consent_expires_at) < new Date() ? "Expired" : "Granted") : "N/A"
          }} onNavigate={() => file.user_uid && navigate(patientDetailPath(file.user_uid))} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {fileTypeIcon(file.original_filename)}
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{file.original_filename}</span>
        </div>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">{statusBadge(file)}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200" 
            title="View" 
            onClick={(e) => {
              e.stopPropagation();
              if (onView) onView();
              else onClick();
            }}
          >
            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </button>
          <button className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200" title="More" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </button>
        </div>
      </td>
    </tr>
  );
};
