import { useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { File, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface ImageInputModalProps {
  description?: string;
  open: boolean;
  setOpen: (val: boolean) => void;
  onConfirm?: (file: File) => void;
  isProcessing?: boolean;
}

export function ImageInputModal({
  open,
  setOpen,
  description,
  isProcessing,
  onConfirm,
}: ImageInputModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onConfirm?.(selectedFile);
      handleReset();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFilePreview = () => {
    if (!selectedFile) return null;

    const isImage = selectedFile.type.startsWith("image/");
    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);

    return (
      <div className="space-y-4">
        {isImage ? (
          <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
              alt={selectedFile.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <File className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">File Ready</p>
            </div>
          </div>
        )}

        {/* File details */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-foreground text-sm wrap-break-word">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Size: {sizeInMB} MB
              </p>
            </div>
            <button
              onClick={() => handleReset()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Upload Invoice/Receipt
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        {selectedFile ? (
          <div className="space-y-4">{getFilePreview()}</div>
        ) : (
          <div className="space-y-4">
            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {/* Drag and drop area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-foreground mb-1">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                or click to browse
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              className="border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex-1"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            isLoading={isProcessing}
            disabled={!selectedFile}
            onClick={handleUpload}
            className="bg-green-600 hover:bg-green-700 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black flex-1"
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
