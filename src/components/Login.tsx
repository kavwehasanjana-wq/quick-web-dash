import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { type UserRole } from '@/contexts/AuthContext';
import { Eye, EyeOff, GraduationCap, Wifi, WifiOff, Settings, Mail, Key, UserCheck, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl, getBaseUrl2 } from '@/contexts/utils/auth.api';

// Mock user credentials for different roles
const mockUsers = [
  {
    email: 'institute@cambridge.edu',
    password: 'institute123',
    role: 'InstituteAdmin' as UserRole,
    name: 'Cambridge Admin',
    institutes: [
      { id: '1', name: 'Cambridge International School', code: 'CIS001', description: 'Premier educational institution', isActive: true }
    ]
  },
  {
    email: 'teacher@cambridge.edu',
    password: 'teacher123',
    role: 'Teacher' as UserRole,
    name: 'John Smith',
    institutes: [
      { id: '1', name: 'Cambridge International School', code: 'CIS001', description: 'Premier educational institution', isActive: true },
      { id: '2', name: 'Oxford Academy', code: 'OXF002', description: 'Excellence in education', isActive: true }
    ]
  },
  {
    email: 'marker@cambridge.edu',
    password: 'marker123',
    role: 'AttendanceMarker' as UserRole,
    name: 'Alice Johnson',
    institutes: [
      { id: '1', name: 'Cambridge International School', code: 'CIS001', description: 'Premier educational institution', isActive: true },
      { id: '2', name: 'Oxford Academy', code: 'OXF002', description: 'Excellence in education', isActive: true }
    ]
  },
  {
    email: 'student@cambridge.edu',
    password: 'student123',
    role: 'Student' as UserRole,
    name: 'Emma Wilson',
    institutes: [
      { id: '1', name: 'Cambridge International School', code: 'CIS001', description: 'Premier educational institution', isActive: true },
      { id: '2', name: 'Oxford Academy', code: 'OXF002', description: 'Excellence in education', isActive: true }
    ]
  },
  {
    email: 'parent@cambridge.edu',
    password: 'parent123',
    role: 'Parent' as UserRole,
    name: 'Michael Johnson',
    institutes: [
      { id: '1', name: 'Cambridge International School', code: 'CIS001', description: 'Premier educational institution', isActive: true }
    ]
  },
  {
    email: 'orgmanager@company.com',
    password: 'orgmanager123',
    role: 'OrganizationManager' as UserRole,
    name: 'Organization Manager',
    institutes: [
      { id: 'org-1', name: 'Education Network International', code: 'ENI', description: 'Global education network', isActive: true },
      { id: 'org-2', name: 'Academic Solutions Group', code: 'ASG', description: 'Educational technology solutions', isActive: true },
      { id: 'org-3', name: 'Learning Excellence Corp', code: 'LEC', description: 'Excellence in learning management', isActive: true }
    ]
  }
];

interface LoginProps {
  onLogin: (user: any) => void;
  loginFunction: (credentials: { email: string; password: string }) => Promise<void>;
}

type LoginStep = 'login' | 'first-login-email' | 'first-login-otp' | 'first-login-password' | 'forgot-password' | 'reset-password';

const Login = ({ onLogin, loginFunction }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [baseUrl, setBaseUrl] = useState(() => {
    const stored = getBaseUrl();
    return stored || 'https://your-backend-url.com';
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useApiLogin, setUseApiLogin] = useState(true);
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  
  // First login and forgot password states
  const [loginStep, setLoginStep] = useState<LoginStep>('login');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [attendanceUrl, setAttendanceUrl] = useState(() => {
    const stored = getBaseUrl2();
    return stored || getBaseUrl() || 'https://your-attendance-backend-url.com';
  });
  
  const { toast } = useToast();

  // Store URL changes immediately to localStorage
  const handleBaseUrlChange = (newUrl: string) => {
    setBaseUrl(newUrl);
    if (newUrl.startsWith('http')) {
      localStorage.setItem('baseUrl', newUrl);
    }
  };

  const handleAttendanceUrlChange = (newUrl: string) => {
    setAttendanceUrl(newUrl);
    if (newUrl.startsWith('http')) {
      localStorage.setItem('attendanceUrl', newUrl);
    }
  };

  const getCurrentAttendanceUrl = () => {
    return localStorage.getItem('attendanceUrl') || attendanceUrl;
  };

  const getApiHeaders = () => ({
    'Content-Type': 'application/json'
  });

  // OTP Timer function
  const startOtpTimer = () => {
    setOtpTimer(60);
  };

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Mock login handler
  const handleMockLogin = async (email: string, password: string, role: UserRole) => {
    const user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  };

  // Test connection function
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/health`, {
        headers: getApiHeaders(),
      });
      
      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Backend is reachable",
        });
      } else {
        throw new Error(`Backend returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Cannot reach backend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user requires first login
  const checkFirstLoginStatus = async (email: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/status?email=${email}`, {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.requiresFirstLogin || false;
      }
    } catch (error) {
      console.log('First login status check failed, proceeding with regular login');
    }
    return false;
  };

  // New First Login API Functions
  const initiateFirstLoginAPI = async (email: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/initiate`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
        });
        setLoginStep('first-login-otp');
        startOtpTimer();
        return true;
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Initiate first login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
      return false;
    }
  };

  const verifyFirstLoginOTP = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationToken(data.verificationToken);
        setLoginStep('first-login-password');
        toast({
          title: "OTP Verified",
          description: "Please set your new password.",
        });
        return true;
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error instanceof Error ? error.message : 'OTP verification failed');
      return false;
    }
  };

  const setFirstLoginPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/set-password`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          email,
          verificationToken,
          password: newPassword,
          confirmPassword,
          phoneNumber: phoneNumber || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Password Set Successfully",
          description: "You can now login with your email and password.",
        });
        
        // Reset to login step and clear form
        setLoginStep('login');
        setPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setVerificationToken('');
        setOtp('');
        setPhoneNumber('');
        
        return true;
      } else {
        throw new Error(data.message || 'Failed to set password');
      }
    } catch (error) {
      console.error('Set password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to set password');
      return false;
    }
  };

  const resendFirstLoginOTP = async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "OTP Resent",
          description: "Please check your email for the new verification code.",
        });
        setOtp('');
        startOtpTimer();
        return true;
      } else {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
      return false;
    }
  };

  // Forgot password functions
  const startForgotPassword = () => {
    setLoginStep('forgot-password');
    setError('');
    setOtp('');
    setVerificationToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const initiateForgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Reset Code Sent",
          description: data.message || `Password reset code sent to your email. Expires in ${data.data?.expiresInMinutes || 15} minutes.`,
        });
        setLoginStep('reset-password');
        startOtpTimer();
        return true;
      } else {
        throw new Error(data.message || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset code');
      return false;
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Password Reset Successfully",
          description: data.message || "You can now login with your new password.",
        });
        
        // Reset to login step and clear form
        setLoginStep('login');
        setPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setVerificationToken('');
        setOtp('');
        
        return true;
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password');
      return false;
    }
  };

  const resendForgotPasswordOtp = async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Reset Code Resent",
          description: "Please check your email for the new reset code.",
        });
        setOtp('');
        startOtpTimer();
        return true;
      } else {
        throw new Error(data.message || 'Failed to resend reset code');
      }
    } catch (error) {
      console.error('Resend reset code error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend reset code');
      return false;
    }
  };

  const handleForgotPasswordFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginStep === 'forgot-password') {
        await initiateForgotPassword(email);
      } else if (loginStep === 'reset-password') {
        const success = await resetPassword();
        if (success) {
          toast({
            title: "Success!",
            description: "Your password has been reset successfully. Please login now.",
          });
        }
      }
    } catch (error) {
      console.error('Forgot password flow error:', error);
      setError(error instanceof Error ? error.message : 'Process failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
      setSelectedRole(role);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate base URL is configured for API login
    if (useApiLogin && !baseUrl.startsWith('http')) {
      setError('Please enter a valid Backend URL (starting with http:// or https://) in the settings above before attempting login.');
      setIsLoading(false);
      return;
    }

    try {
      if (useApiLogin) {
        console.log('Attempting API login with credentials:', { email, password: '***' });
        console.log('Using base URL:', baseUrl);
        
        // Use the passed login function from AuthContext
        await loginFunction({ email, password });
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        // Handle mock login
        const user = await handleMockLogin(email, password, selectedRole);
        toast({
          title: "Success",
          description: `Logged in successfully as ${user.role}`,
        });
        
        console.log('User logged in:', user);
        console.log('User role:', user.role);
        onLogin(user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Login failed: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstLoginAPIFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginStep === 'first-login-email') {
        await initiateFirstLoginAPI(email);
      } else if (loginStep === 'first-login-otp') {
        await verifyFirstLoginOTP(email, otp);
      } else if (loginStep === 'first-login-password') {
        const success = await setFirstLoginPassword();
        if (success) {
          toast({
            title: "Welcome!",
            description: "Your account has been set up successfully. Please login now.",
          });
        }
      }
    } catch (error) {
      console.error('First login API flow error:', error);
      setError(error instanceof Error ? error.message : 'Process failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setLoginStep('login');
    setError('');
    setOtp('');
    setVerificationToken('');
    setNewPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setShowFirstLogin(false);
  };

  const startFirstLogin = () => {
    setLoginStep('first-login-email');
    setError('');
    setOtp('');
    setVerificationToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowFirstLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SurakshaLMS</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Institute Learning Management System</p>
        </div>

        {/* Base URL Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Backend Configuration
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="ml-auto"
              >
                {showSettings ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showSettings && (
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Backend URL</Label>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="Enter backend URL"
                  value={baseUrl}
                  onChange={(e) => handleBaseUrlChange(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Current: {baseUrl}
                </p>
                
                <Label htmlFor="attendanceUrl">Attendance Backend URL</Label>
                <Input
                  id="attendanceUrl"
                  type="url"
                  placeholder="Enter attendance backend URL"
                  value={attendanceUrl}
                  onChange={(e) => handleAttendanceUrlChange(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Current: {attendanceUrl}
                </p>
                
                <p className="text-xs text-orange-600">
                  For ngrok: Add --host-header=rewrite flag when starting tunnel
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Login Mode Toggle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Login Mode
              {useApiLogin ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-gray-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={useApiLogin ? "default" : "outline"}
                size="sm"
                onClick={() => setUseApiLogin(true)}
                className="flex-1"
              >
                API Login
              </Button>
              <Button
                type="button"
                variant={!useApiLogin ? "default" : "outline"}
                size="sm"
                onClick={() => setUseApiLogin(false)}
                className="flex-1"
              >
                Mock Login
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {useApiLogin ? "Login via backend API" : "Login with demo credentials"}
            </p>
          </CardContent>
        </Card>

        {/* Main Login/First Login/Forgot Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loginStep === 'login' && <Key className="w-5 h-5" />}
              {loginStep === 'first-login-email' && <UserCheck className="w-5 h-5" />}
              {loginStep === 'first-login-otp' && <Mail className="w-5 h-5" />}
              {(loginStep === 'first-login-password' || loginStep === 'reset-password') && <Key className="w-5 h-5" />}
              {loginStep === 'forgot-password' && <RotateCcw className="w-5 h-5" />}
              
              {loginStep === 'login' && 'Sign In'}
              {loginStep === 'first-login-email' && 'First Login Setup'}
              {loginStep === 'first-login-otp' && 'Verify Email'}
              {loginStep === 'first-login-password' && 'Set Password'}
              {loginStep === 'forgot-password' && 'Forgot Password'}
              {loginStep === 'reset-password' && 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {loginStep === 'login' && (useApiLogin ? "Enter your API credentials" : "Choose your role and enter demo credentials")}
              {loginStep === 'first-login-email' && "Enter your email to start the first login setup process"}
              {loginStep === 'first-login-otp' && "Enter the 6-digit code sent to your email"}
              {loginStep === 'first-login-password' && "Create a secure password for your account"}
              {loginStep === 'forgot-password' && "Enter your email to receive a password reset code"}
              {loginStep === 'reset-password' && "Enter the reset code and your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Regular Login Form */}
            {loginStep === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role Selection - Only show for mock login */}
                {!useApiLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="InstituteAdmin">Institute Administrator</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="AttendanceMarker">Attendance Marker</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="OrganizationManager">Organization Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Login Options */}
                {useApiLogin && (
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={startFirstLogin}
                      className="w-full text-sm text-blue-600 hover:text-blue-800"
                    >
                      First time login? Set up your account
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={startForgotPassword}
                      className="w-full text-sm text-blue-600 hover:text-blue-800"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                )}
              </form>
            )}

            {/* First Login Email Form */}
            {loginStep === 'first-login-email' && (
              <form onSubmit={handleFirstLoginAPIFlow} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstLoginEmail">Email Address</Label>
                    <Input
                      id="firstLoginEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    We'll send a 6-digit verification code to your email address to help you set up your password.
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>

                  <Button type="button" variant="ghost" onClick={resetToLogin} className="w-full">
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {/* First Login OTP Verification */}
            {loginStep === 'first-login-otp' && (
              <form onSubmit={handleFirstLoginAPIFlow} className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We sent a 6-digit code to <strong>{email}</strong>
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-center">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-gray-500">
                        Resend code in {otpTimer}s
                      </p>
                    ) : (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={resendFirstLoginOTP}
                        disabled={isLoading}
                      >
                        Resend Code
                      </Button>
                    )}
                  </div>

                  <Button type="button" variant="ghost" onClick={resetToLogin} className="w-full">
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {/* First Login Password Setup */}
            {loginStep === 'first-login-password' && (
              <form onSubmit={handleFirstLoginAPIFlow} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newFirstPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newFirstPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmFirstPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmFirstPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Password Requirements:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Minimum 8 characters</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    {isLoading ? 'Setting Password...' : 'Set Password'}
                  </Button>

                  <Button type="button" variant="ghost" onClick={resetToLogin} className="w-full">
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {/* Forgot Password Form */}
            {loginStep === 'forgot-password' && (
              <form onSubmit={handleForgotPasswordFlow} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    We'll send a 6-digit reset code to your email address.
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending Reset Code...' : 'Send Reset Code'}
                  </Button>

                  <Button type="button" variant="ghost" onClick={resetToLogin} className="w-full">
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {/* Reset Password Form */}
            {loginStep === 'reset-password' && (
              <form onSubmit={handleForgotPasswordFlow} className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      We sent a 6-digit reset code to <strong>{email}</strong>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resetOtp">Reset Code (OTP)</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newResetPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newResetPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmResetPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmResetPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Password Requirements:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Minimum 8 characters</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || otp.length !== 6 || !newPassword || !confirmPassword}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend code in {otpTimer}s
                      </p>
                    ) : (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={resendForgotPasswordOtp}
                        disabled={isLoading}
                        className="text-sm"
                      >
                        Resend Reset Code
                      </Button>
                    )}
                  </div>

                  <Button type="button" variant="ghost" onClick={resetToLogin} className="w-full">
                    Back to Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Quick Login Options - Only show for mock login */}
        {!useApiLogin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Login (Demo)</CardTitle>
              <CardDescription className="text-xs">Click to auto-fill credentials for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('InstituteAdmin')}
                  className="text-xs"
                >
                  Institute Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('Teacher')}
                  className="text-xs"
                >
                  Teacher
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('AttendanceMarker')}
                  className="text-xs"
                >
                  Att. Marker
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('Student')}
                  className="text-xs"
                >
                  Student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('Parent')}
                  className="text-xs"
                >
                  Parent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('OrganizationManager')}
                  className="text-xs"
                >
                  Org Manager
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Demo Credentials */}
        {useApiLogin && (
          <Card className="text-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">API Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600 dark:text-gray-400">
              <div><strong>Example:</strong> 123@gmail.com / password123</div>
            </CardContent>
          </Card>
        )}

        {/* Demo Credentials - Only show for mock login */}
        {!useApiLogin && (
          <Card className="text-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600 dark:text-gray-400">
              <div><strong>Institute Admin:</strong> institute@cambridge.edu / institute123</div>
              <div><strong>Teacher:</strong> teacher@cambridge.edu / teacher123</div>
              <div><strong>Attendance Marker:</strong> marker@cambridge.edu / marker123</div>
              <div><strong>Student:</strong> student@cambridge.edu / student123</div>
              <div><strong>Parent:</strong> parent@cambridge.edu / parent123</div>
              <div><strong>Organization Manager:</strong> orgmanager@company.com / orgmanager123</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
