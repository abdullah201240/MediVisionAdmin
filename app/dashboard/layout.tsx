'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Pill, 
  Users, 
  LogOut,
  Menu,
  X,
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { medicinesApi, usersApi } from '@/lib/api';

// Define navigation items
const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Medicines', href: '/dashboard/medicines', icon: Pill },
  { name: 'Users', href: '/dashboard/users', icon: Users },
];

const userNavItems = [
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{type: string, data: any}[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const userMenu = document.getElementById('user-menu');
      const userButton = document.getElementById('user-button');
      
      if (userMenu && userButton && 
          !userMenu.contains(target) && 
          !userButton.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      // Search medicines (with images)
      const medicinesResponse = await medicinesApi.getAll({ search: query, limit: 3 });
      const medicines = medicinesResponse.data || medicinesResponse;
      
      // Search users
      const usersResponse = await usersApi.getAll({ search: query, limit: 3 });
      const users = usersResponse.data || usersResponse;
      
      // Combine results
      const results = [
        ...medicines.slice(0, 3).map((med: any) => ({ type: 'medicine', data: med })),
        ...users.slice(0, 3).map((usr: any) => ({ type: 'user', data: usr }))
      ];
      
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (result: {type: string, data: any}) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (result.type === 'medicine') {
      // Navigate to the specific medicine detail page
      router.push(`/dashboard/medicines/${result.data.id}`);
    } else if (result.type === 'user') {
      // Navigate to users page with search term
      router.push(`/dashboard/users?search=${encodeURIComponent(result.data.name)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Determine page title based on current route
  const getPageTitle = () => {
    if (pathname === '/dashboard/profile') return 'Profile';
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/medicines')) return 'Medicines';
    if (pathname.startsWith('/dashboard/users')) return 'Users';
    return 'Admin Dashboard';
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with Apple-style glass effect */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarCollapsed ? "w-20" : "w-48",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Collapse Button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Pill className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MediVision
                  </span>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={toggleSidebar}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    sidebarCollapsed ? "justify-center px-2" : "",
                    isActive
                      ? "bg-blue-500/10 text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Section - Always visible in sidebar */}
          <div className="px-3 py-4 border-t border-white/20">
            <div className="space-y-1">
              {userNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      sidebarCollapsed ? "justify-center px-2" : "",
                      isActive
                        ? "bg-blue-500/10 text-blue-600 shadow-sm"
                        : "text-gray-700 hover:bg-white/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
              {/* Logout button always in sidebar */}
              <button
                onClick={logout}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-white/50",
                  sidebarCollapsed ? "justify-center px-2" : ""
                )}
              >
                <LogOut className="h-5 w-5" />
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-48")}>
        {/* Top bar with Apple-style glass effect */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center h-full px-4 sm:px-6">
            <button
              className="lg:hidden mr-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            
            {/* Spacer */}
            <div className="flex-1"></div>
            
            {/* Search and user info */}
            <div className="flex items-center gap-4">
              {/* Search with suggestions */}
              <div className="relative" ref={searchRef}>
                <div className="hidden md:flex items-center bg-white/50 rounded-lg px-3 py-2 border border-white/30 focus-within:bg-white focus-within:shadow-sm transition-all">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search medicines, users..."
                    className="ml-2 bg-transparent border-none focus:outline-none text-sm w-48 placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.length > 1 && setSearchResults.length > 0 && setShowSearchResults(true)}
                  />
                </div>
                
                {/* Search results dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-lg shadow-lg border border-white/30 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Search Results
                    </div>
                    
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-white/50 cursor-pointer border-b border-white/20 last:border-b-0"
                        onClick={() => handleResultClick(result)}
                      >
                        {result.type === 'medicine' ? (
                          <div className="flex items-center gap-3">
                            {result.data.images && result.data.images.length > 0 ? (
                              <div className="relative">
                                <img
                                  src={`http://localhost:3000/uploads/medicines/${result.data.images[0]}`}
                                  alt={result.data.name}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10 rounded-md"></div>
                              </div>
                            ) : (
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Pill className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-sm">{result.data.name}</div>
                              <div className="text-xs text-gray-500">{result.data.brand || 'No brand'}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{result.data.name}</div>
                              <div className="text-xs text-gray-500">{result.data.email}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="px-4 py-2 text-xs text-center text-gray-500">
                      {searchResults.length >= 6 ? 'Refine your search for more results' : ''}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 relative">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* User menu dropdown */}
                <div className="relative">
                  <button 
                    id="user-button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  {userMenuOpen && (
                    <div 
                      id="user-menu"
                      className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-lg shadow-lg border border-white/30 py-1 z-50"
                    >
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-0 sm:p-2">{children}</main>
      </div>
    </div>
  );
}