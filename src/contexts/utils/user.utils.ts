import { User, UserRole } from '../types/auth.types';

// Updated user type mapping to handle backend enum - removed Super Admin and System Admin
export const mapUserTypeToRole = (userType: string): UserRole => {
  const typeMapping: Record<string, UserRole> = {
    'STUDENT': 'Student',
    'TEACHER': 'Teacher',
    'INSTITUTE_ADMIN': 'InstituteAdmin',
    'ATTEDANCE_MARKER': 'AttendanceMarker',
    'ATTENDANCE_MARKER': 'AttendanceMarker',
    'PARENT': 'Parent',
    'ORGANIZATIONMANAGER': 'OrganizationManager',
    'ORGANIZATION_MANAGER': 'OrganizationManager'
  };
  return typeMapping[userType.toUpperCase()] || 'Student';
};

export const mapUserData = (apiUser: any, institutes: any[] = []): User => ({
  id: apiUser.id,
  firstName: apiUser.firstName,
  lastName: apiUser.lastName,
  name: `${apiUser.firstName} ${apiUser.lastName}`, // Compute full name
  email: apiUser.email,
  phone: apiUser.phone || '',
  userType: apiUser.userType,
  dateOfBirth: apiUser.dateOfBirth || '',
  gender: apiUser.gender || '',
  nic: apiUser.nic || '',
  birthCertificateNo: apiUser.birthCertificateNo || '',
  addressLine1: apiUser.addressLine1 || '',
  addressLine2: apiUser.addressLine2 || '',
  city: apiUser.city || '',
  district: apiUser.district || '',
  province: apiUser.province || '',
  postalCode: apiUser.postalCode || '',
  country: apiUser.country || '',
  isActive: apiUser.isActive || true,
  createdAt: apiUser.createdAt || '',
  updatedAt: apiUser.updatedAt || '',
  imageUrl: apiUser.imageUrl || '',
  role: mapUserTypeToRole(apiUser.userType),
  institutes: institutes
});
