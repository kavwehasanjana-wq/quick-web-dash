import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Crop } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface SubjectImageUploadProps {
  value?: string;
  onChange: (imageUrl: string, file: File) => void;
  onRemove?: () => void;
}

const SubjectImageUpload: React.FC<SubjectImageUploadProps> = ({ value, onChange, onRemove }) => {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [crop, setCrop] = useState<CropType>({ unit: '%', width: 90, x: 5, y: 5, height: 50.625 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
      const croppedUrl = URL.createObjectURL(blob);
      setPreviewUrl(croppedUrl);
      onChange(croppedUrl, croppedFile);
      setShowCropDialog(false);
      setImageToCrop('');
    }, selectedFile.type);
  };

  const handleRemove = () => {
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {previewUrl ? 'Change Image' : 'Upload Image'}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {previewUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
          <img
            src={previewUrl}
            alt="Subject preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Subject Image (16:9)</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            {imageToCrop && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16 / 9}
              >
                <img
                  ref={imgRef}
                  src={imageToCrop}
                  alt="Crop preview"
                  style={{ maxHeight: '60vh' }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropComplete}>
              <Crop className="h-4 w-4 mr-2" />
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectImageUpload;
