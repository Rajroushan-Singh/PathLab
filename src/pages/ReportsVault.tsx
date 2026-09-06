import { useState, useEffect } from "react";
import { Search, Grid3X3, List, Filter, SlidersHorizontal, Plus, ArrowUpDown } from "lucide-react";
import ListPagination from "@/components/ListPagination";
import { getPaginationMeta } from "@/lib/pagination";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { FileCardGrid, FileRowList, APIReport } from "@/components/FileItem";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ReportViewerModal } from "@/components/ReportViewerModal";

type ViewMode = "grid" | "list";
type CategoryFilter = "all" | "own" | "consented" | "expired_consent";

const ReportsVault = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [selectedFile, setSelectedFile] = useState<APIReport | null>(null);
  const [viewerFile, setViewerFile] = useState<APIReport | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["reports", categoryFilter, debouncedSearch, page, ordering],
    queryFn: () => api.getReports(categoryFilter, debouncedSearch, page, ordering, PER_PAGE),
    placeholderData: (previous) => previous,
  });

  const filtered: APIReport[] = data?.results || [];
  const pagination = getPaginationMeta(data, page, filtered.length, PER_PAGE);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Dashboard › Reports Vault</p>
            <h1 className="text-2xl font-bold text-foreground">Reports Vault</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all internal clinical reports and external shared health records.</p>
          </div>
          <div className="flex gap-2 self-start">
            <button onClick={() => navigate("/consent-requests")} className="inline-flex items-center gap-2 bg-secondary text-foreground border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-opacity">
              <SlidersHorizontal className="w-4 h-4" />
              Request Access
            </button>
            <button onClick={() => navigate("/send-reports")} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Upload Report
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by file name or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort filter */}
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={ordering}
                onChange={(e) => {
                  setOrdering(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 appearance-none"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-file_size_mb">Size (Largest)</option>
                <option value="file_size_mb">Size (Smallest)</option>
                <option value="-issued_date">Issued Date (Latest)</option>
                <option value="issued_date">Issued Date (Oldest)</option>
              </select>
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as CategoryFilter);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Reports</option>
              <option value="own">Own Uploaded</option>
              <option value="consented">Active Consented</option>
              <option value="expired_consent">Expired Consents</option>
            </select>

            {/* View toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* File display */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filtered.map((file) => (
                  <FileCardGrid
                    key={file.id}
                    file={file}
                    onClick={() => setSelectedFile(file)}
                    onView={() => setViewerFile(file)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-xl overflow-x-auto"
              >
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Patient</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Report Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((file) => (
                      <FileRowList
                        key={file.id}
                        file={file}
                        onClick={() => setSelectedFile(file)}
                        onView={() => setViewerFile(file)}
                      />
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No files match your filters.</p>
          </div>
        )}

        {!isLoading && (
          <div className={isFetching ? "opacity-60" : ""}>
            <ListPagination meta={pagination} onPageChange={setPage} itemLabel="reports" />
          </div>
        )}

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedFile(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">{selectedFile.original_filename}</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">ID:</span> <span className="text-foreground">{selectedFile.report_uid}</span></p>
                <p><span className="text-muted-foreground">Description:</span> <span className="text-foreground">{selectedFile.description || "N/A"}</span></p>
                <p><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{selectedFile.file_size_mb} MB</span></p>
                <p><span className="text-muted-foreground">Patient:</span> <span className="text-foreground">{selectedFile.user_name} ({selectedFile.user_phone})</span></p>
                <p><span className="text-muted-foreground">Issued:</span> <span className="text-foreground">{selectedFile.issued_date || "N/A"}</span></p>
                <p><span className="text-muted-foreground">Uploaded:</span> <span className="text-foreground">{new Date(selectedFile.created_at).toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></p>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setSelectedFile(null)} 
                  className="flex-1 bg-secondary text-foreground py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setViewerFile(selectedFile);
                    setSelectedFile(null);
                  }} 
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  View Report
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <ReportViewerModal
          isOpen={!!viewerFile}
          file={viewerFile}
          onClose={() => setViewerFile(null)}
        />
      </div>
    </AppLayout>
  );
};

export default ReportsVault;