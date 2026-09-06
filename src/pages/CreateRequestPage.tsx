import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Phone, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CONSENT_STEPS = [
  {
    title: "Path lab requests the patient",
    description:
      "Enter the patient's phone number and describe why you need access. An OTP is sent to the patient's WhatsApp automatically.",
  },
  {
    title: "Patient verifies identity via OTP",
    description:
      "The patient receives the OTP on WhatsApp and confirms the request in their portal. This step expires in 5 minutes.",
  },
  {
    title: "Patient selects reports to share",
    description:
      "After OTP verification, the patient chooses which report files to share and sets an expiry date for your lab's access.",
  },
] as const;

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const requestMutation = useMutation({
    mutationFn: (data: { user_phone: string; description: string }) =>
      api.requestConsent(data.user_phone, data.description),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      setTimeout(() => {
        setSubmitted(false);
        setPhoneNumber("");
        setPurpose("");
      }, 3000);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to send request. Please check the phone number and try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!phoneNumber.trim()) {
      setFormError("Phone number is required");
      return;
    }

    if (!purpose.trim()) {
      setFormError("Purpose of request is required");
      return;
    }

    const fullPhone = phoneNumber.startsWith("+91")
      ? phoneNumber
      : `+91${phoneNumber.replace(/\D/g, "")}`;

    requestMutation.mutate({
      user_phone: fullPhone,
      description: purpose,
    });
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Dashboard › Create Request
          </p>
          <h1 className="text-2xl font-bold text-foreground">Create Consent Request</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request secure, time-limited access to a patient's health records.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 max-w-3xl">
          <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How consent requests work
            </h3>
            <ol className="space-y-4">
              {CONSENT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Initiate New Request</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Send an OTP to request patient file access
              </p>
            </div>

            {formError && (
              <div className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Patient Phone Number *
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-border pr-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="8087209688"
                    className="w-full pl-20 pr-4 py-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    required
                    disabled={requestMutation.isPending}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">OTP will be sent to this number</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Purpose of Request *
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="E.g., Required for consultation, follow-up diagnosis, etc."
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                  required
                  disabled={requestMutation.isPending}
                />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground max-w-lg">
                <strong>Note:</strong> An OTP will be sent to the patient's WhatsApp. Once verified,
                the patient selects which reports to share and sets an expiry date.
              </p>
              <button
                type="submit"
                disabled={requestMutation.isPending || phoneNumber.length < 10 || !purpose}
                className="shrink-0 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {requestMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Request
                  </>
                )}
              </button>
            </div>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-success/10 border border-success/30"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <p className="text-sm text-success">
                    Request sent successfully! Patient will receive an OTP on WhatsApp.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/consent-requests")}
                      className="underline font-medium"
                    >
                      View all requests
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateRequestPage;
