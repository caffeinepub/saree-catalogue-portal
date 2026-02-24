import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  images: ExternalBlob[];
  onChange: (images: ExternalBlob[]) => void;
  maxImages?: number;
}

export default function MultiImageUpload({ images, onChange, maxImages = 5 }: MultiImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum is ${maxImages} images.`);
      return;
    }

    const newImages: ExternalBlob[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, [images.length + i]: percentage }));
        });
        
        newImages.push(blob);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    }

    // Clear progress after upload
    setTimeout(() => setUploadProgress({}), 1000);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Image removed');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images uploaded
          {images.length > 0 && <span className="ml-2 text-xs">(First image is the cover)</span>}
        </div>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('multi-image-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        )}
      </div>

      <input
        id="multi-image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById('multi-image-upload')?.click()}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">Click to upload images</p>
          <p className="text-xs text-muted-foreground">Up to {maxImages} images, first image will be the cover</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border">
                <img
                  src={image.getDirectURL()}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">{uploadProgress[index]}%</div>
                  </div>
                )}
              </div>
              
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={() => handleMoveUp(index)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                )}
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={() => handleMoveDown(index)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
