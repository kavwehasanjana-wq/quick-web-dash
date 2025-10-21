import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { CalendarIcon, User, GraduationCap, Users } from 'lucide-react';

interface CreateComprehensiveUserFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

type UserType = 'USER' | 'USER_WITHOUT_PARENT' | 'USER_WITHOUT_STUDENT';
type BloodGroup = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE';

const CreateComprehensiveUserForm = ({ onSubmit, onCancel }: CreateComprehensiveUserFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('USER');

  // Basic user data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    nic: '',
    birthCertificateNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    country: 'Sri Lanka',
    idUrl: '',
    isActive: true,
  });

  // Student data
  const [studentData, setStudentData] = useState({
    studentId: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    bloodGroup: '' as BloodGroup | '',
    fatherId: '',
    fatherPhoneNumber: '',
    motherId: '',
    motherPhoneNumber: '',
    guardianId: '',
    guardianPhoneNumber: '',
  });

  // Parent data
  const [parentData, setParentData] = useState({
    occupation: '',
    workplace: '',
    workPhone: '',
    educationLevel: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStudentDataChange = (field: string, value: any) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const handleParentDataChange = (field: string, value: any) => {
    setParentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        ...formData,
        userType,
      };

      // Add student data if applicable
      if (userType === 'USER' || userType === 'USER_WITHOUT_PARENT') {
        payload.studentData = studentData;
      }

      // Add parent data if applicable
      if (userType === 'USER' || userType === 'USER_WITHOUT_STUDENT') {
        payload.parentData = parentData;
      }

      const response = await apiClient.post('/users/comprehensive', payload);
      
      toast({
        title: "Success",
        description: response.message || "User created successfully!",
      });
      
      onSubmit(response);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || 'Failed to create user',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showStudentData = userType === 'USER' || userType === 'USER_WITHOUT_PARENT';
  const showParentData = userType === 'USER' || userType === 'USER_WITHOUT_STUDENT';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-6xl max-h-[98vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Create Comprehensive User
          </DialogTitle>
          <p className="text-muted-foreground text-center mt-2">Create a user with complete profile information</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* User Type Selection */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  User Type
                </h3>
                
                <div>
                  <Label htmlFor="userType" className="text-base font-semibold text-foreground">Select User Type *</Label>
                  <Select value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER (Can be both student and parent)</SelectItem>
                      <SelectItem value="USER_WITHOUT_PARENT">USER WITHOUT PARENT (Cannot be assigned as parent)</SelectItem>
                      <SelectItem value="USER_WITHOUT_STUDENT">USER WITHOUT STUDENT (Cannot be assigned as student)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    {userType === 'USER' && 'This user can play any institute role and can be assigned as both student and parent'}
                    {userType === 'USER_WITHOUT_PARENT' && 'This user can play any institute role but CANNOT be assigned as parent'}
                    {userType === 'USER_WITHOUT_STUDENT' && 'This user can play any institute role but CANNOT be assigned as student'}
                  </p>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-base font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-base font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-base font-semibold">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="+94XXXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-base font-semibold">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="mt-2 h-12 text-base">
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
                    <Label htmlFor="dateOfBirth" className="text-base font-semibold">Date of Birth *</Label>
                    <div className="relative mt-2">
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nic" className="text-base font-semibold">NIC</Label>
                    <Input
                      id="nic"
                      value={formData.nic}
                      onChange={(e) => handleInputChange('nic', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter NIC number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthCertificateNo" className="text-base font-semibold">Birth Certificate No</Label>
                    <Input
                      id="birthCertificateNo"
                      value={formData.birthCertificateNo}
                      onChange={(e) => handleInputChange('birthCertificateNo', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="BC-XXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold">2</span>
                  </div>
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="addressLine1" className="text-base font-semibold">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2" className="text-base font-semibold">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Apartment, building"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-base font-semibold">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-base font-semibold">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter district"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province" className="text-base font-semibold">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="text-base font-semibold">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="country" className="text-base font-semibold">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Sri Lanka"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="idUrl" className="text-base font-semibold">ID Document URL</Label>
                    <Input
                      id="idUrl"
                      value={formData.idUrl}
                      onChange={(e) => handleInputChange('idUrl', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="https://example.com/id-document.pdf"
                    />
                  </div>
                </div>
              </div>

              {/* Student Data Section */}
              {showStudentData && (
                <div className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                  <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    </div>
                    Student Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="studentId" className="text-base font-semibold">Student ID</Label>
                      <Input
                        id="studentId"
                        value={studentData.studentId}
                        onChange={(e) => handleStudentDataChange('studentId', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="STU-2025-XXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact" className="text-base font-semibold">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={studentData.emergencyContact}
                        onChange={(e) => handleStudentDataChange('emergencyContact', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="+94XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicalConditions" className="text-base font-semibold">Medical Conditions</Label>
                      <Input
                        id="medicalConditions"
                        value={studentData.medicalConditions}
                        onChange={(e) => handleStudentDataChange('medicalConditions', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="None or specify conditions"
                      />
                    </div>
                    <div>
                      <Label htmlFor="allergies" className="text-base font-semibold">Allergies</Label>
                      <Input
                        id="allergies"
                        value={studentData.allergies}
                        onChange={(e) => handleStudentDataChange('allergies', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="None or specify allergies"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bloodGroup" className="text-base font-semibold">Blood Group</Label>
                      <Select value={studentData.bloodGroup} onValueChange={(value) => handleStudentDataChange('bloodGroup', value)}>
                        <SelectTrigger className="mt-2 h-12 text-base">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A_POSITIVE">A+</SelectItem>
                          <SelectItem value="A_NEGATIVE">A-</SelectItem>
                          <SelectItem value="B_POSITIVE">B+</SelectItem>
                          <SelectItem value="B_NEGATIVE">B-</SelectItem>
                          <SelectItem value="O_POSITIVE">O+</SelectItem>
                          <SelectItem value="O_NEGATIVE">O-</SelectItem>
                          <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                          <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fatherId" className="text-base font-semibold">Father ID</Label>
                      <Input
                        id="fatherId"
                        value={studentData.fatherId}
                        onChange={(e) => handleStudentDataChange('fatherId', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="User ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherPhoneNumber" className="text-base font-semibold">Father Phone Number</Label>
                      <Input
                        id="fatherPhoneNumber"
                        value={studentData.fatherPhoneNumber}
                        onChange={(e) => handleStudentDataChange('fatherPhoneNumber', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="+94XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherId" className="text-base font-semibold">Mother ID</Label>
                      <Input
                        id="motherId"
                        value={studentData.motherId}
                        onChange={(e) => handleStudentDataChange('motherId', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="User ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motherPhoneNumber" className="text-base font-semibold">Mother Phone Number</Label>
                      <Input
                        id="motherPhoneNumber"
                        value={studentData.motherPhoneNumber}
                        onChange={(e) => handleStudentDataChange('motherPhoneNumber', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="+94XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardianId" className="text-base font-semibold">Guardian ID</Label>
                      <Input
                        id="guardianId"
                        value={studentData.guardianId}
                        onChange={(e) => handleStudentDataChange('guardianId', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="User ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardianPhoneNumber" className="text-base font-semibold">Guardian Phone Number</Label>
                      <Input
                        id="guardianPhoneNumber"
                        value={studentData.guardianPhoneNumber}
                        onChange={(e) => handleStudentDataChange('guardianPhoneNumber', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="+94XXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Data Section */}
              {showParentData && (
                <div className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 p-6 rounded-lg border border-purple-500/20">
                  <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    Parent Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="occupation" className="text-base font-semibold">Occupation</Label>
                      <Input
                        id="occupation"
                        value={parentData.occupation}
                        onChange={(e) => handleParentDataChange('occupation', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="Enter occupation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workplace" className="text-base font-semibold">Workplace</Label>
                      <Input
                        id="workplace"
                        value={parentData.workplace}
                        onChange={(e) => handleParentDataChange('workplace', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="Enter workplace"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workPhone" className="text-base font-semibold">Work Phone</Label>
                      <Input
                        id="workPhone"
                        value={parentData.workPhone}
                        onChange={(e) => handleParentDataChange('workPhone', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="+94XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="educationLevel" className="text-base font-semibold">Education Level</Label>
                      <Input
                        id="educationLevel"
                        value={parentData.educationLevel}
                        onChange={(e) => handleParentDataChange('educationLevel', e.target.value)}
                        className="mt-2 h-12 text-base"
                        placeholder="Enter education level"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-12 px-8 text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateComprehensiveUserForm;
