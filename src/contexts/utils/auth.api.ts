
import { LoginCredentials, ApiResponse, User } from '../types/auth.types';

export const getBaseUrl = (): string => {
  return 'https://lms-923357517997.europe-west1.run.app';
};

export const getBaseUrl2 = (): string => {
  const storedUrl = localStorage.getItem('baseUrl2');
  if (storedUrl) {
    return storedUrl;
  }
  
  const envUrl = import.meta.env.VITE_API_BASE_URL_2;
  if (envUrl) {
    return envUrl;
  }
  
  return '';
};

export const getAttendanceUrl = (): string => {
  return 'https://laas-backend-02-923357517997.europe-west1.run.app';
};

export const getApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('access_token');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const loginUser = async (credentials: LoginCredentials): Promise<ApiResponse> => {
  const baseUrl = getBaseUrl();
  
  console.log('🔐 Login attempt:', { email: credentials.email });
  
  const response = await fetch(`${baseUrl}/v2/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // CRITICAL: Include cookies for refresh token
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Login failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Store access token and user data in localStorage
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    console.log('✅ Access token stored');
  }
  
  if (data.user) {
    localStorage.setItem('user_data', JSON.stringify(data.user));
    console.log('✅ User data stored');
  }
  
  // Refresh token is automatically stored in httpOnly cookie by server
  console.log('✅ Login successful, refresh token in cookie');
  
  return data;
};

/**
 * Refresh access token using httpOnly cookie
 */
export const refreshAccessToken = async (): Promise<User> => {
  const baseUrl = getBaseUrl();
  
  console.log('🔄 Refreshing access token...');
  
  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // CRITICAL: Send refresh token cookie
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('❌ Token refresh failed:', response.status);
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Dispatch auth failure event
    window.dispatchEvent(new CustomEvent('auth:refresh-failed'));
    
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  
  // Store new access token and user data
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    console.log('✅ New access token stored');
  }
  
  if (data.user) {
    localStorage.setItem('user_data', JSON.stringify(data.user));
    console.log('✅ User data updated');
  }
  
  // Dispatch custom event to notify AuthContext
  window.dispatchEvent(new CustomEvent('auth:refresh-success', {
    detail: { user: data.user }
  }));
  
  return data.user;
};

/**
 * Validate token and get user data
 * Only calls /auth/me if user data doesn't exist in localStorage
 */
export const validateToken = async (): Promise<User> => {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('access_token');
  const cachedUserData = localStorage.getItem('user_data');

  // If no access token, try to refresh
  if (!token) {
    console.log('⚠️ No access token, attempting refresh...');
    try {
      return await refreshAccessToken();
    } catch (error) {
      console.error('❌ Refresh failed, user must login');
      throw new Error('No authentication token found');
    }
  }

  // If user data exists in localStorage, return it (skip /auth/me call)
  if (cachedUserData) {
    try {
      const userData = JSON.parse(cachedUserData);
      console.log('✅ Using cached user data:', {
        userId: userData.id,
        email: userData.email
      });
      return userData;
    } catch (error) {
      console.warn('⚠️ Failed to parse cached user data');
    }
  }

  // No cached user data, call /auth/me
  console.log('🔐 Fetching user data from /auth/me...');

  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: getApiHeaders(),
      credentials: 'include'
    });

    // If 401, try to refresh token
    if (response.status === 401) {
      console.log('⚠️ Access token expired, attempting refresh...');
      return await refreshAccessToken();
    }

    if (!response.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      throw new Error(`Token validation failed: ${response.status}`);
    }

    const userData = await response.json();
    
    // Cache user data
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    console.log('✅ User data fetched and cached:', {
      userId: userData.id,
      email: userData.email
    });
    
    return userData;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  const baseUrl = getBaseUrl();
  
  console.log('🚪 Logging out...');
  
  try {
    // Call logout endpoint to revoke refresh token
    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // CRITICAL: Send refresh token cookie to revoke
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Logout endpoint called, refresh token revoked');
  } catch (error) {
    console.warn('⚠️ Logout endpoint call failed:', error);
  }
  
  // Clear all auth-related data from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('org_access_token');
  
  // Clear context selections
  localStorage.removeItem('selectedInstitute');
  localStorage.removeItem('selectedClass');
  localStorage.removeItem('selectedSubject');
  localStorage.removeItem('selectedChild');
  localStorage.removeItem('selectedOrganization');
  
  console.log('✅ All auth data cleared from localStorage');
};
