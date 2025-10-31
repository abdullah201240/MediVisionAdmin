'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  Camera, 
  Edit3,
  MapPin,
  Briefcase,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { usersApi } from '@/lib/api';

interface UserData {
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
  createdAt: string;
}

interface UserApiResponse {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  image?: string;
  coverPhoto?: string;
  role?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
}

interface UpdateUserData {
  name?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  location?: string;
  bio?: string;
}

export default function UserDetailsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    image: '',
    coverPhoto: '',
    role: 'user',
    location: '',
    bio: '',
    createdAt: '',
  });
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await usersApi.getById(params.id as string);
      
      let formattedDob = '';
      if (response.dateOfBirth) {
        try {
          const date = new Date(response.dateOfBirth);
          if (!isNaN(date.getTime())) {
            formattedDob = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }
      
      const userData: UserApiResponse = {
        id: response.id || '',
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        gender: response.gender || '',
        dateOfBirth: formattedDob,
        image: response.image || '',
        coverPhoto: response.coverPhoto || '',
        role: response.role || 'user',
        location: response.location || '',
        bio: response.bio || '',
        createdAt: response.createdAt || '',
      };
      
      setUserData({
        id: userData.id || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        image: userData.image,
        coverPhoto: userData.coverPhoto,
        role: userData.role || 'user',
        location: userData.location,
        bio: userData.bio,
        createdAt: userData.createdAt || '',
      });
      
      if (response.image) {
        setProfileImagePreview(`http://localhost:3000/uploads/users/${response.image}`);
      }
      if (response.coverPhoto) {
        setCoverPhotoPreview(`http://localhost:3000/uploads/users/${response.coverPhoto}`);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to fetch user details',
        variant: 'destructive',
      });
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // Only admins can view user details
    if (currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchUserDetails();
  }, [currentUser, router, fetchUserDetails]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData: UpdateUserData = {
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        location: userData.location,
        bio: userData.bio,
      };

      // Only include fields that have values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateUserData] === '') {
          delete updateData[key as keyof UpdateUserData];
        }
      });

      await usersApi.update(userData.id, updateData);
      
      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Update Failed',
        description: (error as Error).message || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  }, [userData, toast]);

  const handleRoleChange = useCallback(async (newRole: string) => {
    try {
      await usersApi.updateRole(userData.id, newRole);
      setUserData(prev => ({ ...prev, role: newRole }));
      
      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${newRole}!`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Role update error:', error);
      toast({
        title: 'Role Update Failed',
        description: (error as Error).message || 'Failed to update user role',
        variant: 'destructive',
      });
    }
  }, [userData.id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Cover Photo Section */}
      <Card className="relative rounded-2xl overflow-hidden border-none shadow-none bg-white">
        {/* Cover Photo Container */}
        <div className="relative h-80  from-blue-500 via-purple-500 to-pink-500">
          {coverPhotoPreview ? (
            <Image 
              src={coverPhotoPreview} 
              alt="Cover" 
              width={1200}
              height={320}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center  from-gray-100 to-gray-200">
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium">No cover photo</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Header Section */}
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Picture Section */}
            <div className="mt-24 lg:-mt-32">
              <div className="relative group">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl border-4 border-white bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <Image 
                      src={profileImagePreview} 
                      alt="Profile" 
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl from-blue-100 to-purple-100 flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Info Section */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                      {userData.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl text-muted-foreground capitalize font-semibold">
                        {userData.role}
                      </p>
                      {userData.role === 'admin' ? (
                        <ShieldCheck className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Profile Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{userData.email}</span>
                    </div>
                    {userData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{userData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>Member since {new Date(userData.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  {userData.bio && (
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                      {userData.bio}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Role:</span>
                    <select
                      value={userData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      aria-label="User role"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button 
                    onClick={() => document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' })} 
                    className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg h-10 px-4 whitespace-nowrap text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* User Form */}
      <div id="user-form">
        <Card className="rounded-2xl border-none shadow-none bg-white">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-2xl font-bold">User Information</CardTitle>
            <p className="text-muted-foreground">Update user information and preferences</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
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
                      value={userData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
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
                      value={userData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
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
                      value={userData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Enter location"
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
                    value={userData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full h-12 px-3 py-2 border border-gray-200 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Gender"
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
                      value={userData.dateOfBirth || ''}
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
                  value={userData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us a little about this user..."
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Role (Read-only in form, editable via dropdown) */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="role"
                    name="role"
                    value={userData.role}
                    onChange={handleInputChange}
                    className="h-12 border border-gray-200 bg-gray-50 rounded-xl"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant={userData.role === 'admin' ? 'default' : 'outline'}
                    onClick={() => handleRoleChange(userData.role === 'admin' ? 'user' : 'admin')}
                    className="flex items-center gap-2"
                  >
                    {userData.role === 'admin' ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Demote to User
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Promote to Admin
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Role can be changed using the dropdown above or the promote/demote button
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={updating} 
                  className="min-w-[140px] bg-blue-600 hover:bg-blue-700 shadow-lg h-12 text-white"
                >
                  {updating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4 " />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/users')}
                  className="min-w-[140px] h-12 border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Back to Users
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}