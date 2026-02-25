import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { ExternalBlob } from "../backend";

interface LogoUploadProps {
  currentLogo?: ExternalBlob | null;
  onLogoChange: (logo: ExternalBlob | null) => void;
}

export default function LogoUpload({ currentLogo, onLogoChange }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentLogo prop changes (e.g., after fetching saved profile)
  useEffect(() => {
    if (currentLogo) {
      setPreview(currentLogo.getDirectURL());
    } else {
      setPreview(null);
    }
  }, [currentLogo]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => setUploadProgress(percentage)
      );

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      onLogoChange(blob);
    } catch (error) {
      console.error("Failed to process logo:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-24 h-24">
          <img
            src={preview}
            alt="Logo preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center px-1">Upload Logo</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-3 w-3" />
              Choose Logo
            </>
          )}
        </Button>
      )}
    </div>
  );
}
