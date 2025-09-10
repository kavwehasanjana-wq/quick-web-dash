import { apiClient } from './client';

export interface SubjectPayment {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  createdBy: string;
  title: string;
  description: string;
  targetType: 'PARENTS' | 'STUDENT';
  priority: 'MANDATORY' | 'OPTIONAL';
  amount: string;
  documentUrl?: string;
  lastDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  submissionsCount: number;
  verifiedSubmissionsCount: number;
  pendingSubmissionsCount: number;
}

export interface SubjectPaymentsResponse {
  data: SubjectPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubjectPaymentSubmission {
  id: string;
  paymentId: string;
  paymentAmount: number;
  paymentMethod: string;
  transactionReference: string;
  paymentDate: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: string;
  rejectionReason?: string;
  lateFeeApplied?: number;
  totalAmountPaid?: number;
  receiptFileName?: string;
  receiptFileUrl?: string;
  receiptFileSize?: number;
  receiptFileType?: string;
  paymentRemarks?: string;
  createdAt: string;
  submittedBy?: string;
  submitterName?: string;
  verifiedBy?: string;
  verifierName?: string;
  notes?: string;
  updatedAt: string;
  canResubmit?: boolean;
  canDelete?: boolean;
  daysSinceSubmission?: number;
  // Subject payment specific fields
  paymentTitle?: string;
  paymentDescription?: string;
  dueDate?: string;
  priority?: string;
}

export interface SubjectSubmissionsResponse {
  data: SubjectPaymentSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: {
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
}

class SubjectPaymentsApi {
  // Get all subject payments for Institute Admin/Teacher
  async getSubjectPayments(
    instituteId: string, 
    classId: string, 
    subjectId: string
  ): Promise<SubjectPaymentsResponse> {
    return apiClient.get(`/institute-class-subject-payments/institute/${instituteId}/class/${classId}/subject/${subjectId}`);
  }

  // Get student's subject payments
  async getMySubjectPayments(
    instituteId: string, 
    classId: string, 
    subjectId: string
  ): Promise<SubjectPaymentsResponse> {
    return apiClient.get(`/institute-class-subject-payments/institute/${instituteId}/class/${classId}/subject/${subjectId}/my-payments`);
  }

  // Get student's subject payment submissions
  async getMySubjectSubmissions(
    instituteId: string, 
    classId: string, 
    subjectId: string
  ): Promise<SubjectSubmissionsResponse> {
    return apiClient.get(`/institute-class-subject-payment-submissions/institute/${instituteId}/class/${classId}/subject/${subjectId}/my-submissions`);
  }

  // Get all submissions for a specific subject payment (for Admin/Teacher)
  async getSubjectPaymentSubmissions(
    instituteId: string, 
    classId: string, 
    subjectId: string,
    paymentId: string
  ): Promise<SubjectSubmissionsResponse> {
    return apiClient.get(`/institute-class-subject-payment-submissions/institute/${instituteId}/class/${classId}/subject/${subjectId}/payment/${paymentId}/submissions`);
  }

  // Get payment submissions by payment ID only (for simplified access)
  async getPaymentSubmissions(paymentId: string): Promise<SubjectSubmissionsResponse> {
    return apiClient.get(`/institute-class-subject-payment-submissions/payment/${paymentId}/submissions`);
  }

  // Verify payment submission
  async verifyPaymentSubmission(submissionId: string, data: {
    status: 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiClient.patch(`/institute-class-subject-payment-submissions/submission/${submissionId}/verify`, data);
  }

  // Submit payment (for students)
  async submitPayment(paymentId: string, formData: FormData): Promise<{
    success: boolean;
    message: string;
    data: {
      submissionId: string;
      status: string;
      receiptFile: string;
    };
  }> {
    return apiClient.post(`/institute-class-subject-payment-submissions/payment/${paymentId}/submit`, formData);
  }
}

export const subjectPaymentsApi = new SubjectPaymentsApi();