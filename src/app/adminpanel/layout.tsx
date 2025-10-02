"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updateEmail, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  NewspaperIcon, 
  CalendarIcon, 
  StarIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  // Check authentication state on component mount
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        router.push('/adminpanel');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      router.push('/adminpanel');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/adminpanel', icon: HomeIcon },
    { name: 'Orders', href: '/adminpanel/orders', icon: ShoppingBagIcon },
    { name: 'Products', href: '/adminpanel/products', icon: ShoppingBagIcon },
    { name: 'Teams', href: '/adminpanel/teams', icon: UserGroupIcon },
    { name: 'News', href: '/adminpanel/news', icon: NewspaperIcon },
    { name: 'Schedule', href: '/adminpanel/schedule', icon: CalendarIcon },
    { name: 'Reviews', href: '/adminpanel/reviews', icon: StarIcon },
    { name: 'Analytics', href: '/adminpanel/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/adminpanel/settings', icon: CogIcon },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`bg-[#1A1A1A] border-r border-[#2A2A2A] transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFFFFF] w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">V</span>
              </div>
              {isSidebarOpen && (
                <h1 className="text-white font-bold text-xl">Void Admin</h1>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-[#2A2A2A] hover:text-white transition-all duration-300 group"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-gray-300" />
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">Admin User</p>
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-300"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Removed the top bar */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}