'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Users, Activity, TrendingUp } from 'lucide-react';
import { medicinesApi, usersApi } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [medicines, users] = await Promise.all([
          medicinesApi.getAll(),
          usersApi.getAll(),
        ]);
        
        setStats({
          totalMedicines: medicines.length,
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.role === 'user').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to your admin dashboard. Here's what's happening today.
        </p>
      </div>

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
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Add New Medicine</p>
                <p className="text-sm text-muted-foreground">
                  Add a new medicine to the database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
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
    </div>
  );
}
