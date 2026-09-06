import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Users, FileText, HardDrive, Phone, Mail, Building, Activity, Calendar, PieChart, TrendingUp, CheckCircle, Clock, XCircle, File, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";

const getStorageToneClass = (percent: number) => {
  if (percent >= 80) return "text-destructive";
  if (percent <= 30) return "text-success";
  return "text-warning";
};

const getStorageFillClass = (percent: number) => {
  if (percent >= 80) return "bg-destructive";
  if (percent <= 30) return "bg-success";
  return "bg-warning";
};

const Overview = () => {
  // 1. Dashboard API (Storage & Totals)
  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboard,
  });

  // 2. Consent Analysis APIs
  const { data: totalConsents } = useQuery({ queryKey: ["consents", "all"], queryFn: () => api.getConsents() });
  const { data: activeConsents } = useQuery({ queryKey: ["consents", "ACTIVE"], queryFn: () => api.getConsents("ACTIVE") });
  const { data: pendingConsents } = useQuery({ queryKey: ["consents", "PENDING"], queryFn: () => api.getConsents("PENDING") });
  const { data: expiredConsents } = useQuery({ queryKey: ["consents", "EXPIRED"], queryFn: () => api.getConsents("EXPIRED") });

  // 3. Report Analysis APIs
  const { data: recentReports } = useQuery({ queryKey: ["reports", "recent"], queryFn: () => api.getReports("all", "", 1, "-created_at") });
  const { data: ownReports } = useQuery({ queryKey: ["reports", "own"], queryFn: () => api.getReports("own") });
  const { data: consentedReports } = useQuery({ queryKey: ["reports", "consented"], queryFn: () => api.getReports("consented") });

  // 4. User Analysis APIs
  const { data: recentUsers } = useQuery({ queryKey: ["users", "recent"], queryFn: () => api.getUsers("", 1, "-created_at") });

  if (loadingDash) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!dashboard) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 text-destructive">Error loading dashboard data.</div>
      </AppLayout>
    );
  }

  const { name, email, phone, is_active, plan_end, subscription_plan, storage, stats } = dashboard;
  const storageUsedPercent = storage.utilisation_percent;

  // Derived Analytics
  const consentTotalCount = totalConsents?.count || 0;
  const consentActiveCount = activeConsents?.count || 0;
  const consentPendingCount = pendingConsents?.count || 0;
  const consentExpiredCount = expiredConsents?.count || 0;
  
  const successRate = consentTotalCount > 0 ? Math.round((consentActiveCount / consentTotalCount) * 100) : 0;
  
  const ownReportsCount = ownReports?.count || 0;
  const consentedReportsCount = consentedReports?.count || 0;
  const totalReportsCount = stats.total_reports || recentReports?.count || 0;

  // Simple aggregation from recent users (mocking gender/blood group distribution from sample size)
  const usersList = recentUsers?.results || [];
  const maleCount = usersList.filter((u: any) => u.gender === 'M').length;
  const femaleCount = usersList.filter((u: any) => u.gender === 'F').length;

  // Monthly Analytics Calculation (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { name: monthNames[d.getMonth()], year: d.getFullYear(), count: 0 };
  });

  recentReports?.results?.forEach((r: any) => {
    const d = new Date(r.created_at);
    const mName = monthNames[d.getMonth()];
    const mYear = d.getFullYear();
    const targetMonth = last6Months.find(m => m.name === mName && m.year === mYear);
    if (targetMonth) {
      targetMonth.count++;
    }
  });

  const maxMonthCount = Math.max(...last6Months.map(m => m.count), 1); // fallback to 1 to avoid div by 0

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard & Analytics</h1>
          <p className="text-sm text-primary mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building className="w-4 h-4" /> Lab / Hospital Profile
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${is_active ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
              {is_active ? 'Plan Active' : 'Plan Inactive'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-sm">
              <p className="text-muted-foreground text-xs flex items-center gap-1"><Mail className="w-3 h-3"/> Email</p>
              <p className="font-medium mt-1 truncate">{email || "N/A"}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground text-xs flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</p>
              <p className="font-medium mt-1">{phone}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground text-xs flex items-center gap-1"><Activity className="w-3 h-3"/> Plan</p>
              <p className="font-medium mt-1">{subscription_plan || "None"}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground text-xs flex items-center gap-1"><Calendar className="w-3 h-3"/> Valid Till</p>
              <p className="font-medium mt-1">{plan_end ? new Date(plan_end).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10"><Users className="w-16 h-16" /></div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Patients</p>
            <p className="text-3xl font-bold text-foreground">{stats.total_users}</p>
            <div className="mt-4 flex items-center text-xs text-success bg-success/10 w-fit px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" /> Active Database
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10"><FileText className="w-16 h-16" /></div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-foreground">{totalReportsCount}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> {ownReportsCount} Own</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning"></span> {consentedReportsCount} Consented</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden lg:col-span-2">
            <div className="absolute right-0 top-0 p-4 opacity-10"><HardDrive className="w-16 h-16" /></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Storage Analysis</p>
              <p className={`text-sm font-bold ${getStorageToneClass(storageUsedPercent)}`}>{storageUsedPercent.toFixed(1)}% Used</p>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-3xl font-bold text-foreground">{storage.used_gb.toFixed(4)} <span className="text-sm font-normal text-muted-foreground">GB</span></p>
              <p className="text-sm text-muted-foreground mb-1">/ {storage.limit_gb} GB Total</p>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getStorageFillClass(storageUsedPercent)}`}
                style={{ width: `${Math.max(storageUsedPercent, 1)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Consent Analysis */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-foreground">Consent Performance</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Success rates and request statuses</p>
              </div>
              <PieChart className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full" 
                   style={{ background: `conic-gradient(var(--success) ${successRate}%, var(--secondary) 0)` }}>
                <div className="absolute inset-2 bg-card rounded-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{successRate}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Success</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{consentActiveCount}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{consentPendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{consentExpiredCount}</p>
                    <p className="text-xs text-muted-foreground">Expired/Failed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Request Conversion Funnel</span>
                <span className="font-medium">{consentTotalCount} Total Sent</span>
              </div>
              <div className="h-6 w-full flex rounded-full overflow-hidden">
                <div className="bg-success h-full flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${successRate}%` }}>{successRate > 10 ? 'ACTIVE' : ''}</div>
                <div className="bg-warning h-full flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${consentTotalCount ? (consentPendingCount/consentTotalCount)*100 : 0}%` }}></div>
                <div className="bg-destructive h-full flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${consentTotalCount ? (consentExpiredCount/consentTotalCount)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* User & Report Trends */}
          <div className="space-y-6">
            
            {/* Report Types Distribution */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">Report Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-medium flex items-center gap-1"><File className="w-3 h-3 text-primary"/> Own Uploaded</span>
                    <span className="text-muted-foreground">{ownReportsCount} reports ({totalReportsCount ? Math.round((ownReportsCount/totalReportsCount)*100) : 0}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${totalReportsCount ? (ownReportsCount/totalReportsCount)*100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-medium flex items-center gap-1"><FileText className="w-3 h-3 text-warning"/> External Consented</span>
                    <span className="text-muted-foreground">{consentedReportsCount} reports ({totalReportsCount ? Math.round((consentedReportsCount/totalReportsCount)*100) : 0}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: `${totalReportsCount ? (consentedReportsCount/totalReportsCount)*100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex-1">
              <h3 className="text-base font-bold text-foreground mb-4">Latest Uploads</h3>
              <div className="space-y-3">
                {recentReports?.results?.slice(0, 3).map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0`}>
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]">{report.original_filename}</p>
                        <p className="text-xs text-muted-foreground">{report.user_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{report.file_size_mb} MB</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(report.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
                {(!recentReports?.results || recentReports.results.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-2">No recent reports found.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Month-wise Analytics */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Monthly Upload Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Report volume over the last 6 months</p>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2">
            {last6Months.map((month, idx) => {
              const heightPercent = maxMonthCount > 0 ? (month.count / maxMonthCount) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center w-full group">
                  <div className="w-full flex justify-center h-40 items-end relative">
                    <div 
                      className="w-full max-w-[4rem] bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors relative"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    >
                      {month.count > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {month.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-muted-foreground border-t border-border w-full text-center pt-2">
                    {month.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Overview;
