export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  INSTITUTE_ADMIN = 'INSTITUTE_ADMIN',
  SUPERADMIN = 'SUPER_ADMIN'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING'
}

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  instituteId?: string;
  instituteName?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Institute {
  id: string;
  name: string;
  location: string;
  adminCount: number;
  studentCount: number;
  teacherCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: PaymentStatus;
  subscriptionPlan?: SubscriptionPlan;
  paymentValidityDays?: number;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  usersByType: {
    [key in UserType]: number;
  };
  recentRegistrations: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  userType: UserType;
  instituteId?: string;
  password: string;
}

export interface VerifyPaymentRequest {
  status?: PaymentStatus;
  subscriptionPlan?: SubscriptionPlan;
  paymentValidityDays?: number;
  rejectionReason?: string;
  notes?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  instituteId?: string;
}