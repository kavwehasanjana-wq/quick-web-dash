import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface CreateHomeworkFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateHomeworkForm = ({ onClose, onSuccess }: CreateHomeworkFormProps) => {
  const { user, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has permission to create homework - InstituteAdmin and Teachers
  const canCreate = user?.role === 'InstituteAdmin' || user?.role === 'Teacher';

  // Handle access denial in useEffect to avoid side effects during render
  React.useEffect(() => {
    if (!canCreate) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create homework. This feature is only available for Institute Admins and Teachers.",
        variant: "destructive"
      });
      onClose();
    }
  }, [canCreate]);

  if (!canCreate) {
    return null;
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    referenceLink: '',
    isActive: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentInstituteId || !currentClassId || !currentSubjectId) {
      toast({
        title: "Missing Selection",
        description: "Please select institute, class, and subject first.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const homeworkData = {
        instituteId: currentInstituteId,
        classId: currentClassId,
        subjectId: currentSubjectId,
        teacherId: user.id,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        referenceLink: formData.referenceLink || null,
        isActive: formData.isActive
      };

      console.log('Creating homework with data:', homeworkData);
      
      const response = await apiClient.post('/institute-class-subject-homeworks', homeworkData);
      
      console.log('Homework created successfully:', response.data);
      
      toast({
        title: "Homework Created",
        description: `Homework "${formData.title}" has been created successfully.`
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating homework:', error);
      toast({
        title: "Creation Failed",
        description: error?.response?.data?.message || "Failed to create homework.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Homework Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter homework title"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter homework description"
                  rows={4}
                  className="mt-1 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="referenceLink" className="text-sm font-medium">Reference Link</Label>
                <Input
                  id="referenceLink"
                  type="url"
                  value={formData.referenceLink}
                  onChange={(e) => handleInputChange('referenceLink', e.target.value)}
                  placeholder="https://example.com/homework-material"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Creating...' : 'Create Homework'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHomeworkForm;