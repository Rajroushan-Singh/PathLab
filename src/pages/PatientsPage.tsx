import { useState, useEffect } from "react";
import { Search, Phone, HeartPulse, Activity, ArrowUpDown } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import UserAvatar from "@/components/UserAvatar";
import ListPagination from "@/components/ListPagination";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { patientDetailPath } from "@/lib/patientRef";
import { getPaginationMeta } from "@/lib/pagination";

const PatientsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", debouncedSearch, page, ordering],
    queryFn: () => api.getUsers(debouncedSearch, page, ordering, PER_PAGE),
    placeholderData: (previous) => previous,
  });

  const users = data?.results || [];
  const pagination = getPaginationMeta(data, page, users.length, PER_PAGE);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Dashboard › Patients</p>
          <h1 className="text-2xl font-bold text-foreground">Patient Database</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all registered patients.</p>
        </div>

        {/* Search Section */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1 max-w-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, phone or UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Sort By</p>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={ordering}
                  onChange={(e) => {
                    setOrdering(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 appearance-none"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          {!isLoading && searchQuery && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              Found {pagination.count} patient{pagination.count !== 1 ? "s" : ""} matching your criteria
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Patients Table */}
        {!isLoading && (
          <div className={`bg-card border border-border rounded-xl overflow-x-auto ${isFetching ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Patient</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">UID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Blood Group</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Gender</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(patientDetailPath(user.user_uid))}
                      className="cursor-pointer hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={{
                            id: user.user_uid,
                            name: user.name,
                            phone: user.phone,
                          }} onNavigate={() => navigate(patientDetailPath(user.user_uid))} />
                          <span className="text-sm font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.user_uid}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <HeartPulse className="w-4 h-4 text-destructive" />
                          {user.blood_group}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {user.gender === "M" ? "Male" : user.gender === "F" ? "Female" : "Other"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Activity className={`w-4 h-4 ${user.is_active ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${user.is_active ? "text-success" : "text-muted-foreground"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <ListPagination meta={pagination} onPageChange={setPage} itemLabel="patients" />
        )}
      </div>
    </AppLayout>
  );
};

export default PatientsPage;
