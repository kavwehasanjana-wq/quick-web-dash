import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  dateOfBirth: string;
  gender: string;
  imageUrl: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '123 Main Street, City, State 12345',
    bio: 'Experienced educator with a passion for student success.',
    joinDate: '',
    dateOfBirth: '',
    gender: ''
  });

  const userPermissions = AccessControl.getPermissions((user?.role || 'Student') as UserRole);

  // Remove automatic loading - set default values instead
  const loadUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Fetching user data for ID:', user.id);
      const response = await apiClient.get<UserData>(`/users/${user.id}`);
      console.log('User data response:', response);
      
      setUserData(response);
      
      // Update form data with API response
      setFormData({
        name: `${response.firstName} ${response.lastName}`,
        email: response.email,
        phone: response.phone,
        address: '123 Main Street, City, State 12345',
        bio: 'Experienced educator with a passion for student success.',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-01-15',
        dateOfBirth: response.dateOfBirth,
        gender: response.gender
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize with default values
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        email: user.email || '',
        phone: user.phone || '',
        address: '123 Main Street, City, State 12345',
        bio: 'Experienced educator with a passion for student success.',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-01-15',
        dateOfBirth: '',
        gender: ''
      });
    }
    setLoading(false);
  }, [user]);

  const handleSave = () => {
    // Save logic would go here
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        address: '123 Main Street, City, State 12345',
        bio: 'Experienced educator with a passion for student success.',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-01-15',
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender
      });
    }
    setIsEditing(false);
  };

  const handleImageUpdate = (newImageUrl: string) => {
    if (userData) {
      setUserData({
        ...userData,
        imageUrl: newImageUrl
      });
    }
    console.log('Profile image updated:', newImageUrl);
  };

  // Use the imageUrl from API response
  const currentImageUrl = userData?.imageUrl || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadUserData}
                      disabled={loading}
                    >
                      Load Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex justify-center pb-4 border-b">
                <ProfileImageUpload
                  currentImageUrl={currentImageUrl}
                  onImageUpdate={handleImageUpdate}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.phone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Input
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.gender}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.joinDate}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formData.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role & Permissions Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Role</Label>
                <div className="mt-1">
                  <Badge variant="default" className="text-sm">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>User Type</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-sm">
                    {userData?.userType || user?.userType}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="mt-2 space-y-1">
                  {userPermissions.slice(0, 8).map((permission, index) => (
                    <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                      {permission.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                  {userPermissions.length > 8 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{userPermissions.length - 8} more permissions
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Login Sessions</span>
                <span className="font-medium">145</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                <span className="font-medium">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
                <span className="font-medium">#{userData?.id || user?.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
