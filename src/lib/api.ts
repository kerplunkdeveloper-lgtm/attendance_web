import axios from "axios";

function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!url) {
    return "https://backendapiattendance-production.up.railway.app/api";
  }
  // If protocol is missing, prepend https:// so the browser does not treat it as a relative path
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Needed for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("workpulse_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh-token")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken || res.data?.data?.token;
        if (newToken) {
          localStorage.setItem("workpulse_access_token", newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("workpulse_access_token");
          localStorage.removeItem("workpulse_user");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ==========================================
 * Domain API Services
 * ========================================== */

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
  register: async (payload: any) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },
  getPlans: async () => {
    const res = await api.get("/auth/plans");
    return res.data;
  },
  activatePlan: async (unlockCode: string) => {
    const res = await api.post("/auth/activate-plan", { unlockCode });
    return res.data;
  },
  changePassword: async (payload: { currentPassword?: string; newPassword: string }) => {
    const res = await api.post("/auth/change-password", payload);
    return res.data;
  },
};

export const attendanceApi = {
  checkIn: async (data: { latitude: number; longitude: number; accuracy?: number }) => {
    const res = await api.post("/attendance/check-in", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  },
  checkOut: async (data: { latitude: number; longitude: number; accuracy?: number }) => {
    const res = await api.post("/attendance/check-out", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  },
  wfhCheckIn: async (wfhNote?: string) => {
    const res = await api.post("/attendance/wfh-check-in", {
      timestamp: new Date().toISOString(),
      wfhNote: wfhNote || "Remote work from home",
    });
    return res.data;
  },
  startBreak: async (coords?: { latitude: number; longitude: number }) => {
    const res = await api.post("/attendance/break-start", coords || {});
    return res.data;
  },
  endBreak: async (coords?: { latitude: number; longitude: number }) => {
    const res = await api.post("/attendance/break-end", coords || {});
    return res.data;
  },
  getTodayStatus: async () => {
    const res = await api.get("/attendance/today");
    return res.data;
  },
  getMyAttendance: async (params?: any) => {
    const res = await api.get("/attendance/history", { params });
    return res.data;
  },
  getAllAttendance: async (params?: any) => {
    const res = await api.get("/attendance/all", { params });
    return res.data;
  },
  getSummary: async (date?: string, branchId?: string) => {
    const res = await api.get("/attendance/summary", { params: { date, branchId } });
    return res.data;
  },
  adminMarkAttendance: async (payload: {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    reason?: string;
  }) => {
    const res = await api.post("/attendance/admin-mark", payload);
    return res.data;
  },
  // Batch sync offline punches after connectivity is restored
  syncOffline: async (punches: Array<{
    id: string;
    type: string;
    timestamp: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    wfhNote?: string;
  }>) => {
    const res = await api.post("/attendance/sync-offline", { punches });
    return res.data;
  },
};

export const correctionsApi = {
  request: async (payload: { attendanceId: string; requestedCheckIn?: string; requestedCheckOut?: string; reason: string }) => {
    const res = await api.post("/attendance/corrections/request", payload);
    return res.data;
  },
  getMyCorrections: async () => {
    const res = await api.get("/attendance/corrections/my");
    return res.data;
  },
  getPendingCorrections: async () => {
    const res = await api.get("/attendance/corrections/pending");
    return res.data;
  },
  review: async (id: string, payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }) => {
    const res = await api.post(`/attendance/corrections/${id}/review`, payload);
    return res.data;
  },
};

export const leavesApi = {
  getTypes: async () => {
    const res = await api.get("/leaves/types");
    return res.data;
  },
  getBalances: async () => {
    const res = await api.get("/leaves/balances");
    return res.data;
  },
  apply: async (payload: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
  }) => {
    const res = await api.post("/leaves/apply", payload);
    return res.data;
  },
  getMyLeaves: async () => {
    const res = await api.get("/leaves/my");
    return res.data;
  },
  getAllLeaves: async (params?: any) => {
    const res = await api.get("/leaves", { params });
    return res.data;
  },
  review: async (id: string, payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }) => {
    const res = await api.put(`/leaves/${id}/review`, payload);
    return res.data;
  },
};

export const payrollApi = {
  getMyPayslips: async () => {
    const res = await api.get("/payroll/my-payslips");
    return res.data;
  },
  getPayslips: async (params?: any) => {
    const res = await api.get("/payroll/payslips", { params });
    return res.data;
  },
  getPayslipDetails: async (id: string) => {
    const res = await api.get(`/payroll/payslips/${id}/details`);
    return res.data;
  },
  getSalaryStructure: async (employeeId: string) => {
    const res = await api.get(`/payroll/salary-structure/${employeeId}`);
    return res.data;
  },
  upsertSalaryStructure: async (payload: any) => {
    const res = await api.post("/payroll/salary-structure", payload);
    return res.data;
  },
  calculatePreview: async (params: { month: number; year: number; employeeId?: string }) => {
    const res = await api.get("/payroll/calculate", { params });
    return res.data;
  },
  generateBatch: async (payload: { month: number; year: number }) => {
    const res = await api.post("/payroll/generate", payload);
    return res.data;
  },
  approveBatch: async (payload: { batchId?: string; month?: number; year?: number }) => {
    const res = await api.post("/payroll/approve-batch", payload);
    return res.data;
  },
  disburseBatch: async (payload: { batchId?: string; month?: number; year?: number }) => {
    const res = await api.post("/payroll/disburse-batch", payload);
    return res.data;
  },
  getReports: async (params?: any) => {
    const res = await api.get("/payroll/reports", { params });
    return res.data;
  },
};

export const onboardingApi = {
  listCandidates: async () => {
    const res = await api.get("/onboarding");
    return res.data;
  },
  createJoiner: async (payload: any) => {
    const res = await api.post("/onboarding", payload);
    return res.data;
  },
  getCandidateDetails: async (id: string) => {
    const res = await api.get(`/onboarding/${id}`);
    return res.data;
  },
  hrVerify: async (id: string, payload: any) => {
    const res = await api.put(`/onboarding/${id}/hr-verify`, payload);
    return res.data;
  },
  adminApproveOffer: async (id: string, payload?: any) => {
    const res = await api.post(`/onboarding/${id}/admin-approve-offer`, payload || {});
    return res.data;
  },
  hrSendOffer: async (id: string, payload?: any) => {
    const res = await api.post(`/onboarding/${id}/hr-send-offer`, payload || {});
    return res.data;
  },
  adminActivate: async (id: string, payload?: any) => {
    const res = await api.post(`/onboarding/${id}/admin-approve`, payload || {});
    return res.data;
  },
  getPortalCandidate: async (token: string) => {
    const res = await api.get(`/onboarding/portal/${token}`);
    return res.data;
  },
  updatePortalProfile: async (token: string, payload: any) => {
    const res = await api.put(`/onboarding/portal/${token}/profile`, payload);
    return res.data;
  },
  uploadPortalDocument: async (token: string, formData: FormData) => {
    const res = await api.post(`/onboarding/portal/${token}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  respondOffer: async (token: string, response: "ACCEPTED" | "REJECTED", note?: string) => {
    const res = await api.post(`/onboarding/portal/${token}/respond-offer`, {
      response,
      note,
    });
    return res.data;
  },
};

export const employeesApi = {
  list: async (params?: any) => {
    const res = await api.get("/employees", { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },
  create: async (payload: any) => {
    const res = await api.post("/employees", payload);
    return res.data;
  },
  update: async (id: string, payload: any) => {
    const res = await api.put(`/employees/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },
  invite: async (payload: any) => {
    const res = await api.post("/employees/invite", payload);
    return res.data;
  },
  inviteEmployee: async (payload: any) => {
    const res = await api.post("/employees/invite", payload);
    return res.data;
  },
};


export const branchesApi = {
  list: async () => {
    const res = await api.get("/branches");
    return res.data;
  },
  create: async (payload: any) => {
    const res = await api.post("/branches", payload);
    return res.data;
  },
  update: async (id: string, payload: any) => {
    const res = await api.put(`/branches/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/branches/${id}`);
    return res.data;
  },
};

export const departmentsApi = {
  list: async () => {
    const res = await api.get("/departments");
    return res.data;
  },
  create: async (payload: any) => {
    const res = await api.post("/departments", payload);
    return res.data;
  },
  update: async (id: string, payload: any) => {
    const res = await api.put(`/departments/${id}`, payload);
    return res.data;
  },
};

export const shiftsApi = {
  list: async () => {
    const res = await api.get("/shifts");
    return res.data;
  },
  create: async (payload: any) => {
    const res = await api.post("/shifts", payload);
    return res.data;
  },
  update: async (id: string, payload: any) => {
    const res = await api.put(`/shifts/${id}`, payload);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await api.delete(`/shifts/${id}`);
    return res.data;
  },
};

export const expensesApi = {
  create: async (payload: any) => {
    const res = await api.post("/expenses", payload);
    return res.data;
  },
  getMyClaims: async () => {
    const res = await api.get("/expenses/my");
    return res.data;
  },
  getSummary: async () => {
    const res = await api.get("/expenses/summary");
    return res.data;
  },
  getAllClaims: async () => {
    const res = await api.get("/expenses");
    return res.data;
  },
  review: async (id: string, payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }) => {
    const res = await api.patch(`/expenses/${id}/review`, payload);
    return res.data;
  },
  deleteClaim: async (id: string) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
};

export const notificationsApi = {
  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  },
  getCommunicationStatus: async () => {
    const res = await api.get("/notifications/communication-status");
    return res.data;
  },
  testEmail: async (to?: string) => {
    const res = await api.post("/notifications/test-email", { to });
    return res.data;
  },
  testWhatsApp: async (to?: string) => {
    const res = await api.post("/notifications/test-whatsapp", { to });
    return res.data;
  },
  triggerReminders: async (reminderType?: "MORNING" | "EVENING" | "ALL") => {
    const res = await api.post("/notifications/trigger-reminders", { reminderType });
    return res.data;
  },
};

export const reportsApi = {
  getDaily: async (date?: string) => {
    const res = await api.get("/reports/daily", { params: { date } });
    return res.data;
  },
  getMonthly: async (month?: number, year?: number) => {
    const res = await api.get("/reports/monthly", { params: { month, year } });
    return res.data;
  },
};

export const compOffApi = {
  getBalance: async () => {
    const res = await api.get("/compoff/balance");
    return res.data;
  },
  redeem: async (payload: { requestedDate: string; days: number; reason?: string }) => {
    const res = await api.post("/compoff/redeem", payload);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get("/compoff/history");
    return res.data;
  },
  review: async (id: string, payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }) => {
    const res = await api.post(`/compoff/${id}/review`, payload);
    return res.data;
  },
};

export const overtimeApi = {
  getPending: async () => {
    const res = await api.get("/overtime/pending");
    return res.data;
  },
  getMy: async () => {
    const res = await api.get("/overtime/my");
    return res.data;
  },
  review: async (id: string, payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string }) => {
    const res = await api.post(`/overtime/${id}/review`, payload);
    return res.data;
  },
};
