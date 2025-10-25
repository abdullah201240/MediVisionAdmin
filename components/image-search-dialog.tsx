'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, X, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { medicinesApi } from '@/lib/api';

interface ImageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchComplete: (results: any[]) => void;
  onViewMedicine?: (medicineId: string) => void;
}

export function ImageSearchDialog({ open, onOpenChange, onSearchComplete, onViewMedicine }: ImageSearchDialogProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Clear state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast({
        title: 'No Image',
        description: 'Please select an image to search',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Use the medicinesApi with cache-busting
      const results = await medicinesApi.searchByImage(formData);
      
      toast({
        title: 'Search Complete',
        description: `Found ${results.length} matching medicine(s)`,
      });

      onSearchComplete(results);
      onOpenChange(false);
      handleRemoveImage();
    } catch (error: any) {
      console.error('Image search error:', error);
      toast({
        title: 'Search Failed',
        description: error.response?.data?.message || 'Failed to search by image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Search className="h-6 w-6 text-blue-600" />
            Search Medicine by Image
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="search-image" className="text-base font-semibold">
                Upload Medicine Image
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="search-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full h-12 text-base"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="whitespace-nowrap"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Browse
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                JPG, PNG, GIF, WEBP, JFIF • Max 5MB • Best results with clear medicine packaging photos
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative">
                <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Selected medicine"
                    className="w-full h-80 object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 h-10 w-10 p-0 shadow-lg"
                  onClick={handleRemoveImage}
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-3 left-3 bg-black/80 text-white text-sm px-3 py-2 rounded-lg max-w-[80%] truncate">
                  {selectedImage?.name}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
                <ImageIcon className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                <p className="text-base text-gray-500 font-medium">No image selected</p>
                <p className="text-sm text-gray-400 mt-2">Upload a clear photo of medicine packaging</p>
              </div>
            )}

            {/* Search Tips */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Tips for Best Results:
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Use clear, well-lit photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Show medicine packaging or label</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Avoid blurry or dark images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Center the medicine in the frame</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              handleRemoveImage();
            }}
            disabled={isSearching}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!selectedImage || isSearching}
            size="lg"
            className="flex items-center gap-2 min-w-[160px] bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Search Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
