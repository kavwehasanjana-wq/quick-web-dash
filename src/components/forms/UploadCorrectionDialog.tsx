import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { Upload, X } from 'lucide-react';

interface UploadCorrectionDialogProps {
  submissionId: string;
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadCorrectionDialog = ({ 
  submissionId, 
  studentName, 
  isOpen, 
  onClose, 
  onSuccess 
}: UploadCorrectionDialogProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/institute-class-subject-homework-submissions/${submissionId}/correction-file`,
        formData
      );

      toast({
        title: "Success",
        description: "Correction file uploaded successfully",
      });

      onSuccess();
      onClose();
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading correction file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload correction file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Correction File
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload correction file for <strong>{studentName}</strong>'s submission
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correction-file">Correction File</Label>
            <Input
              id="correction-file"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Selected: {file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Correction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadCorrectionDialog;