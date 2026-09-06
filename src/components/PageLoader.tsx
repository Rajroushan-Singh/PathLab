import Lottie from "lottie-react";
import heartbeatAnim from "@/assets/heartbeat.json";

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <Lottie animationData={heartbeatAnim} loop style={{ width: 80, height: 80 }} />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

export default PageLoader;
