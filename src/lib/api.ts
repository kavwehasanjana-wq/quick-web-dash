const BASE_URL = "https://lmsapi.suraksha.lk";

export const getAuthToken = () => localStorage.getItem("access_token");

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Include server error message when available
    let details = "";
    try {
      const text = await response.text();
      details = text;
      try {
        const parsed = JSON.parse(text);
        const msg = parsed?.message || parsed?.details?.message || parsed?.error;
        if (typeof msg === "string" && msg.trim()) {
          throw new Error(msg);
        }
      } catch {
        // not JSON
      }
    } catch {
      // ignore
    }

    throw new Error(
      details?.trim()
        ? `API Error: ${response.status} - ${details}`
        : `API Error: ${response.status}`
    );
  }

  // Some endpoints may return 204
  if (response.status === 204) return null;

  return response.json();
};

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest("/v2/auth/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }),

  // Users
  getUsers: (page = 1, limit = 10, isActive = true) =>
    apiRequest(`/users?page=${page}&limit=${limit}&isActive=${isActive}`),

  // Institutes
  getInstitutes: (page = 1, limit = 10, isActive = true) =>
    apiRequest(`/institutes?page=${page}&limit=${limit}&search=&instituteType=&isActive=${isActive}`),

  createInstitute: (data: any) =>
    apiRequest("/institutes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Subjects
  getSubjects: (page = 1, limit = 10) =>
    apiRequest(`/subjects/all?page=${page}&limit=${limit}`),

  createSubject: (data: any) =>
    apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // System Payments
  getPayments: (page = 1, limit = 10) =>
    apiRequest(`/payment?page=${page}&limit=${limit}`),

  verifyPayment: (paymentId: string, data: {
    status: string;
    subscriptionPlan: string;
    paymentValidityDays: number;
    notes: string;
  }) =>
    apiRequest(`/payment/${paymentId}/verify`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // SMS Payments
  getSMSPayments: (page = 1, limit = 10) =>
    apiRequest(`/sms/admin/verifications/pending?page=${page}&limit=${limit}`),

  verifySMSPayment: (submissionId: string, data: {
    action: string;
    creditsToGrant: number;
    adminNotes: string;
  }) =>
    apiRequest(`/sms/admin/verifications/${submissionId}/verify`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // SMS Approvals
  getSMSApprovals: (page = 1, limit = 10) =>
    apiRequest(`/sms/admin/pending-approvals?page=${page}&limit=${limit}`),

  approveSMSCampaign: (messageId: string, data: { adminNotes: string }) =>
    apiRequest(`/sms/admin/campaigns/${messageId}/approve`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  rejectSMSCampaign: (messageId: string, data: { rejectionReason: string; adminNotes: string }) =>
    apiRequest(`/sms/admin/campaigns/${messageId}/reject`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // File Upload
  generateSignedUrl: (folder: string, fileName: string, contentType: string, fileSize: number) =>
    apiRequest("/upload/generate-signed-url", {
      method: "POST",
      body: JSON.stringify({
        folder,
        fileName,
        contentType,
        fileSize,
        expiresIn: 600,
      }),
    }),

  // Institute Users
  assignUserToInstitute: (instituteId: string, data: {
    userId: string;
    instituteUserType: string;
    userIdByInstitute: string;
    instituteCardId?: string;
    instituteImage?: string;
  }) =>
    apiRequest(`/institute-users/institute/${instituteId}/assign-user-by-id`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // User RFID
  registerRfid: (userId: string, userRfid: string) =>
    apiRequest("/users/register-rfid", {
      method: "POST",
      body: JSON.stringify({ userId, userRfid }),
    }),

  // User Activate/Deactivate
  deactivateUser: (userId: string) =>
    apiRequest(`/users/${userId}/deactivate`, {
      method: "PATCH",
    }),

  activateUser: (userId: string) =>
    apiRequest(`/users/${userId}/activate`, {
      method: "PATCH",
    }),

  // SMS Sender Masks
  createSenderMask: (data: {
    instituteId: string;
    maskId: string;
    displayName: string;
    phoneNumber: string;
    isActive: boolean;
  }) =>
    apiRequest("/sms/sender-masks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSenderMasks: (instituteId: string) =>
    apiRequest(`/sms/sender-masks?instituteId=${instituteId}`),

  // Advertisements
  getAdvertisements: (page = 1, limit = 10) =>
    apiRequest(`/api/advertisements?page=${page}&limit=${limit}`),

  createAdvertisement: (data: any) =>
    apiRequest("/api/advertisements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
