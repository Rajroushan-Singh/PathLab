import { useState, useRef } from "react";
import { Send, Upload, CheckCircle2, FileText, Phone, X, AlertCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const reportCategories = [
  { label: "Lab Report", value: "lab" },
  { label: "Imaging / Scans", value: "imaging" },
  { label: "Prescription", value: "prescription" },
  { label: "Discharge Summary", value: "discharge" },
  { label: "Others", value: "others" },
];

const SendReportsPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reportType, setReportType] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleAddFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
    }
    // Reset input so the same file can be selected again
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      let finalCategory = reportType === "others" ? otherCategory : reportCategories.find(c => c.value === reportType)?.label || reportType;
      let finalDescription = `Type: ${finalCategory}`;
      if (notes) finalDescription += ` | Notes: ${notes}`;

      const fullPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;

      const uploadPromises = files.map(file => 
        api.uploadReport(file, fullPhone, finalDescription, issuedDate || undefined)
      );

      return await Promise.all(uploadPromises);
    },
    onSuccess: () => {
      setSent(true);
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setTimeout(() => {
        setSent(false);
        setPhoneNumber("");
        setReportType("");
        setOtherCategory("");
        setIssuedDate("");
        setNotes("");
        setFiles([]);
      }, 3000);
    },
    onError: (error: any) => {
      setIsUploading(false);
      setFormError(error.message || "Failed to upload files. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!phoneNumber.trim()) {
      setFormError("Phone number is required");
      return;
    }

    if (!reportType) {
      setFormError("Please select a report category");
      return;
    }

    if (reportType === "others" && !otherCategory.trim()) {
      setFormError("Please specify the report category");
      return;
    }

    if (files.length === 0) {
      setFormError("Please add at least one file");
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate();
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Dashboard › Upload Reports</p>
          <h1 className="text-2xl font-bold text-foreground">Upload Patient Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload clinical reports securely to the patient's record.</p>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-xl p-8 w-full max-w-2xl space-y-6"
            >
              {/* Form Header */}
              <div className="border-b border-border pb-6">
                <h2 className="text-lg font-semibold text-foreground">Report Upload Form</h2>
                <p className="text-xs text-muted-foreground mt-1">All fields marked with * are required</p>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              )}

              {/* Patient Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Patient Information</h3>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Patient Phone Number *</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-border pr-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="8087209688"
                      className="w-full pl-20 pr-4 py-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      required
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </div>

              {/* Report Details Section */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground">Report Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Report Category *</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                      required
                      disabled={isUploading}
                    >
                      <option value="">Select category</option>
                      {reportCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Issued Date (Optional)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={issuedDate}
                        onChange={(e) => setIssuedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Other Category Input */}
                {reportType === "others" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      type="text"
                      value={otherCategory}
                      onChange={(e) => setOtherCategory(e.target.value)}
                      placeholder="Specify the report category"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Please describe the type of report</p>
                  </motion.div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Attached Files * (Max 50MB per file)</label>
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{f.name}</span>
                          <span className="text-xs text-muted-foreground">({(f.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <button type="button" onClick={() => !isUploading && handleRemoveFile(i)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50" disabled={isUploading}>
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.dicom"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={handleAddFile}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:bg-secondary hover:border-primary/50 hover:text-foreground transition-all w-full justify-center disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" /> Browse & Add Files
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Additional Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions or description..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Information Box */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Secure Upload:</strong> All reports will be encrypted and securely added to the patient's record.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || phoneNumber.length < 10}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Upload Report
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-12 w-full max-w-2xl text-center"
            >
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">Report Uploaded Successfully</h3>
              <p className="text-sm text-muted-foreground mt-2">The report has been securely added to the patient's records.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default SendReportsPage;
