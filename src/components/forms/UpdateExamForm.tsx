import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getBaseUrl, getApiHeaders } from '../../contexts/utils/auth.api';

interface UpdateExamFormProps {
  exam: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateExamForm: React.FC<UpdateExamFormProps> = ({ exam, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Check if user has permission to update exams - InstituteAdmin and Teachers
  const canUpdate = user?.role === 'InstituteAdmin' || user?.role === 'Teacher';
  
  useEffect(() => {
    if (!canUpdate) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update exams. This feature is only available for Institute Admins and Teachers.",
        variant: "destructive",
      });
      onClose();
    }
  }, [canUpdate]);

  if (!canUpdate) {
    return null;
  }
  
  const [formData, setFormData] = useState({
    title: exam.title || '',
    description: exam.description || '',
    examType: exam.examType || 'online',
    duration: exam.durationMinutes || 60,
    maxMarks: exam.totalMarks || 100,
    passingMarks: exam.passingMarks || 40,
    examDate: exam.scheduleDate ? exam.scheduleDate.split('T')[0] : '',
    startTime: exam.startTime ? new Date(exam.startTime).toTimeString().slice(0, 8) : '09:00:00',
    endTime: exam.endTime ? new Date(exam.endTime).toTimeString().slice(0, 8) : '10:00:00',
    venue: exam.venue || '',
    examLink: exam.examLink || '',
    instructions: exam.instructions || '',
    status: exam.status || 'draft',
    createdBy: exam.createdBy || '',
    toWhom: exam.toWhom || 'everyone',
    isActive: exam.isActive !== undefined ? exam.isActive : true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canUpdate) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update exams.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        examType: formData.examType,
        duration: parseInt(formData.duration.toString()),
        maxMarks: parseInt(formData.maxMarks.toString()),
        passingMarks: parseInt(formData.passingMarks.toString()),
        examDate: formData.examDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue || null,
        examLink: formData.examLink || null,
        instructions: formData.instructions || null,
        status: formData.status,
        createdBy: formData.createdBy,
        toWhom: formData.toWhom,
        isActive: formData.isActive
      };

      const response = await fetch(`${getBaseUrl()}/institute-class-subject-exams/${exam.id}`, {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Exam updated successfully:', result);

      toast({
        title: "Success",
        description: "Exam updated successfully!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exam title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examType">Exam Type *</Label>
              <Select value={formData.examType} onValueChange={(value) => handleInputChange('examType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                placeholder="Enter duration in minutes"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMarks">Total Marks *</Label>
              <Input
                id="maxMarks"
                type="number"
                value={formData.maxMarks}
                onChange={(e) => handleInputChange('maxMarks', parseInt(e.target.value))}
                placeholder="Enter total marks"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingMarks">Passing Marks *</Label>
              <Input
                id="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value))}
                placeholder="Enter passing marks"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date *</Label>
              <Input
                id="examDate"
                type="date"
                value={formData.examDate}
                onChange={(e) => handleInputChange('examDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Enter exam venue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examLink">Exam Link</Label>
              <Input
                id="examLink"
                type="url"
                value={formData.examLink}
                onChange={(e) => handleInputChange('examLink', e.target.value)}
                placeholder="Enter exam link (for online exams)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toWhom">To Whom *</Label>
              <Select value={formData.toWhom} onValueChange={(value) => handleInputChange('toWhom', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="specific">Specific Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter exam description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="Enter exam instructions"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Exam'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};