
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi, OrganizationCreateData } from '@/api/organization.api';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface CreateOrganizationFormProps {
  onSuccess?: (organization: any) => void;
  onCancel?: () => void;
  instituteId?: string;
  instituteName?: string;
}

const CreateOrganizationForm = ({ onSuccess, onCancel, instituteId, instituteName }: CreateOrganizationFormProps) => {
  const [formData, setFormData] = useState<OrganizationCreateData>({
    name: '',
    type: 'INSTITUTE',
    isPublic: true,
    enrollmentKey: '',
    needEnrollmentVerification: true,
    enabledEnrollments: true,
    imageUrl: '',
    instituteId: instituteId || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // UX constants
  const MAX_NAME_LEN = 100;
  const MAX_KEY_LEN = 50;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  const [errors, setErrors] = useState<{ name?: string; enrollmentKey?: string; image?: string }>({});
  const [isDragging, setIsDragging] = useState(false);

  const processImageFile = (file: File) => {
    // Validate type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Unsupported file type. Use PNG, JPG or WEBP.' }));
      toast({ title: 'Invalid file type', description: 'Please upload PNG, JPG or WEBP images.', variant: 'destructive' });
      return;
    }
    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, image: 'File too large. Max 5MB.' }));
      toast({ title: 'File too large', description: 'Please select an image smaller than 5MB.', variant: 'destructive' });
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDropZoneDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDropZoneLeave = () => setIsDragging(false);

  const handleDropZoneDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors: { name?: string; enrollmentKey?: string; image?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length > MAX_NAME_LEN) {
      newErrors.name = `Name must be less than ${MAX_NAME_LEN} characters`;
    }

    if (formData.type === 'INSTITUTE') {
      if (!formData.enrollmentKey?.trim()) {
        newErrors.enrollmentKey = 'Enrollment key is required for institute organizations';
      } else if (formData.enrollmentKey.trim().length > MAX_KEY_LEN) {
        newErrors.enrollmentKey = `Enrollment key must be less than ${MAX_KEY_LEN} characters`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: 'Please fix the errors', description: 'Check the highlighted fields.', variant: 'destructive' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('isPublic', String(formData.isPublic));
      formDataToSend.append('needEnrollmentVerification', String(formData.needEnrollmentVerification));
      formDataToSend.append('enabledEnrollments', String(formData.enabledEnrollments));
      if (formData.enrollmentKey) formDataToSend.append('enrollmentKey', formData.enrollmentKey);
      if (formData.instituteId) formDataToSend.append('instituteId', formData.instituteId);
      if (selectedImage) formDataToSend.append('image', selectedImage);
      
      const response = await fetch(`${getBaseUrl()}/organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create organization');
      }
      
      const organization = await response.json();
      
      toast({
        title: "Success",
        description: `Organization "${organization.name}" created successfully`,
      });
      
      if (onSuccess) {
        onSuccess(organization);
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      
      // Provide specific error messages
      let errorMessage = "Failed to create organization";
      
      if (error instanceof Error) {
        if (error.message.includes("Only Organization Managers, Super Admins, or Institute Admins")) {
          errorMessage = "You don't have permission to create organizations. Please contact your administrator.";
        } else if (error.message.includes("Forbidden")) {
          errorMessage = "Access denied. You need Institute Admin permissions to create organizations.";
        } else if (error.message.includes("already exists")) {
          errorMessage = "An organization with this name already exists.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Cannot Create Organization",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationCreateData, value: string | boolean) => {
    setFormData((prev) => {
      let next = { ...prev } as OrganizationCreateData;

      if (field === 'name' && typeof value === 'string') {
        value = (value as string).slice(0, MAX_NAME_LEN);
        setErrors((p) => ({ ...p, name: undefined }));
      }
      if (field === 'enrollmentKey' && typeof value === 'string') {
        value = (value as string).slice(0, MAX_KEY_LEN);
        setErrors((p) => ({ ...p, enrollmentKey: undefined }));
      }
      if (field === 'type') {
        next.type = value as OrganizationCreateData['type'];
        // When switching away from INSTITUTE, clear the key
        if (value !== 'INSTITUTE') {
          next.enrollmentKey = '';
          setErrors((p) => ({ ...p, enrollmentKey: undefined }));
        }
        return next;
      }

      return { ...prev, [field]: value } as OrganizationCreateData;
    });
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6 sticky top-0 bg-card z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl">Organization Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Fill in the information below to create your organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
                Organization Name *
              </Label>
               <Input
                id="name"
                placeholder="Enter organization name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                aria-invalid={!!errors.name}
                className="h-9 sm:h-10 text-sm"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-destructive">{errors.name}</p>
                <p className="text-xs text-muted-foreground">{formData.name.length}/{MAX_NAME_LEN}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs sm:text-sm font-medium">
                  Organization Type *
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as OrganizationCreateData['type'])}>
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="INSTITUTE">Institute</SelectItem>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentKey" className="text-xs sm:text-sm font-medium">
                  Enrollment Key {formData.type === 'INSTITUTE' ? '*' : '(Optional)'}
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
                  disabled={formData.type !== 'INSTITUTE'}
                  aria-invalid={!!errors.enrollmentKey}
                  className="h-9 sm:h-10 text-sm"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-destructive">{errors.enrollmentKey}</p>
                  {formData.type === 'INSTITUTE' && (
                    <p className="text-xs text-muted-foreground">{formData.enrollmentKey.length}/{MAX_KEY_LEN}</p>
                  )}
                </div>
              </div>
            </div>

            {instituteId ? (
              <div className="space-y-2">
                <Label htmlFor="instituteId" className="text-xs sm:text-sm font-medium">
                  Institute
                </Label>
                <Input
                  id="instituteId"
                  value={instituteName || instituteId}
                  disabled
                  className="bg-muted/50 cursor-not-allowed h-9 sm:h-10 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Organization will be created for this institute
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="instituteId" className="text-xs sm:text-sm font-medium">
                  Institute ID (Optional for GLOBAL type)
                </Label>
                <Input
                  id="instituteId"
                  placeholder="Enter institute ID (optional)"
                  value={formData.instituteId}
                  onChange={(e) => handleInputChange('instituteId', e.target.value)}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image" className="text-xs sm:text-sm font-medium">
                Organization Image (Optional)
              </Label>
              {!imagePreview ? (
                <>
                  <label 
                    htmlFor="image" 
                    onDragOver={handleDropZoneDragOver}
                    onDragLeave={handleDropZoneLeave}
                    onDrop={handleDropZoneDrop}
                    className={`flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-muted/20 ${isDragging ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG or WEBP (Max 5MB)
                      </p>
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {errors.image && <p className="text-xs text-destructive mt-1">{errors.image}</p>}
                </>
              ) : (
                <div className="relative w-full h-32 sm:h-40 border-2 border-border rounded-lg overflow-hidden bg-muted/20">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                   <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8"
                    onClick={removeImage}
                    aria-label="Remove selected image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4 pt-2 border-t">
              <div className="flex items-start sm:items-center justify-between gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="isPublic" className="text-xs sm:text-sm font-medium cursor-pointer block">
                    Public Organization
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow anyone to view this organization
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  className="shrink-0"
                />
              </div>

              <div className="flex items-start sm:items-center justify-between gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="needEnrollmentVerification" className="text-xs sm:text-sm font-medium cursor-pointer block">
                    Require Enrollment Verification
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    New members need approval before joining
                  </p>
                </div>
                <Switch
                  id="needEnrollmentVerification"
                  checked={formData.needEnrollmentVerification}
                  onCheckedChange={(checked) => handleInputChange('needEnrollmentVerification', checked)}
                  className="shrink-0"
                />
              </div>

              <div className="flex items-start sm:items-center justify-between gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="enabledEnrollments" className="text-xs sm:text-sm font-medium cursor-pointer block">
                    Enable Enrollments
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow new members to request enrollment
                  </p>
                </div>
                <Switch
                  id="enabledEnrollments"
                  checked={formData.enabledEnrollments}
                  onCheckedChange={(checked) => handleInputChange('enabledEnrollments', checked)}
                  className="shrink-0"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="min-w-[100px] h-9 sm:h-10 text-sm"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px] h-9 sm:h-10 text-sm"
              >
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganizationForm;
