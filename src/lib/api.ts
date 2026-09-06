export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://a18f-116-74-158-243.ngrok-free.app/api/v1";
  // https://a18f-116-74-158-243.ngrok-free.app
const getHeaders = () => {
  const token = localStorage.getItem("lab_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.detail || errorText);
    } catch {
      throw new Error(errorText);
    }
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (phone: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/lab/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    return handleResponse(res);
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/lab/dashboard/`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Reports
  getReports: async (type: string = "all", search: string = "", page: number = 1, ordering: string = "", pageSize: number = 10) => {
    const url = new URL(`${API_BASE_URL}/lab/reports/`);
    if (type) url.searchParams.append("type", type);
    if (search) url.searchParams.append("search", search);
    if (ordering) url.searchParams.append("ordering", ordering);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("page_size", pageSize.toString());

    const res = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  uploadReport: async (file: File, user_phone: string, description?: string, issued_date?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_phone", user_phone);
    formData.append("description", description || "");
    formData.append("issued_date", issued_date || new Date().toISOString().split('T')[0]);

    const token = localStorage.getItem("lab_token");
    const res = await fetch(`${API_BASE_URL}/lab/reports/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420",
      },
      body: formData,
    });
    return handleResponse(res);
  },

  getReportStreamUrl: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/lab/reports/${id}/stream/`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Patients/Users
  getUsers: async (search: string = "", page: number = 1, ordering: string = "", pageSize: number = 10) => {
    const url = new URL(`${API_BASE_URL}/lab/users/`);
    if (search) url.searchParams.append("search", search);
    if (ordering) url.searchParams.append("ordering", ordering);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("page_size", pageSize.toString());

    const res = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUserReports: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/lab/users/${userId}/reports/`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUserByUid: async (userUid: string) => {
    const data = await api.getUsers(userUid, 1);
    const results = data?.results || [];
    return results.find((u: { user_uid: string }) => u.user_uid === userUid) ?? null;
  },

  getUserReportsByUid: async (userUid: string) => {
    const user = await api.getUserByUid(userUid);
    if (!user) {
      throw new Error("Patient not found.");
    }
    return api.getUserReports(user.id);
  },

  // Consent
  requestConsent: async (user_phone: string, description: string) => {
    const res = await fetch(`${API_BASE_URL}/lab/consent/request/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ user_phone, description }),
    });
    return handleResponse(res);
  },

  getConsents: async (status?: string, search?: string, page: number = 1, pageSize: number = 10) => {
    const url = new URL(`${API_BASE_URL}/lab/consent/`);
    if (status) url.searchParams.append("status", status);
    if (search) url.searchParams.append("search", search);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("page_size", pageSize.toString());

    const res = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getConsentDetail: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/lab/consent/${id}/`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/lab/notifications/`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
