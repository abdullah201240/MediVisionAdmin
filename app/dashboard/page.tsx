'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Users, Activity, TrendingUp, Camera, Search, ArrowRight, RefreshCw } from 'lucide-react';
import { medicinesApi, usersApi } from '@/lib/api';
import { ImageSearchDialog } from '@/components/image-search-dialog';
import { MedicineDetailsModal } from '@/components/medicine-details-modal';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Clear search results when dialog opens
  useEffect(() => {
    if (imageSearchOpen) {
      setSearchResults([]);
    }
  }, [imageSearchOpen]);

  const fetchStats = async () => {
    try {
      // Fetch medicines (no auth required)
      const medicinesResponse = await medicinesApi.getAll();
      
      // Initialize user stats
      let totalUsers = 0;
      let activeUsers = 0;
      
      try {
        // Fetch users with pagination to get total count
        const usersResponse = await usersApi.getAll({ page: 1, limit: 1 });
        totalUsers = usersResponse.total || 0;
        
        // Fetch users with role filter to get active users
        const activeUsersResponse = await usersApi.getAll({ 
          page: 1, 
          limit: 1, 
          role: 'user' 
        });
        activeUsers = activeUsersResponse.total || 0;
      } catch (usersError: any) {
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  const handleImageSearchComplete = (results: any[]) => {
    // Clear previous results before setting new ones
    setSearchResults([]);
    // Small delay to ensure DOM updates
    setTimeout(() => {
      setSearchResults(results);
    }, 50);
    // Refresh stats after successful search to ensure they're up to date
    fetchStats();
  };

  const handleViewMedicine = (medicine: any) => {
    setSelectedMedicine(medicine);
    setDetailsModalOpen(true);
  };

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats.totalMedicines,
      icon: Pill,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Users',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Welcome to your admin dashboard. Here's what's happening today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Image Search Section */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-2">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                🔍 Search Medicine by Image
              </CardTitle>
              <p className="text-base text-gray-700 mt-3 max-w-2xl mx-auto">
                Upload a clear photo of medicine packaging to instantly find matching medicines in our database
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={() => setImageSearchOpen(true)}
                className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Search className="h-6 w-6 mr-2" />
                Click Here to Search by Image
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Fast & Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Easy to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <CardContent className="pt-0">
            <div className="border-t-2 border-blue-200 pt-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded"></div>
                  Search Results: {searchResults.length} medicine(s) found
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => handleViewMedicine(medicine)}
                    >
                      <div className="space-y-3">
                        {medicine.images && medicine.images.length > 0 ? (
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={`http://localhost:3000/uploads/medicines/${medicine.images[0]}`}
                              alt={medicine.name}
                              className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Match
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <Pill className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{medicine.name}</h4>
                          {medicine.nameBn && (
                            <p className="text-sm text-gray-600 line-clamp-1">{medicine.nameBn}</p>
                          )}
                          <p className="text-sm text-blue-600 font-medium mt-1">{medicine.brand || 'No brand'}</p>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
                            >
                              View Full Details <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div 
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard/medicines')}
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Manage Medicines</p>
                <p className="text-sm text-muted-foreground">
                  View, add, and edit medicine database
                </p>
              </div>
            </div>
            <div 
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard/users')}
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-muted-foreground">
                  View and manage user accounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="text-sm font-medium">Database</span>
              <span className="text-xs text-green-600 font-semibold">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="text-sm font-medium">API Server</span>
              <span className="text-xs text-green-600 font-semibold">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <span className="text-sm font-medium">Last Backup</span>
              <span className="text-xs text-blue-600 font-semibold">
                2 hours ago
              </span>
            </div>
          </CardContent>
        </Card>
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
        onViewMedicine={handleViewMedicine}
      />
    </div>
  );
}