import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface CreateClassFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CreateClassForm = ({ onSubmit, onCancel }: CreateClassFormProps) => {
  const { user, selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: '',
    level: 10,
    grade: 10,
    specialty: '',
    classType: 'REGULAR',
    capacity: 30,
    classTeacherId: '',
    description: '',
    isActive: true,
    startDate: '',
    endDate: '',
    enrollmentCode: '',
    enrollmentEnabled: true,
    requireTeacherVerification: true,
    imageUrl: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInstitute?.id) {
      toast({
        title: "Missing Selection",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const classData = {
        instituteId: selectedInstitute.id,
        name: formData.name,
        code: formData.code,
        academicYear: formData.academicYear,
        level: formData.level,
        grade: formData.grade,
        specialty: formData.specialty,
        classType: formData.classType,
        capacity: formData.capacity,
        classTeacherId: formData.classTeacherId || undefined,
        description: formData.description,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        enrollmentCode: formData.enrollmentCode,
        enrollmentEnabled: formData.enrollmentEnabled,
        requireTeacherVerification: formData.requireTeacherVerification,
        imageUrl: formData.imageUrl
      };

      const response = await fetch(`${getBaseUrl()}/institute-classes`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(classData)
      });

      if (response.ok) {
        const responseData = await response.json();
        toast({
          title: "Class Created",
          description: `Class "${formData.name}" has been created successfully.`
        });
        onSubmit(responseData);
      } else {
        throw new Error('Failed to create class');
      }
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error?.response?.data?.message || "Failed to create class.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-1">
      {/* Compact: All in one section for mobile, two columns for larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Basic Info - Compact */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="name" className="text-xs">Class Name</Label>
                <Input
                  id="name"
                  placeholder="Grade 10 Science - A"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code" className="text-xs">Class Code</Label>
                <Input
                  id="code"
                  placeholder="G10SA"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="academicYear" className="text-xs">Academic Year</Label>
                <Input
                  id="academicYear"
                  placeholder="2025/2026"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialty" className="text-xs">Specialty</Label>
                <Input
                  id="specialty"
                  placeholder="Science Stream"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details - Compact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="level" className="text-xs">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="13"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-xs">Grade</Label>
                <Input
                  id="grade"
                  type="number"
                  min="1"
                  max="13"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                  className="h-8 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="capacity" className="text-xs">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                className="h-8 text-sm"
                required
              />
            </div>
            <div>
              <Label htmlFor="classType" className="text-xs">Type</Label>
              <Select value={formData.classType} onValueChange={(value) => handleInputChange('classType', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="REMEDIAL">Remedial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule & Enrollment - Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="h-8 text-sm"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enrollment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="enrollmentCode" className="text-xs">Code</Label>
              <Input
                id="enrollmentCode"
                placeholder="2025"
                value={formData.enrollmentCode}
                onChange={(e) => handleInputChange('enrollmentCode', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Switch
                  id="enrollmentEnabled"
                  checked={formData.enrollmentEnabled}
                  onCheckedChange={(checked) => handleInputChange('enrollmentEnabled', checked)}
                />
                <Label htmlFor="enrollmentEnabled">Enable</Label>
              </div>
              <div className="flex items-center space-x-1">
                <Switch
                  id="requireTeacherVerification"
                  checked={formData.requireTeacherVerification}
                  onCheckedChange={(checked) => handleInputChange('requireTeacherVerification', checked)}
                />
                <Label htmlFor="requireTeacherVerification">Verify</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info - Compact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                placeholder="Class description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="h-16 text-sm resize-none"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive" className="text-xs">Active Class</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact button layout */}
      <div className="flex justify-end gap-2 pt-1">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="h-8 px-3 text-sm"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-8 px-3 text-sm"
        >
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default CreateClassForm;