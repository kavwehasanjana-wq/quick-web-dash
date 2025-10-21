import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface Document {
  name: string;
  url: string;
}

interface Lecture {
  _id: string;
  subjectId: string;
  grade: number;
  title: string;
  description: string;
  lessonNumber: number;
  lectureNumber: number;
  provider: string;
  lectureLink: string;
  documents: Array<{
    documentName: string;
    documentUrl: string;
    _id: string;
  }>;
  isActive: boolean;
}

interface CreateEditLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lecture?: Lecture | null;
}

export default function CreateEditLectureModal({
  isOpen,
  onClose,
  onSuccess,
  lecture = null,
}: CreateEditLectureModalProps) {
  const [formData, setFormData] = useState({
    subjectId: '',
    grade: 10,
    title: '',
    description: '',
    lessonNumber: 1,
    lectureNumber: 1,
    provider: '',
    lectureLink: '',
    isActive: true,
  });
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!lecture;

  useEffect(() => {
    if (lecture) {
      setFormData({
        subjectId: lecture.subjectId,
        grade: lecture.grade,
        title: lecture.title,
        description: lecture.description,
        lessonNumber: lecture.lessonNumber,
        lectureNumber: lecture.lectureNumber,
        provider: lecture.provider,
        lectureLink: lecture.lectureLink,
        isActive: lecture.isActive,
      });
      
      setDocuments(
        lecture.documents.map(doc => ({
          name: doc.documentName,
          url: doc.documentUrl,
        }))
      );
    } else {
      setFormData({
        subjectId: '',
        grade: 10,
        title: '',
        description: '',
        lessonNumber: 1,
        lectureNumber: 1,
        provider: '',
        lectureLink: '',
        isActive: true,
      });
      setDocuments([]);
    }
  }, [lecture, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addDocument = () => {
    setDocuments(prev => [...prev, { name: '', url: '' }]);
  };

  const updateDocument = (index: number, field: 'name' | 'url', value: string) => {
    setDocuments(prev =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.provider || (!isEditing && !formData.subjectId)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const lectureData = {
        ...formData,
        documents: documents.filter(doc => doc.name && doc.url),
      };

      if (isEditing && lecture) {
        const { subjectId, ...updateData } = lectureData;
        await ApiService.updateLecture(lecture._id, updateData);
        toast({
          title: "Success",
          description: "Lecture updated successfully!",
        });
      } else {
        await ApiService.createLecture(lectureData);
        toast({
          title: "Success",
          description: "Lecture created successfully!",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving lecture:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} lecture. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Lecture' : 'Create New Lecture'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEditing && (
              <div>
                <Label htmlFor="subjectId" className="text-foreground">Subject ID *</Label>
                <Input
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  placeholder="Enter subject ID"
                  required
                  className="border-border bg-background"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="grade" className="text-foreground">Grade *</Label>
              <Input
                id="grade"
                type="number"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                min="1"
                max="13"
                required
                className="border-border bg-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-foreground">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter lecture title"
              required
              className="border-border bg-background"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter lecture description"
              rows={3}
              className="border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lessonNumber" className="text-foreground">Lesson Number</Label>
              <Input
                id="lessonNumber"
                type="number"
                value={formData.lessonNumber}
                onChange={(e) => handleInputChange('lessonNumber', parseInt(e.target.value))}
                min="1"
                className="border-border bg-background"
              />
            </div>
            
            <div>
              <Label htmlFor="lectureNumber" className="text-foreground">Lecture Number</Label>
              <Input
                id="lectureNumber"
                type="number"
                value={formData.lectureNumber}
                onChange={(e) => handleInputChange('lectureNumber', parseInt(e.target.value))}
                min="1"
                className="border-border bg-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="provider" className="text-foreground">Provider *</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              placeholder="Enter provider name"
              required
              className="border-border bg-background"
            />
          </div>

          <div>
            <Label htmlFor="lectureLink" className="text-foreground">Lecture Link</Label>
            <Input
              id="lectureLink"
              type="url"
              value={formData.lectureLink}
              onChange={(e) => handleInputChange('lectureLink', e.target.value)}
              placeholder="Enter lecture link (e.g., Zoom, Google Meet)"
              className="border-border bg-background"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-foreground">Documents</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDocument}
                className="border-border"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Document
              </Button>
            </div>
            
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Document name"
                      value={doc.name}
                      onChange={(e) => updateDocument(index, 'name', e.target.value)}
                      className="border-border bg-background"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Document URL"
                      value={doc.url}
                      onChange={(e) => updateDocument(index, 'url', e.target.value)}
                      className="border-border bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="border-border"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-foreground">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Lecture' : 'Create Lecture')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}