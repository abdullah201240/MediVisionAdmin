'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  X
} from 'lucide-react';
import { medicinesApi } from '@/lib/api';

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;
  
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const data = await medicinesApi.getById(medicineId);
        setMedicine(data);
      } catch (error) {
        console.error('Error fetching medicine:', error);
      } finally {
        setLoading(false);
      }
    };

    if (medicineId) {
      fetchMedicine();
    }
  }, [medicineId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Medicine not found</p>
        <Button
          onClick={() => router.push('/dashboard/medicines')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Medicines
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/medicines')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Medicine Details</h2>
            <p className="text-muted-foreground mt-1">
              Complete information about this medicine
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Images */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images ({medicine.images?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <Pill className="h-16 w-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {medicine.type || 'Not specified'}
                    </Badge>
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
              </div>
            </CardContent>
          </Card>

          {/* Details/Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Details & Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  );
}
