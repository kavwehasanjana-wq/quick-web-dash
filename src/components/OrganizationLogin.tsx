
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Eye, EyeOff, ArrowLeft, Settings, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi } from '@/api/organization.api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrganizationLoginProps {
  onLogin?: (loginResponse: any) => void;
  onBack?: () => void;
}

const OrganizationLogin = ({ onLogin, onBack }: OrganizationLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [baseUrl2, setBaseUrl2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize baseUrl2 from localStorage
  React.useMemo(() => {
    const existingBaseUrl2 = localStorage.getItem('baseUrl2');
    if (existingBaseUrl2) {
      setBaseUrl2(existingBaseUrl2);
    } else {
      // If no URL is configured, show advanced settings by default
      setShowAdvanced(true);
    }
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      // Allow both HTTP and HTTPS for development/production flexibility
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!baseUrl2) {
      toast({
        title: "Configuration Error",
        description: "Please set the organization API base URL in Advanced Settings",
        variant: "destructive",
      });
      setShowAdvanced(true);
      return;
    }

    if (!validateUrl(baseUrl2)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    // Save baseUrl2 to localStorage
    localStorage.setItem('baseUrl2', baseUrl2);

    setIsLoading(true);
    
    try {
      const loginResponse = await organizationApi.loginToOrganization({ email, password });
      
      // Store organization access token - organization API returns 'accessToken'
      if (loginResponse.accessToken) {
        localStorage.setItem('org_access_token', loginResponse.accessToken);
        console.log('Organization access token stored successfully');
      } else {
        console.error('No access token received from organization login response');
      }
      
      if (onLogin) {
        onLogin(loginResponse);
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome to the organization portal",
      });
    } catch (error) {
      console.error('Organization login error:', error);
      
      let errorMessage = "Login failed. Please check your credentials and try again.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = `Cannot connect to the organization API at ${baseUrl2}. Please verify the server is running and the URL is correct.`;
        } else if (error.message.includes('Mixed Content')) {
          errorMessage = "Mixed content error. If using HTTPS, ensure the API URL also uses HTTPS.";
        } else if (error.message.includes('Organization base URL not configured')) {
          errorMessage = "Please configure the organization API base URL in Advanced Settings.";
        } else if (error.message.includes('HTTP Error: 404')) {
          errorMessage = "API endpoint not found. Please verify the base URL is correct.";
        } else if (error.message.includes('HTTP Error: 401')) {
          errorMessage = "Invalid credentials. Please check your email and password.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center justify-center flex-1">
              <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Organization Login</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to access your organization's portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!baseUrl2 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please configure the Organization API Base URL in Advanced Settings below.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
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
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-muted-foreground"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                  {!baseUrl2 && <span className="ml-2 text-xs text-red-500">(Required)</span>}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl2">Organization API Base URL *</Label>
                  <Input
                    id="baseUrl2"
                    type="text"
                    placeholder="https://your-org-api.com or https://your-backend-url.com"
                    value={baseUrl2}
                    onChange={(e) => setBaseUrl2(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The base URL for your organization's API endpoint. Make sure the server is running and accessible.
                  </p>
                  {baseUrl2 && !validateUrl(baseUrl2) && (
                    <p className="text-xs text-red-500">
                      Invalid URL format. Please include http:// or https://
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !baseUrl2 || !validateUrl(baseUrl2)}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationLogin;
