
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { ParentCreateData } from '@/api/parents.api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface CreateParentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const CreateParentForm = ({ onSubmit, onCancel, initialData }: CreateParentFormProps) => {
  const { currentInstituteId, user } = useAuth();
  
  // Check if user has permission (only SuperAdmin and InstituteAdmin)
  const userRole = user?.role;
  const hasPermission = userRole === 'SystemAdmin' || userRole === 'InstituteAdmin';
  
  const [formData, setFormData] = useState({
    // User Information
    firstName: initialData?.user?.firstName || '',
    lastName: initialData?.user?.lastName || '',
    email: initialData?.user?.email || '',
    password: initialData?.user?.password || 'parent123',
    phone: initialData?.user?.phone || '',
    dateOfBirth: initialData?.user?.dateOfBirth || '',
    gender: initialData?.user?.gender || '',
    nic: initialData?.user?.nic || '',
    birthCertificateNo: initialData?.user?.birthCertificateNo || '',
    addressLine1: initialData?.user?.addressLine1 || '',
    addressLine2: initialData?.user?.addressLine2 || '',
    city: initialData?.user?.city || '',
    district: initialData?.user?.district || '',
    province: initialData?.user?.province || '',
    postalCode: initialData?.user?.postalCode || '',
    country: initialData?.user?.country || 'Sri Lanka',
    imageUrl: initialData?.user?.imageUrl || '',
    isActive: initialData?.user?.isActive ?? true,
    
    // Parent Specific Information
    occupation: initialData?.occupation || '',
    workplace: initialData?.workplace || '',
    workPhone: initialData?.workPhone || '',
    educationLevel: initialData?.educationLevel || ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission) {
      toast.error('You do not have permission to create parents');
      return;
    }

    // Validation
    if (formData.phone.length < 10) {
      toast.error('Phone number must be at least 10 characters');
      return;
    }

    if (formData.workPhone && formData.workPhone.length < 10) {
      toast.error('Work phone number must be at least 10 characters');
      return;
    }

    if (!formData.addressLine2.trim()) {
      toast.error('Address Line 2 is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedData: ParentCreateData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nic: formData.nic,
          birthCertificateNo: formData.birthCertificateNo,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || 'N/A', // Provide default value if empty
          city: formData.city,
          district: formData.district,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
          imageUrl: formData.imageUrl,
          isActive: formData.isActive,
          userType: 'PARENT' // Add missing userType field
        },
        occupation: formData.occupation,
        workplace: formData.workplace,
        workPhone: formData.workPhone || '0000000000', // Provide default value if empty
        educationLevel: formData.educationLevel,
        isActive: formData.isActive
      };

      console.log('Submitting parent data:', formattedData);
      
      if (!initialData) {
        // Use direct API call instead of parentsApi for better control
        const baseUrl = getBaseUrl();
        const headers = getApiHeaders();
        
        const response = await fetch(`${baseUrl}/parents`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formattedData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create parent');
        }
        
        const result = await response.json();
        console.log('Parent created successfully:', result);
        
        toast.success('Parent created successfully!');
        // Pass the original form data to parent, not the API response
        onSubmit(formattedData);
      } else {
        onSubmit(formattedData);
      }
    } catch (error: any) {
      console.error('Error creating parent:', error);
      toast.error(error?.message || 'Failed to create parent');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Only SuperAdmin and InstituteAdmin can create parents.</p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={formData.imageUrl} 
                    alt="Parent Image"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            {!initialData && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="phone">Phone * (minimum 10 characters)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+94771234567"
                required
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth (YYYY-MM-DD) *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nic">NIC (must be unique)</Label>
              <Input
                id="nic"
                value={formData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
                placeholder="200123456789"
              />
            </div>

            <div>
              <Label htmlFor="birthCertificateNo">Birth Certificate No (must be unique)</Label>
              <Input
                id="birthCertificateNo"
                value={formData.birthCertificateNo}
                onChange={(e) => handleInputChange('birthCertificateNo', e.target.value)}
                placeholder="123456789"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="occupation">Occupation *</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="workplace">Workplace</Label>
              <Input
                id="workplace"
                value={formData.workplace}
                onChange={(e) => handleInputChange('workplace', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="workPhone">Work Phone * (minimum 10 characters)</Label>
              <Input
                id="workPhone"
                value={formData.workPhone}
                onChange={(e) => handleInputChange('workPhone', e.target.value)}
                placeholder="+94771234567"
                required
              />
            </div>

            <div>
              <Label htmlFor="educationLevel">Education Level</Label>
              <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange('educationLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary Education">Primary Education</SelectItem>
                  <SelectItem value="Secondary Education">Secondary Education</SelectItem>
                  <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="Doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2 *</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  placeholder="Required field"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : (initialData ? 'Update Parent' : 'Create Parent')}
        </Button>
      </div>
    </form>
  );
};

export default CreateParentForm;
