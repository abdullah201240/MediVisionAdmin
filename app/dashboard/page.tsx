'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pill, Users, Activity, TrendingUp, Camera, Search, ArrowRight } from 'lucide-react';
import { medicinesApi, usersApi } from '@/lib/api';
import { ImageSearchDialog } from '@/components/image-search-dialog';
import { MedicineDetailsModal } from '@/components/medicine-details-modal';
import { MedicineResponseDto, PaginatedMedicineResponse, PaginatedUserResponse } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<MedicineResponseDto[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineResponseDto | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Clear search results when dialog opens
  useEffect(() => {
    if (imageSearchOpen) {
      setSearchResults([]);
    }
  }, [imageSearchOpen]);

  const fetchStats = async () => {
    try {
      // Fetch medicines (no auth required)
      const medicinesResponse: PaginatedMedicineResponse = await medicinesApi.getAll();
      
      // Initialize user stats
      let totalUsers = 0;
      let activeUsers = 0;
      
      try {
        // Fetch users with pagination to get total count
        const usersResponse: PaginatedUserResponse = await usersApi.getAll({ page: 1, limit: 1 });
        totalUsers = usersResponse.total || 0;
        
        // Fetch users with role filter to get active users
        const activeUsersResponse: PaginatedUserResponse = await usersApi.getAll({ 
          page: 1, 
          limit: 1, 
          role: 'user' 
        });
        activeUsers = activeUsersResponse.total || 0;
      } catch  {
        // If we get an unauthorized error, we'll show 0 users
        console.log('Unable to fetch user stats (likely not authenticated)');
      }
      
      setStats({
        totalMedicines: medicinesResponse.total || medicinesResponse.data?.length || 0,
        totalUsers: totalUsers,
        activeUsers: activeUsers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values in case of error
      setStats({
        totalMedicines: 0,
        totalUsers: 0,
        activeUsers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);


  const handleImageSearchComplete = (results: MedicineResponseDto[]) => {
    // Clear previous results before setting new ones
    setSearchResults([]);
    // Small delay to ensure DOM updates
    setTimeout(() => {
      setSearchResults(results);
    }, 50);
    // Refresh stats after successful search to ensure they're up to date
    fetchStats();
  };

  const handleViewMedicine = (medicine: MedicineResponseDto) => {
    setSelectedMedicine(medicine);
    setDetailsModalOpen(true);
  };

  const handleViewMedicineById = (medicineId: string) => {
    const medicine = searchResults.find(m => m.id === medicineId) || null;
    if (medicine) {
      setSelectedMedicine(medicine);
      setDetailsModalOpen(true);
    }
  };

  const statCards = [
    {
      title: 'Medicines',
      value: stats.totalMedicines,
      icon: Pill,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Medicines',
      description: 'View and edit medicine database',
      icon: Pill,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/dashboard/medicines'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      path: '/dashboard/users'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      

      {/* Stats Grid - More compact */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground text-right">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-right">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Image Search Section - Full width on mobile, spans 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Search Card */}
          <Card className="border-2 border-blue-200  from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Search Medicine by Image
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload a photo to find matching medicines
                  </p>
                </div>
                <Button
                  onClick={() => setImageSearchOpen(true)}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search by Image
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded"></div>
                  Results ({searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.slice(0, 3).map((medicine) => (
                    <div
                      key={medicine.id}
                      className="border rounded-lg p-3 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handleViewMedicine(medicine)}
                    >
                      <div className="space-y-2">
                        {medicine.images && medicine.images.length > 0 ? (
                          <div className="relative overflow-hidden rounded">
                            <Image
                              src={`http://localhost:3000/uploads/medicines/${medicine.images[0]}`}
                              alt={medicine.name}
                              width={200}
                              height={96}
                              className="w-full h-24 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                            <Pill className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{medicine.name}</h4>
                          <p className="text-xs text-blue-600 font-medium">{medicine.brand || 'No brand'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 3 && (
                    <div 
                      className="border rounded-lg p-3 flex items-center justify-center hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => router.push('/dashboard/medicines')}
                    >
                      <div className="text-center">
                        <div className="text-blue-600 font-medium text-sm">
                          +{searchResults.length - 3} more
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          View all results
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => router.push(action.path)}
                >
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content - Spans 1 column on large screens */}
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded bg-green-50">
                <span className="text-sm font-medium">Database</span>
                <span className="text-xs text-green-600 font-semibold">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50">
                <span className="text-sm font-medium">API Server</span>
                <span className="text-xs text-green-600 font-semibold">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                <span className="text-sm font-medium">Last Backup</span>
                <span className="text-xs text-blue-600 font-semibold">
                  2 hours ago
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-blue-100 rounded-full">
                    <Pill className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New medicine added</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-green-100 rounded-full">
                    <Users className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">User registered</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-purple-100 rounded-full">
                    <Activity className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Inventory updated</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Medicine Details Modal */}
      <MedicineDetailsModal
        medicine={selectedMedicine}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
      
      {/* Image Search Dialog */}
      <ImageSearchDialog
        open={imageSearchOpen}
        onOpenChange={setImageSearchOpen}
        onSearchComplete={handleImageSearchComplete}
        onViewMedicine={handleViewMedicineById}
      />
    </div>
  );
}