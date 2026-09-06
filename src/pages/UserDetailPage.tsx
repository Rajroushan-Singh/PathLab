import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, ShieldCheck, FileText, Calendar, Eye, HeartPulse } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { decodePatientRef } from "@/lib/patientRef";
import { ReportViewerModal } from "@/components/ReportViewerModal";

const UserDetailPage = () => {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const [viewerFile, setViewerFile] = useState<Record<string, unknown> | null>(null);

  const userUid = ref ? decodePatientRef(ref) : "";

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", userUid],
    queryFn: () => api.getUserByUid(userUid),
    enabled: !!userUid,
  });

  const { data: reportsData, isLoading: isLoadingReports } = useQuery({
    queryKey: ["userReports", userUid],
    queryFn: () => api.getUserReportsByUid(userUid),
    enabled: !!userUid && !!patient,
  });

  const isLoading = isLoadingPatient || isLoadingReports;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!patient && !isLoadingPatient) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <p className="text-sm text-muted-foreground">Patient not found.</p>
        </div>
      </AppLayout>
    );
  }

  const userFiles = reportsData?.results || [];
  const userName = patient?.name || userFiles[0]?.user_name || "Patient";
  const userPhone = patient?.phone || userFiles[0]?.user_phone || "N/A";
  const displayUid = patient?.user_uid || userUid;

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const genderLabel =
    patient?.gender === "M" ? "Male" : patient?.gender === "F" ? "Female" : patient?.gender ? "Other" : null;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{userName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {userPhone}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> UID: {displayUid}
              </span>
              {patient?.blood_group && (
                <span className="flex items-center gap-1">
                  <HeartPulse className="w-4 h-4 text-destructive" /> {patient.blood_group}
                </span>
              )}
              {genderLabel && <span>{genderLabel}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Total Reports</p>
            <p className="text-2xl font-bold text-foreground mt-1">{userFiles.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Consent Files</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {userFiles.filter((f: { is_consent_based?: boolean }) => f.is_consent_based).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Latest Report</p>
            <p className="text-sm font-medium text-foreground mt-1">
              {userFiles[0]
                ? new Date(userFiles[0].created_at || userFiles[0].issued_date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Associated Reports</h2>
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Report
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {userFiles.map((file: {
                  id: string;
                  original_filename: string;
                  created_at?: string;
                  issued_date?: string;
                  is_consent_based?: boolean;
                  consent_expires_at?: string;
                }) => {
                  let statusText = "Own Report";
                  let statusColor = "text-success bg-success/10";
                  if (file.is_consent_based) {
                    if (file.consent_expires_at && new Date(file.consent_expires_at) < new Date()) {
                      statusText = "Expired Consent";
                      statusColor = "text-destructive bg-destructive/10";
                    } else {
                      statusText = "Consented";
                      statusColor = "text-warning bg-warning/10";
                    }
                  }

                  return (
                    <tr
                      key={file.id}
                      className="border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {file.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {file.original_filename?.split(".").pop()?.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(file.created_at || file.issued_date).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewerFile(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                          title="View report"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {userFiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      No reports found for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ReportViewerModal
        isOpen={!!viewerFile}
        file={viewerFile}
        onClose={() => setViewerFile(null)}
      />
    </AppLayout>
  );
};

export default UserDetailPage;
