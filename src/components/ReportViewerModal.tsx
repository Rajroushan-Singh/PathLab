import React, { useState, useEffect } from "react";
import { X, Eye, Download, ShieldAlert, Lock, Unlock, FileText, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { APIReport } from "@/components/FileItem";
import { toast } from "sonner";

interface ReportViewerModalProps {
  isOpen: boolean;
  file: APIReport | null;
  onClose: () => void;
}

export const ReportViewerModal = ({ isOpen, file, onClose }: ReportViewerModalProps) => {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || !file) {
      setStreamUrl("");
      setError("");
      return;
    }

    const fetchStreamUrl = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.getReportStreamUrl(file.id);
        if (response?.url) {
          setStreamUrl(response.url);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err: any) {
        console.error("Error fetching report stream URL:", err);
        setError(err.message || "Failed to load report view URL");
        toast.error("Failed to retrieve secure view link.");
      } finally {
        setLoading(false);
      }
    };

    fetchStreamUrl();
  }, [isOpen, file]);

  // Block keyboard shortcuts (Save, Print, Copy) for Consented Reports
  useEffect(() => {
    if (!isOpen || !file || !file.is_consent_based) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (
        (isCtrl && e.key.toLowerCase() === "s") ||
        (isCtrl && e.key.toLowerCase() === "p") ||
        (isCtrl && e.key.toLowerCase() === "c") ||
        e.key === "F12" ||
        (isCtrl && e.shiftKey && e.key.toLowerCase() === "i")
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Security Warning: Saving, copying, and printing are disabled for consented external records.");
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isConsent = file.is_consent_based;

  // Handles downloading for Own Reports
  const handleDownload = async () => {
    if (isConsent) return;
    setIsDownloading(true);
    try {
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error("CORS or network error");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started successfully.");
    } catch (err) {
      console.warn("Direct download failed, falling back to S3 redirect:", err);
      // Fallback: Open in new tab which will download / display the S3 URL
      window.open(streamUrl, "_blank");
      toast.success("Opened document download link.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    if (isConsent) return;
    window.open(streamUrl, "_blank");
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isConsent) {
      e.preventDefault();
      toast.warning("Security Warning: Saving and copying options are restricted.");
    }
  };

  // Add toolbar=0 and navpanes=0 to hide download and printing controls from default browser PDF viewer
  const secureSrc = isConsent && streamUrl
    ? `${streamUrl}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0`
    : streamUrl;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
        onClick={onClose}
        onContextMenu={handleContextMenu}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border bg-secondary/20 gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConsent ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                {isConsent ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate max-w-[250px] sm:max-w-[400px]">
                    {file.original_filename}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isConsent 
                      ? 'bg-warning/10 text-warning border border-warning/20' 
                      : 'bg-success/10 text-success border border-success/20'
                  }`}>
                    {isConsent ? 'Consented View' : 'Own Report'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Patient: {file.user_name} · UID: {file.user_uid} · Size: {file.file_size_mb} MB
                </p>
              </div>
            </div>

            {/* Header security info & action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {isConsent ? (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/5 border border-warning/20 text-[11px] text-warning font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  Security Enabled: Saving & printing disabled
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenNewTab}
                    disabled={loading || !!error}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-all text-xs font-semibold disabled:opacity-50"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Tab
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={loading || !!error || isDownloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs font-semibold disabled:opacity-50"
                    title="Download Report File"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Download
                  </button>
                </div>
              )}
              
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-secondary rounded-lg border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all ml-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Secure Banner for Mobile/Small Screens */}
          {isConsent && (
            <div className="flex lg:hidden items-center justify-center gap-1.5 p-2 bg-warning/5 border-b border-warning/10 text-[11px] text-warning font-medium text-center">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Secure View Only · Download/print disabled
            </div>
          )}

          {/* PDF Viewer Body */}
          <div className="flex-1 bg-secondary/10 relative overflow-hidden flex items-center justify-center">
            {loading && (
              <div className="flex flex-col items-center gap-3 text-center p-8 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Opening Clinical Vault...</p>
                  <p className="text-xs text-muted-foreground mt-1">Establishing end-to-end secure stream tunnel</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-3 text-center p-8 max-w-sm">
                <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Secure connection failed</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{error}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all"
                >
                  Go Back
                </button>
              </div>
            )}

            {!loading && !error && streamUrl && (
              <div className="relative w-full h-full">
                <iframe
                  src={secureSrc}
                  className="w-full h-full border-none"
                  title={file.original_filename}
                  onContextMenu={handleContextMenu}
                />
                
                {/* Transparent pointer intercept overlay for consented files */}
                {isConsent && (
                  <div 
                    className="absolute inset-0 bg-transparent pointer-events-none"
                    onContextMenu={handleContextMenu}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
