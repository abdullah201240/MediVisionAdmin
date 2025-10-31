'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { medicinesApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  nameBn?: string;
  brand?: string;
  brandBn?: string;
  details: string;
  detailsBn?: string;
  origin?: string;
  originBn?: string;
  sideEffects?: string;
  sideEffectsBn?: string;
  usage?: string;
  usageBn?: string;
  howToUse?: string;
  howToUseBn?: string;
  images?: string[];
  createdAt: string;
}

interface Medicine {
  id: string;
  name: string;
  nameBn?: string;
  brand?: string;
  brandBn?: string;
  details: string;
  detailsBn?: string;
  origin?: string;
  originBn?: string;
  sideEffects?: string;
  sideEffectsBn?: string;
  usage?: string;
  usageBn?: string;
  howToUse?: string;
  howToUseBn?: string;
  images?: string[];
  createdAt: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    brand: '',
    brandBn: '',
    details: '',
    detailsBn: '',
    origin: '',
    originBn: '',
    sideEffects: '',
    sideEffectsBn: '',
    usage: '',
    usageBn: '',
    howToUse: '',
    howToUseBn: '',
  });
  
  // Get search params from URL
  const searchParams = useSearchParams();
  
  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  const { toast } = useToast();

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      nameBn: '',
      brand: '',
      brandBn: '',
      details: '',
      detailsBn: '',
      origin: '',
      originBn: '',
      sideEffects: '',
      sideEffectsBn: '',
      usage: '',
      usageBn: '',
      howToUse: '',
      howToUseBn: '',
    });
    setSelectedImages([]);
    setImagePreview([]);
    setEditingMedicine(null);
  }, []);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await medicinesApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
      });
      
      // Check if response is paginated
      if (response.data && Array.isArray(response.data)) {
        setMedicines(response.data);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated response
        setMedicines(response);
        setTotalItems(response.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      toast({
        title: 'Medicine Fetch Failed',
        description: 'Failed to fetch medicines. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder, toast]);

  // Set initial search term from URL params
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Image viewer navigation functions
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % viewerImages.length);
  }, [viewerImages.length]);

  const previousImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);
  }, [viewerImages.length]);

  // Keyboard navigation for image viewer
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
  }, [imageViewerOpen, currentImageIndex, viewerImages.length, previousImage, nextImage]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Append images
      selectedImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      if (editingMedicine) {
        await medicinesApi.update(editingMedicine.id, formDataToSend);
        toast({
          title: 'Medicine Updated',
          description: 'Medicine information has been successfully updated.',
          variant: 'success',
        });
      } else {
        await medicinesApi.create(formDataToSend);
        toast({
          title: 'Medicine Created',
          description: 'New medicine has been successfully added to the database.',
          variant: 'success',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchMedicines();
    } catch (error) {
      console.error('Operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete the operation. Please try again.';
      toast({
        title: 'Operation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [editingMedicine, fetchMedicines, formData, resetForm, selectedImages, toast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await medicinesApi.delete(id);
      toast({
        title: 'Medicine Deleted',
        description: 'Medicine has been successfully removed from the database.',
        variant: 'success',
      });
      fetchMedicines();
    } catch (error) {
      console.error('Failed to delete medicine:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete medicine. Please try again.',
        variant: 'destructive',
      });
    }
  }, [fetchMedicines, toast]);

  const handleEdit = useCallback((medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      nameBn: medicine.nameBn || '',
      brand: medicine.brand || '',
      brandBn: medicine.brandBn || '',
      details: medicine.details,
      detailsBn: medicine.detailsBn || '',
      origin: medicine.origin || '',
      originBn: medicine.originBn || '',
      sideEffects: medicine.sideEffects || '',
      sideEffectsBn: medicine.sideEffectsBn || '',
      usage: medicine.usage || '',
      usageBn: medicine.usageBn || '',
      howToUse: medicine.howToUse || '',
      howToUseBn: medicine.howToUseBn || '',
    });
    // Set existing images for preview if available
    if (medicine.images && medicine.images.length > 0) {
      setImagePreview(medicine.images.map(img => `http://localhost:3000/uploads/medicines/${img}`));
    }
    setDialogOpen(true);
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validImages = fileArray.filter(file => file.type.startsWith('image/'));

    if (validImages.length !== fileArray.length) {
      toast({
        title: 'Invalid Files',
        description: 'Some files were not images and were skipped.',
        variant: 'warning',
      });
    }

    setSelectedImages(prev => [...prev, ...validImages]);

    // Create preview URLs
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [toast]);

  const removeImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  }, []);

  const openImageViewer = useCallback((images: string[], index: number = 0) => {
    setViewerImages(images);
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      // Toggle sort order
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // New field, default to ASC
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1); // Reset to first page
  }, [sortBy, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  }, []);

  const getSortIcon = useCallback((field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
    );
  }, [sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Medicines</h2>
          <p className="text-muted-foreground mt-2">
            Manage medicine database
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* Search and Filters Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px] max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort medicines by"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="brand">Brand</option>
                  <option value="origin">Origin</option>
                </select>
              </div>
              
              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2"
                title={`Sort ${sortOrder === 'ASC' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'ASC' ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Ascending</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Descending</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="font-medium">Total: {totalItems} medicines</span>
                <span className="text-gray-400">|</span>
                <span>Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}</span>
              </div>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Items per page"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Images</TableHead>
                    <TableHead className="min-w-[150px]">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center hover:text-blue-600 font-medium"
                      >
                        Name
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <button
                        onClick={() => handleSort('brand')}
                        className="flex items-center hover:text-blue-600 font-medium"
                      >
                        Brand
                        {getSortIcon('brand')}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <button
                        onClick={() => handleSort('origin')}
                        className="flex items-center hover:text-blue-600 font-medium"
                      >
                        Origin
                        {getSortIcon('origin')}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[200px]">Details</TableHead>
                    <TableHead className="min-w-[150px]">Usage</TableHead>
                    <TableHead className="min-w-[150px]">How to Use</TableHead>
                    <TableHead className="min-w-[150px]">Side Effects</TableHead>
                    <TableHead className="text-right w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No medicines found
                      </TableCell>
                    </TableRow>
                  ) : (
                    medicines.map((medicine) => (
                      <TableRow key={medicine.id} className="hover:bg-gray-50">
                        {/* Images */}
                        <TableCell>
                          <div className="flex gap-2 flex-wrap max-w-[200px]">
                            {medicine.images && medicine.images.length > 0 ? (
                              medicine.images.map((image, idx) => (
                                <div
                                  key={idx}
                                  className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                                  onClick={() => {
                                    const imageUrls = medicine.images!.map(
                                      img => `http://localhost:3000/uploads/medicines/${img}`
                                    );
                                    openImageViewer(imageUrls, idx);
                                  }}
                                  title="Click to view full size"
                                >
                                  <Image
                                    src={`http://localhost:3000/uploads/medicines/${image}`}
                                    alt={`${medicine.name} - Image ${idx + 1}`}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                    unoptimized={true}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Name (English & Bengali) */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">{medicine.name}</div>
                            {medicine.nameBn && (
                              <div className="text-sm text-gray-600">{medicine.nameBn}</div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Brand (English & Bengali) */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-gray-900">{medicine.brand || '-'}</div>
                            {medicine.brandBn && (
                              <div className="text-sm text-gray-600">{medicine.brandBn}</div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Origin (English & Bengali) */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">{medicine.origin || '-'}</div>
                            {medicine.originBn && (
                              <div className="text-xs text-gray-600">{medicine.originBn}</div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Details */}
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-900 line-clamp-2">{medicine.details}</div>
                            {medicine.detailsBn && (
                              <div className="text-xs text-gray-600 line-clamp-2 mt-1">{medicine.detailsBn}</div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Usage */}
                        <TableCell>
                          <div className="max-w-xs">
                            {medicine.usage ? (
                              <>
                                <div className="text-sm text-gray-900 line-clamp-2">{medicine.usage}</div>
                                {medicine.usageBn && (
                                  <div className="text-xs text-gray-600 line-clamp-2 mt-1">{medicine.usageBn}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* How to Use */}
                        <TableCell>
                          <div className="max-w-xs">
                            {medicine.howToUse ? (
                              <>
                                <div className="text-sm text-gray-900 line-clamp-2">{medicine.howToUse}</div>
                                {medicine.howToUseBn && (
                                  <div className="text-xs text-gray-600 line-clamp-2 mt-1">{medicine.howToUseBn}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Side Effects */}
                        <TableCell>
                          <div className="max-w-xs">
                            {medicine.sideEffects ? (
                              <>
                                <div className="text-sm text-gray-900 line-clamp-2">{medicine.sideEffects}</div>
                                {medicine.sideEffectsBn && (
                                  <div className="text-xs text-gray-600 line-clamp-2 mt-1">{medicine.sideEffectsBn}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(medicine)}
                              title="Edit Medicine"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(medicine.id)}
                              title="Delete Medicine"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="space-y-6 pr-2">
              {/* Name Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Medicine Name</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name (English) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter medicine name in English"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameBn" className="text-sm font-medium">
                      Name (বাংলা)
                    </Label>
                    <Input
                      id="nameBn"
                      placeholder="ওষুধের নাম বাংলায় লিখুন"
                      value={formData.nameBn}
                      onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Brand Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium">
                      Brand (English)
                    </Label>
                    <Input
                      id="brand"
                      placeholder="Enter brand name in English"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandBn" className="text-sm font-medium">
                      Brand (বাংলা)
                    </Label>
                    <Input
                      id="brandBn"
                      placeholder="ব্র্যান্ডের নাম বাংলায় লিখুন"
                      value={formData.brandBn}
                      onChange={(e) => setFormData({ ...formData, brandBn: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Origin Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Origin/Manufacturer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-sm font-medium">
                      Origin (English)
                    </Label>
                    <Input
                      id="origin"
                      placeholder="Enter origin/manufacturer in English"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originBn" className="text-sm font-medium">
                      Origin (বাংলা)
                    </Label>
                    <Input
                      id="originBn"
                      placeholder="উৎপত্তি/প্রস্তুতকারক বাংলায় লিখুন"
                      value={formData.originBn}
                      onChange={(e) => setFormData({ ...formData, originBn: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Details Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Medicine Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details" className="text-sm font-medium">
                      Details (English) <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="details"
                      placeholder="Enter medicine details in English"
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      required
                      rows={4}
                      className="w-full resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detailsBn" className="text-sm font-medium">
                      Details (বাংলা)
                    </Label>
                    <Textarea
                      id="detailsBn"
                      placeholder="ওষুধের বিবরণ বাংলায় লিখুন"
                      value={formData.detailsBn}
                      onChange={(e) => setFormData({ ...formData, detailsBn: e.target.value })}
                      rows={4}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Usage Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usage" className="text-sm font-medium">
                      Usage (English)
                    </Label>
                    <Textarea
                      id="usage"
                      placeholder="What is this medicine used for?"
                      value={formData.usage}
                      onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageBn" className="text-sm font-medium">
                      Usage (বাংলা)
                    </Label>
                    <Textarea
                      id="usageBn"
                      placeholder="এই ওষুধ কি জন্য ব্যবহার করা হয়?"
                      value={formData.usageBn}
                      onChange={(e) => setFormData({ ...formData, usageBn: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* How to Use Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">How to Use</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="howToUse" className="text-sm font-medium">
                      How to Use (English)
                    </Label>
                    <Textarea
                      id="howToUse"
                      placeholder="Dosage and instructions"
                      value={formData.howToUse}
                      onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="howToUseBn" className="text-sm font-medium">
                      How to Use (বাংলা)
                    </Label>
                    <Textarea
                      id="howToUseBn"
                      placeholder="ডোজ এবং নির্দেশাবলী"
                      value={formData.howToUseBn}
                      onChange={(e) => setFormData({ ...formData, howToUseBn: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Side Effects Section */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Side Effects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sideEffects" className="text-sm font-medium">
                      Side Effects (English)
                    </Label>
                    <Textarea
                      id="sideEffects"
                      placeholder="Possible side effects and warnings"
                      value={formData.sideEffects}
                      onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sideEffectsBn" className="text-sm font-medium">
                      Side Effects (বাংলা)
                    </Label>
                    <Textarea
                      id="sideEffectsBn"
                      placeholder="সম্ভাব্য পার্শ্বপ্রতিক্রিয়া এবং সতর্কতা"
                      value={formData.sideEffectsBn}
                      onChange={(e) => setFormData({ ...formData, sideEffectsBn: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Medicine Images</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="images" className="text-sm font-medium">
                      Upload Images
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('images')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreview.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preview</Label>
                      <div className="flex gap-2 flex-wrap">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-lg object-cover border"
                              unoptimized={true}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingMedicine ? 'Update Medicine' : 'Save Medicine'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-4xl max-h-4xl flex items-center justify-center">
            <button
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              aria-label="Close image viewer"
            >
              <X className="h-6 w-6" />
            </button>
            
            <button
              onClick={previousImage}
              className="absolute left-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              disabled={viewerImages.length <= 1}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              disabled={viewerImages.length <= 1}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            <Image
              src={viewerImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              unoptimized={true}
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-3 py-1 text-sm">
              {currentImageIndex + 1} / {viewerImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
