'use client';

import { useEffect, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { medicinesApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Upload, X, Image as ImageIcon } from 'lucide-react';

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
  const { toast } = useToast();

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

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await medicinesApi.getAll();
      setMedicines(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch medicines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          title: 'Success',
          description: 'Medicine updated successfully',
        });
      } else {
        await medicinesApi.create(formDataToSend);
        toast({
          title: 'Success',
          description: 'Medicine created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchMedicines();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await medicinesApi.delete(id);
      toast({
        title: 'Success',
        description: 'Medicine deleted successfully',
      });
      fetchMedicines();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete medicine',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (medicine: Medicine) => {
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
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validImages = fileArray.filter(file => file.type.startsWith('image/'));

    if (validImages.length !== fileArray.length) {
      toast({
        title: 'Warning',
        description: 'Some files were not images and were skipped',
        variant: 'destructive',
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
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
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
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {filteredMedicines.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No medicines found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.brand || '-'}</TableCell>
                      <TableCell>{medicine.origin || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {medicine.details}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(medicine)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(medicine.id)}
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
                    <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (Max 5MB each)</p>
                  </div>

                  {/* Image Preview */}
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreview.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500">No images uploaded</p>
                      <p className="text-xs text-gray-400 mt-1">Click Browse or drag images here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 pt-4 border-t sticky bottom-0 bg-background">
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </>
                ) : (
                  editingMedicine ? 'Update Medicine' : 'Create Medicine'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
