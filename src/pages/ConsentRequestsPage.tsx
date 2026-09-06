import { useState, useEffect } from "react";
import { Search, Filter, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ListPagination from "@/components/ListPagination";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getPaginationMeta } from "@/lib/pagination";

const PER_PAGE = 10;

const ConsentRequestsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["consents", statusFilter, debouncedSearch, page],
    queryFn: () => api.getConsents(statusFilter, debouncedSearch, page, PER_PAGE),
    placeholderData: (previous) => previous,
  });

  const consentsList = data?.results || [];
  const pagination = getPaginationMeta(data, page, consentsList.length, PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success/10 text-success border-success/20";
      case "OTP_VERIFIED":
        return "bg-primary/10 text-primary border-primary/20";
      case "PENDING":
        return "bg-warning/10 text-warning border-warning/20";
      case "EXPIRED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "CANCELLED":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Dashboard › Consent Requests
            </p>
            <h1 className="text-2xl font-bold text-foreground">Consent Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage all consent requests sent to patients.
            </p>
          </div>
          <button
            onClick={() => navigate("/create-request")}
            className="self-start text-sm text-primary hover:underline"
          >
            + New Request
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, UID, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="OTP_VERIFIED">OTP Verified</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : consentsList.length > 0 ? (
            <>
              <div className={`overflow-x-auto ${isFetching ? "opacity-60" : ""}`}>
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-3 px-5">Patient</th>
                      <th className="text-left py-3 px-5">Purpose</th>
                      <th className="text-center py-3 px-5">Files</th>
                      <th className="text-left py-3 px-5">Status</th>
                      <th className="text-left py-3 px-5">Expires At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consentsList.map((consent: {
                      id: string;
                      user_name?: string;
                      user_uid?: string;
                      description?: string;
                      file_count?: number;
                      status: string;
                      consent_expires_at?: string;
                    }) => (
                      <tr
                        key={consent.id}
                        className="border-b border-border last:border-b-0 hover:bg-accent/40 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {consent.user_name || "Unknown Patient"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                UID: {consent.user_uid || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-sm text-foreground line-clamp-2 max-w-md">
                            {consent.description}
                          </p>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs font-medium text-foreground">
                            <FileText className="w-3.5 h-3.5" />
                            {consent.file_count || 0}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(consent.status)}`}
                          >
                            {consent.status}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {consent.consent_expires_at ? (
                            <div className="flex flex-col text-sm text-foreground">
                              <span>
                                {new Date(consent.consent_expires_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(consent.consent_expires_at).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border">
                <ListPagination
                  meta={pagination}
                  onPageChange={setPage}
                  itemLabel="requests"
                />
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <Filter className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <p className="text-base font-medium text-foreground">No requests found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter settings.
              </p>
              <button
                onClick={() => navigate("/create-request")}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Create a new consent request
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ConsentRequestsPage;
