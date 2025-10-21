import { apiClient, ApiResponse } from './client';
import { getBaseUrl } from '@/contexts/utils/auth.api';
export interface InstitutePayment {
  id: string;
  instituteId: string;
  paymentType: string;
  description: string;
  amount: number;
  dueDate: string;
  targetType: 'PARENTS' | 'STUDENT' | 'BOTH';
  priority: 'MANDATORY' | 'OPTIONAL';
  status: 'ACTIVE' | 'INACTIVE';
  paymentInstructions?: string;
  bankDetails?: {
    bankName: string;
    ifscCode: string;
    accountNumber: string;
    accountHolderName: string;
  };
  lateFeeAmount?: number;
  lateFeeAfterDays?: number;
  reminderDaysBefore?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creatorName: string;
  autoReminderEnabled: boolean;
  notes?: string;
  totalSubmissions: number;
  verifiedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
}

export interface PaymentSubmission {
  id: string;
  paymentId: string;
  userId: string;
  userType: string;
  username: string;
  paymentDate: string;
  receiptUrl: string;
  receiptFilename: string;
  transactionId: string;
  submittedAmount: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface MyPaymentSubmission {
  id: string;
  paymentId: string;
  paymentType: string;
  description: string;
  dueDate: string;
  priority: string;
  paymentAmount: number;
  paymentMethod: string;
  transactionReference: string;
  paymentDate: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
  lateFeeApplied: number;
  totalAmountPaid: number;
  receiptFileName: string;
  receiptFileUrl: string;
  receiptFileSize: number;
  receiptFileType: string;
  paymentRemarks: string;
  createdAt: string;
  canResubmit: boolean;
  canDelete: boolean;
  daysSinceSubmission: number;
}

export interface InstitutePaymentsResponse {
  success: boolean;
  message: string;
  data: {
    payments: InstitutePayment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface StudentPaymentsResponse {
  success: boolean;
  message: string;
  data: {
    payments: InstitutePayment[];
    userRole: string;
    instituteId: string;
    totalApplicable: number;
    pendingPayments: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface PaymentSubmissionsResponse {
  success: boolean;
  message: string;
  data: {
    submissions: PaymentSubmission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface MySubmissionsResponse {
  success: boolean;
  message: string;
  data: {
    submissions: MyPaymentSubmission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary: {
      totalSubmissions: number;
      byStatus: {
        pending: number;
        verified: number;
        rejected: number;
      };
      totalAmountSubmitted: number;
      totalAmountVerified: number;
      totalLateFees: number;
    };
  };
}

export interface CreatePaymentRequest {
  paymentType: string;
  description: string;
  amount: number;
  dueDate: string;
  targetType: 'PARENTS' | 'STUDENTS' | 'BOTH';
  priority: 'MANDATORY' | 'OPTIONAL';
  paymentInstructions?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
  };
  lateFeeAmount?: number;
  lateFeeAfterDays?: number;
  reminderDaysBefore?: number;
}

export interface VerifySubmissionRequest {
  status: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  notes?: string;
}

export interface SubmitPaymentRequest {
  paymentAmount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CHEQUE' | 'DD';
  transactionReference?: string;
  paymentDate: string;
  paymentRemarks?: string;
  lateFeeApplied?: number;
  receipt: File; // Will be sent as `paymentProof` to backend
}

class InstitutePaymentsApi {
  // Get all institute payments (for InstituteAdmin)
  async getInstitutePayments(instituteId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    priority?: 'MANDATORY' | 'OPTIONAL';
    targetType?: 'PARENTS' | 'STUDENT' | 'BOTH';
  }): Promise<InstitutePaymentsResponse> {
    return apiClient.get(`/institute-payments/institute/${instituteId}/payments`, params);
  }

  // Get student's applicable payments (for Student)
  async getStudentPayments(instituteId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    priority?: 'MANDATORY' | 'OPTIONAL';
  }): Promise<StudentPaymentsResponse> {
    return apiClient.get(`/institute-payments/institute/${instituteId}/my-payments`, params);
  }

  // Get payment submissions for a specific payment (for InstituteAdmin)
  async getPaymentSubmissions(
    instituteId: string, 
    paymentId: string, 
    params?: {
      page?: number;
      limit?: number;
      status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
      paymentMethod?: 'BANK_TRANSFER' | 'UPI' | 'ONLINE_PAYMENT' | 'CASH_DEPOSIT' | 'CHEQUE';
      paymentDateFrom?: string;
      paymentDateTo?: string;
      submissionDateFrom?: string;
      submissionDateTo?: string;
      verificationDateFrom?: string;
      verificationDateTo?: string;
      amountFrom?: number;
      amountTo?: number;
      studentId?: string;
      studentName?: string;
      search?: string;
      hasLateFee?: boolean;
      hasAttachment?: boolean;
      sortBy?: 'paymentDate' | 'submissionDate' | 'verificationDate' | 'amount' | 'status' | 'studentName';
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<PaymentSubmissionsResponse> {
    return apiClient.get(`/institute-payment-submissions/institute/${instituteId}/payment/${paymentId}/submissions`, params);
  }

  // Get student's own submissions (for Student)
  async getMySubmissions(instituteId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
    search?: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
  }): Promise<MySubmissionsResponse> {
    return apiClient.get(`/institute-payment-submissions/institute/${instituteId}/my-submissions`, params);
  }

  // Create a new payment (for InstituteAdmin)
  async createPayment(instituteId: string, data: CreatePaymentRequest): Promise<any> {
    return apiClient.post(`/institute-payments/institute/${instituteId}/payments`, data);
  }

  // Verify a payment submission with detailed form (for InstituteAdmin)
  async verifySubmissionDetailed(instituteId: string, submissionId: string, data: VerifySubmissionRequest): Promise<any> {
    return apiClient.patch(`/institute-payment-submissions/institute/${instituteId}/submission/${submissionId}/verify`, data);
  }

  // Submit a payment (for Student)
  async submitPayment(instituteId: string, paymentId: string, data: SubmitPaymentRequest): Promise<any> {
    const formData = new FormData();
    formData.append('paymentAmount', data.paymentAmount.toString());
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('paymentDate', data.paymentDate);
    if (data.transactionReference) formData.append('transactionReference', data.transactionReference);
    if (data.paymentRemarks) formData.append('paymentRemarks', data.paymentRemarks);
    if (typeof data.lateFeeApplied === 'number') formData.append('lateFeeApplied', data.lateFeeApplied.toString());

    // Backend expects file key as `paymentProof` per latest spec
    formData.append('paymentProof', data.receipt);

    // Get auth token
    const authToken = localStorage.getItem('access_token');
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    // Always use configured API base URL (not window origin)
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/institute-payment-submissions/institute/${instituteId}/payment/${paymentId}/submit`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
        // Do NOT set Content-Type for FormData
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          if (errorText && !errorText.includes('<!DOCTYPE html>')) {
            errorMessage = errorText;
          }
        } catch {}
      }
      throw new Error(errorMessage);
    }

    // Ensure JSON response
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Unexpected non-JSON response from server.');
    }

    return response.json();
  }

  // Legacy verify method (kept for backward compatibility)
  async verifySubmission(submissionId: string): Promise<any> {
    return apiClient.patch(`/institute-payment-submissions/${submissionId}/verify`);
  }
}

export const institutePaymentsApi = new InstitutePaymentsApi();