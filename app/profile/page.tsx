'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, Calendar, UserCircle, Save, RefreshCw } from 'lucide-react';
import { authApi } from '@/lib/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  image?: string;
  role: string;
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
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
    role: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Cast user to any to access all properties
    const userData: any = user;
    
    // Format date of birth properly
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
      role: userData.role || '',
    });
    setLoading(false);
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Prepare update data (only include fields that can be updated)
      const updateData: any = {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
      };

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });

      await authApi.updateProfile(updateData);
      
      // Refresh auth context to get updated user data
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your profile information
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {profileData.image ? (
                  <img
                    src={`http://localhost:3000/uploads/users/${profileData.image}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <p className="text-sm text-muted-foreground capitalize">{profileData.role}</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="h-11"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="h-11 pl-10"
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed for security reasons
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  value={profileData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={profileData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={profileData.role}
                onChange={handleInputChange}
                className="h-11"
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Role is assigned by system administrators
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={updating} className="min-w-[120px]">
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                className="min-w-[120px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}