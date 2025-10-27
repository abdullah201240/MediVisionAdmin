'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  Camera, 
  Upload,
  X,
  Edit3,
  MapPin,
  Briefcase
} from 'lucide-react';
import { authApi } from '@/lib/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  image?: string;
  coverPhoto?: string;
  role: string;
  location?: string;
  bio?: string;
}

export default function ProfilePage() {
  const { user, checkAuth, removeCoverPhoto: removeCoverPhotoFromContext, removeProfileImage: removeProfileImageFromContext } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    image: '',
    coverPhoto: '',
    role: '',
    location: '',
    bio: '',
  });
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const userData: any = user;
    
    let formattedDob = '';
    if (userData.dateOfBirth) {
      try {
        const date = new Date(userData.dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDob = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }
    
    setProfileData({
      id: userData.id || '',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      gender: userData.gender || '',
      dateOfBirth: formattedDob,
      image: userData.image || '',
      coverPhoto: userData.coverPhoto || '',
      role: userData.role || '',
      location: userData.location || '',
      bio: userData.bio || '',
    });
    
    if (userData.image) {
      setProfileImagePreview(`http://localhost:3000/uploads/users/${userData.image}`);
    }
    if (userData.coverPhoto) {
      setCoverPhotoPreview(`http://localhost:3000/uploads/users/${userData.coverPhoto}`);
    }
    
    setLoading(false);
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      uploadCoverPhoto(file);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      uploadProfileImage(file);
    }
  };

  const uploadCoverPhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('coverPhoto', file);
      
      await authApi.updateProfileCover(formData);
      await checkAuth();
      
      toast({
        title: 'Success',
        description: 'Cover photo updated successfully',
      });
    } catch (error: any) {
      console.error('Cover photo upload error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload cover photo',
        variant: 'destructive',
      });
      
      if (profileData.coverPhoto) {
        setCoverPhotoPreview(`http://localhost:3000/uploads/users/${profileData.coverPhoto}`);
      } else {
        setCoverPhotoPreview(null);
      }
    }
  };

  const uploadProfileImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      await authApi.updateProfileImage(formData);
      await checkAuth();
      
      toast({
        title: 'Success',
        description: 'Profile image updated successfully',
      });
    } catch (error: any) {
      console.error('Profile image upload error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload profile image',
        variant: 'destructive',
      });
      
      if (profileData.image) {
        setProfileImagePreview(`http://localhost:3000/uploads/users/${profileData.image}`);
      } else {
        setProfileImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData: any = {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
        location: profileData.location,
        bio: profileData.bio,
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });

      await authApi.updateProfile(updateData);
      await checkAuth();
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const triggerCoverPhotoUpload = () => {
    coverPhotoInputRef.current?.click();
  };

  const triggerProfileImageUpload = () => {
    profileImageInputRef.current?.click();
  };

  const removeCoverPhoto = async () => {
    try {
      await removeCoverPhotoFromContext();
      setCoverPhotoPreview(null);
      toast({
        title: 'Success',
        description: 'Cover photo removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove cover photo',
        variant: 'destructive',
      });
    }
  };

  const removeProfileImage = async () => {
    try {
      await removeProfileImageFromContext();
      setProfileImagePreview(null);
      toast({
        title: 'Success',
        description: 'Profile image removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove profile image',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Enhanced Cover Photo Section */}
      <Card className="relative rounded-2xl overflow-hidden border-0 shadow-xl bg-white">
        {/* Cover Photo Container */}
        <div className="relative h-80 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          {coverPhotoPreview ? (
            <img 
              src={coverPhotoPreview} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium">Add a cover photo</p>
              </div>
            </div>
          )}
          
          {/* Cover Photo Overlay and Actions */}
          <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-all duration-300">
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2 bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg border-0"
                onClick={triggerCoverPhotoUpload}
              >
                <Camera className="h-4 w-4" />
                {coverPhotoPreview ? 'Change Cover' : 'Add Cover'}
              </Button>
              
              {coverPhotoPreview && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-500/95 hover:bg-red-600 backdrop-blur-sm shadow-lg border-0"
                  onClick={removeCoverPhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Header Section */}
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Picture Section */}
            <div className="flex-shrink-0 -mt-24 lg:-mt-32">
              <div className="relative group">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl border-4 border-white bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-600" />
                    </div>
                  )}
                </div>
                
                {/* Profile Image Upload Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 rounded-xl w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-white transition-all duration-200 hover:scale-105"
                  onClick={triggerProfileImageUpload}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                
                {/* Profile Image Remove Button */}
                {profileImagePreview && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-xl w-10 h-10 p-0 bg-red-500 hover:bg-red-600 text-white shadow-lg border-2 border-white transition-all duration-200 hover:scale-105"
                    onClick={removeProfileImage}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Profile Info Section */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                      {profileData.name}
                    </h1>
                    <p className="text-xl text-muted-foreground capitalize mt-1 font-semibold">
                      {profileData.role}
                    </p>
                  </div>
                  
                  {/* Additional Profile Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profileData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>Member since {new Date().getFullYear()}</span>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  {profileData.bio && (
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                      {profileData.bio}
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={() => document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg h-12 px-6 whitespace-nowrap"
                >
                  <Edit3 className="h-5 w-5" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Form */}
      <div id="profile-form">
        <Card className="rounded-2xl border-0 shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
            <p className="text-muted-foreground">Update your personal information and preferences</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={coverPhotoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCoverPhotoChange}
              />
              
              <input
                type="file"
                ref={profileImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="h-12 pl-10 border border-gray-200 bg-white focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="h-12 pl-10 border border-gray-200 bg-gray-50 rounded-xl"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="h-12 pl-10 border border-gray-200 bg-white focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                      className="h-12 pl-10 border border-gray-200 bg-white focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={profileData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full h-12 px-3 py-2 border border-gray-200 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth || ''}
                      onChange={handleInputChange}
                      className="h-12 pl-10 border border-gray-200 bg-white focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us a little about yourself..."
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={profileData.role}
                  onChange={handleInputChange}
                  className="h-12 border border-gray-200 bg-gray-50 rounded-xl"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Role is assigned by system administrators
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={updating} 
                  className="min-w-[140px] bg-blue-600 hover:bg-blue-700 shadow-lg h-12"
                >
                  {updating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="min-w-[140px] h-12 border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}