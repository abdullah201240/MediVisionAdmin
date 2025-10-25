'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Pill, 
  Calendar, 
  MapPin, 
  Package, 
  FileText,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MedicineDetailsModalProps {
  medicine: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicineDetailsModal({ medicine, open, onOpenChange }: MedicineDetailsModalProps) {
  const router = useRouter();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!imageViewerOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        previousImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        setImageViewerOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageViewerOpen, medicine?.images]);

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  const nextImage = () => {
    if (medicine?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % medicine.images.length);
    }
  };

  const previousImage = () => {
    if (medicine?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? medicine.images.length - 1 : prev - 1
      );
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const handleViewFullDetails = () => {
    onOpenChange(false);
    router.push(`/dashboard/medicines/${medicine.id}`);
  };

  if (!medicine) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-6 w-6 text-blue-600" />
                Medicine Details
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFullDetails}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Full Details
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid gap-6 lg:grid-cols-3 py-4">
              {/* Left Column - Images */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Images ({medicine.images?.length || 0})
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Click any image to view full size
                    </p>
                  </div>
                  
                  {medicine.images && medicine.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {medicine.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
                          onClick={() => openImageViewer(index)}
                        >
                          <img
                            src={`http://localhost:3000/uploads/medicines/${image}`}
                            alt={`${medicine.name} - Image ${index + 1}`}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-2">
                                <ImageIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <Pill className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500">No images available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Basic Information
                    </h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* English Name */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Name (English)</label>
                      <p className="text-lg font-medium text-gray-900 mt-1">{medicine.name}</p>
                    </div>
                    
                    {/* Bengali Name */}
                    {medicine.nameBn && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Name (বাংলা)</label>
                        <p className="text-lg font-medium text-gray-900 mt-1">{medicine.nameBn}</p>
                      </div>
                    )}

                    {/* English Brand */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Brand (English)</label>
                      <p className="text-lg font-medium text-gray-900 mt-1">{medicine.brand || '-'}</p>
                    </div>

                    {/* Bengali Brand */}
                    {medicine.brandBn && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Brand (বাংলা)</label>
                        <p className="text-lg font-medium text-gray-900 mt-1">{medicine.brandBn}</p>
                      </div>
                    )}

                    {/* Type */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Type</label>
                      <div className="mt-1">
                        <div className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 text-sm px-3 py-1">
                          {medicine.type || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    {/* Origin */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Origin
                      </label>
                      <p className="text-lg font-medium text-gray-900 mt-1">{medicine.origin || '-'}</p>
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Dosage
                      </label>
                      <p className="text-lg font-medium text-gray-900 mt-1">{medicine.dosage || '-'}</p>
                    </div>

                    {/* Created Date */}
                    <div>
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Added On
                      </label>
                      <p className="text-sm text-gray-700 mt-1">{formatDate(medicine.createdAt)}</p>
                    </div>
                    
                    {/* Similarity Score */}
                    {medicine.similarity && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Match Confidence</label>
                        <div className="mt-1">
                          <div className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-sm px-3 py-1">
                            {medicine.confidence || `${(medicine.similarity * 100).toFixed(2)}%`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details/Description */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Details & Description
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* English Details */}
                    {medicine.details && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Details (English)</label>
                        <p className="text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                          {medicine.details}
                        </p>
                      </div>
                    )}

                    {/* Bengali Details */}
                    {medicine.detailsBn && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="text-sm font-semibold text-gray-600">Details (বাংলা)</label>
                        <p className="text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                          {medicine.detailsBn}
                        </p>
                      </div>
                    )}

                    {!medicine.details && !medicine.detailsBn && (
                      <p className="text-gray-500 italic">No detailed information available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Modal */}
      {imageViewerOpen && medicine.images && medicine.images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setImageViewerOpen(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={previousImage}
            className="absolute left-4 text-white hover:bg-white/20 rounded-full p-3 transition-colors"
            disabled={medicine.images.length <= 1}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={`http://localhost:3000/uploads/medicines/${medicine.images[currentImageIndex]}`}
              alt={`${medicine.name} - Image ${currentImageIndex + 1}`}
              className="max-h-[80vh] object-contain"
            />
            <div className="text-white text-center mt-4">
              <p className="text-lg font-semibold">{medicine.name}</p>
              <p className="text-sm text-gray-300">
                Image {currentImageIndex + 1} of {medicine.images.length}
              </p>
            </div>

            {medicine.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4">
                {medicine.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-blue-500 scale-110'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={`http://localhost:3000/uploads/medicines/${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:bg-white/20 rounded-full p-3 transition-colors"
            disabled={medicine.images.length <= 1}
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </div>
      )}
    </>
  );
}
