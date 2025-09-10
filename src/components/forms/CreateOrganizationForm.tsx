
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi, OrganizationCreateData } from '@/api/organization.api';

interface CreateOrganizationFormProps {
  onSuccess?: (organization: any) => void;
  onCancel?: () => void;
}

const CreateOrganizationForm = ({ onSuccess, onCancel }: CreateOrganizationFormProps) => {
  const [formData, setFormData] = useState<OrganizationCreateData>({
    name: '',
    type: 'INSTITUTE',
    isPublic: true,
    enrollmentKey: '',
    needEnrollmentVerification: true,
    enabledEnrollments: true,
    imageUrl: '',
    instituteId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate enrollment key for INSTITUTE organizations
    if (formData.type === 'INSTITUTE' && !formData.enrollmentKey?.trim()) {
      toast({
        title: "Validation Error",
        description: "Enrollment key is required for institute organizations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const organization = await organizationApi.createOrganization(formData);
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
      
      if (onSuccess) {
        onSuccess(organization);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationCreateData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Organization</h1>
            <p className="text-gray-600 dark:text-gray-400">Set up a new organization</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Fill in the information below to create your organization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter organization name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Organization Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTITUTE">Institute</SelectItem>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instituteId">Institute ID *</Label>
                <Input
                  id="instituteId"
                  placeholder="Enter institute ID"
                  value={formData.instituteId}
                  onChange={(e) => handleInputChange('instituteId', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="Enter organization image URL"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentKey">
                  Enrollment Key {formData.type === 'INSTITUTE' ? '(Required)' : '(Optional)'}
                </Label>
                <Input
                  id="enrollmentKey"
                  placeholder={formData.type === 'INSTITUTE' 
                    ? "Enter enrollment key..." 
                    : "Enter enrollment key (optional)"
                  }
                  value={formData.enrollmentKey}
                  onChange={(e) => handleInputChange('enrollmentKey', e.target.value)}
                  required={formData.type === 'INSTITUTE'}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
                <Label htmlFor="isPublic">Public Organization</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="needEnrollmentVerification"
                  checked={formData.needEnrollmentVerification}
                  onCheckedChange={(checked) => handleInputChange('needEnrollmentVerification', checked)}
                />
                <Label htmlFor="needEnrollmentVerification">Require Enrollment Verification</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabledEnrollments"
                  checked={formData.enabledEnrollments}
                  onCheckedChange={(checked) => handleInputChange('enabledEnrollments', checked)}
                />
                <Label htmlFor="enabledEnrollments">Enable Enrollments</Label>
              </div>

              <div className="flex justify-end space-x-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Organization"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrganizationForm;
