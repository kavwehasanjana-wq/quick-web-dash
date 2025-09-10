
import { apiClient } from './client';

export interface UserCreateData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userType: string;
  nic?: string;
  birthCertificateNo?: string;
  dateOfBirth: string;
  gender: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  imageUrl?: string;
  idUrl?: string;
  isActive?: boolean;
  subscriptionPlan?: string;
  paymentExpiresAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  dateOfBirth: string;
  gender: string;
  imageUrl?: string;
  isActive: boolean;
  subscriptionPlan: string;
  paymentExpiresAt?: string;
  createdAt: string;
}

export const usersApi = {
  create: async (data: UserCreateData): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  }
};
