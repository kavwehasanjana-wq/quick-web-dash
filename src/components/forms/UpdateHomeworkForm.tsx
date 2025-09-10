import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl, getApiHeaders } from '@/contexts/utils/auth.api';

interface UpdateHomeworkFormProps {
  homework: any;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateHomeworkForm = ({ homework, onClose, onSuccess }: UpdateHomeworkFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: homework.title || '',
    description: homework.description || '',
    startDate: homework.startDate ? homework.startDate.split('T')[0] : '',
    endDate: homework.endDate ? homework.endDate.split('T')[0] : '',
    referenceLink: homework.referenceLink || '',
    isActive: homework.isActive ?? true
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        referenceLink: formData.referenceLink || null,
        isActive: formData.isActive
      };

      const baseUrl = getBaseUrl();
      const response = await fetch(
        `${baseUrl}/institute-class-subject-homeworks/${homework.id}`,
        {
          method: 'PATCH',
          headers: getApiHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Homework updated successfully"
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update homework');
      }
    } catch (error) {
      console.error('Error updating homework:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update homework",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter homework title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter homework description"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="referenceLink">Reference Link</Label>
        <Input
          id="referenceLink"
          value={formData.referenceLink}
          onChange={(e) => handleInputChange('referenceLink', e.target.value)}
          placeholder="Enter reference link (optional)"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Updating...' : 'Update Homework'}
        </Button>
      </div>
    </form>
  );
};

export default UpdateHomeworkForm;
