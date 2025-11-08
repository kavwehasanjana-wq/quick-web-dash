import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactCrop, { 
  type Crop, 
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ClassImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpdate: (newImageUrl: string, file?: File) => void;
  className?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ClassImageUpload: React.FC<ClassImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate,
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(file);
      setOpen(true);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16/9));
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;

      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();

      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      );

      ctx.restore();

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        }, 'image/png');
      });
    },
    [],
  );

  const handleUpload = async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsUploading(true);
    
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create a temporary URL for the cropped image
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      
      // Convert blob to File object for upload
      const croppedFile = new File([croppedImageBlob], 'class-image.png', {
        type: 'image/png',
        lastModified: Date.now()
      });
      
      onImageUpdate(croppedImageUrl, croppedFile);
      
      toast({
        title: "Success",
        description: "Class image updated successfully!",
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = '';
    }
  };

  const handleChangePhoto = () => {
    hiddenFileInput.current?.click();
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Image Display Area */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Class image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-2" />
              <p className="text-sm">No image uploaded</p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="button"
            onClick={handleChangePhoto}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            {currentImageUrl ? 'Change Image' : 'Upload Image'}
          </Button>
          
          {currentImageUrl && (
            <Button 
              type="button"
              variant="outline"
              onClick={() => onImageUpdate('')}
              className="w-full sm:w-auto"
            >
              Remove Image
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={hiddenFileInput}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Class Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imgSrc && (
              <div className="max-h-96 overflow-hidden rounded-lg">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={16/9}
                  minWidth={100}
                  minHeight={100}
                  circularCrop={false}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{ transform: 'scale(1) rotate(0deg)' }}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!completedCrop || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassImageUpload;
