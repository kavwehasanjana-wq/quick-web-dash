const getBaseUrl = () => localStorage.getItem('api_base_url') || 'http://localhost:3000';
const getSecondBUrl = () => localStorage.getItem('api_second_base_url') || 'http://localhost:3001';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    accessStructure: any;
  };
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userType: string;
  nic?: string;
  birthCertificateNo?: string;
  dateOfBirth?: string;
  gender?: string;
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
}

interface CreateInstituteRequest {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  imageUrl?: string;
}

interface CreateSubjectRequest {
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  basketCategory: string;
  instituteId: string;
}

class ApiService {
  private static getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  static async getUsers(page = 1, limit = 10, isActive = true): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/users?page=${page}&limit=${limit}&isActive=${isActive}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  }

  static async createUser(userData: CreateUserRequest): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return await response.json();
  }

  static async getInstitutes(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/institutes?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch institutes');
    }

    return await response.json();
  }

  static async getSubjects(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/subjects?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }

    return await response.json();
  }

  static async createSubject(subjectData: CreateSubjectRequest): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      throw new Error('Failed to create subject');
    }

    return await response.json();
  }

  static async createInstitute(instituteData: CreateInstituteRequest): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institutes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(instituteData),
    });

    if (!response.ok) {
      throw new Error('Failed to create institute');
    }

    return await response.json();
  }

  static async getPayments(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/payment?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    const data = await response.json();
    return {
      data: data.payments || [],
      meta: {
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
        hasPreviousPage: (data.page || 1) > 1,
        hasNextPage: (data.page || 1) < Math.ceil((data.total || 0) / (data.limit || 10)),
        previousPage: (data.page || 1) > 1 ? (data.page || 1) - 1 : null,
        nextPage: (data.page || 1) < Math.ceil((data.total || 0) / (data.limit || 10)) ? (data.page || 1) + 1 : null,
      }
    };
  }

  static async verifyPayment(paymentId: string, verificationData: {
    status?: string;
    subscriptionPlan?: string;
    paymentValidityDays?: number;
    rejectionReason?: string;
    notes?: string;
  }): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/payment/${paymentId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return await response.json();
  }

  static async assignUserToInstitute(assignData: {
    instituteId: string;
    userId: string;
    userIdByInstitute: string;
    status: string;
  }): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign user to institute');
    }

    return await response.json();
  }

  static async getLectures(page?: number, recordsPerPage?: number): Promise<any> {
    const url = `${getSecondBUrl()}/api/structured-lectures`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lectures');
    }

    return await response.json();
  }

  static async createLecture(lectureData: {
    subjectId: string;
    grade: number;
    title: string;
    description: string;
    lessonNumber: number;
    lectureNumber: number;
    provider: string;
    lectureLink: string;
    documents: Array<{
      name: string;
      url: string;
    }>;
    isActive: boolean;
  }): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/structured-lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(lectureData),
    });

    if (!response.ok) {
      throw new Error('Failed to create lecture');
    }

    return await response.json();
  }

  static async updateLecture(lectureId: string, lectureData: {
    grade: number;
    title: string;
    description: string;
    lessonNumber: number;
    lectureNumber: number;
    provider: string;
    lectureLink: string;
    documents: Array<{
      name: string;
      url: string;
    }>;
    isActive: boolean;
  }): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/structured-lectures/${lectureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(lectureData),
    });

    if (!response.ok) {
      throw new Error('Failed to update lecture');
    }

    return await response.json();
  }

  static async getTransport(): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/bookhires/admin/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transport data');
    }

    return await response.json();
  }

  static async verifyTransport(transportId: string): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/bookhires/admin/${transportId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify transport');
    }

    return await response.json();
  }

  static async rejectTransport(transportId: string): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/bookhires/admin/${transportId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reject transport');
    }

    return await response.json();
  }

  static async assignRfid(assignData: {
    userId: string;
    userRfid: string;
  }): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users/register-rfid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign RFID');
    }

    return await response.json();
  }

  static logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export default ApiService;
export { getSecondBUrl };
