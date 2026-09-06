import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import loginSuccessAnim from "@/assets/login-success.json";
import { Microscope, KeyRound, ArrowRight, Phone, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

type Step = "login" | "success";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError("Please enter your phone number and password");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const fullPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const data = await api.login(fullPhone, password);
      localStorage.setItem("lab_token", data.access);
      setStep("success");
      setTimeout(() => navigate("/overview"), 2000);
    } catch (err: any) {
      let errorMsg = "Login failed. Please try again.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.detail) errorMsg = parsed.detail;
      } catch {
        errorMsg = err.message || errorMsg;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(207_90%_64%/0.4),transparent_60%)]" />
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto">
            <Microscope className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground">PathLab Hub</h1>
          <p className="text-primary-foreground/80 text-lg max-w-sm mx-auto">
            Secure Dashboard for managing patient reports, consents, and clinical data.
          </p>
          <div className="flex items-center gap-3 justify-center text-primary-foreground/60 text-sm">
            <span>🔒 End-to-end Encrypted</span>
            <span>·</span>
            <span>ABHA Compliant</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Microscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">PathLab Hub</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-1">PathLab Sign In</h2>
                <p className="text-sm text-muted-foreground mb-8">Enter your registered phone and password</p>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-border pr-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="8087209688"
                        className="w-full pl-20 pr-4 py-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 10 || !password}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-xs text-muted-foreground mt-6 text-center">
                  Only registered pathlabs can access this portal.
                </p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Lottie animationData={loginSuccessAnim} loop={false} style={{ width: 120, height: 120, margin: "0 auto" }} />
                <h2 className="text-xl font-bold text-foreground mt-4">Login Successful</h2>
                <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
