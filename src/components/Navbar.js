"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, ShieldAlert, Car } from 'lucide-react';
import API from '@/utils/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [logo, setLogo] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }

    // Load settings logo
    API.get('/settings')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.logo) {
          setLogo(res.data.data.logo);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {logo ? (
            <img
              src={`http://localhost:5000/${logo}`}
              alt="Logo"
              className="h-10 object-contain"
            />
          ) : (
            <div className="font-bold text-2xl tracking-tight">
              <span className="text-secondary">PK Gupta</span>
              <span className="text-accent text-sm ml-2 font-normal border-l border-gray-300 pl-2">Tour & Travels</span>
            </div>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-accent">
          <Link href="/" className={`hover:text-primary transition-colors ${pathname === '/' ? 'text-primary' : ''}`}>
            Home
          </Link>
          <Link href="/cars" className={`hover:text-primary transition-colors ${pathname.startsWith('/cars') ? 'text-primary' : ''}`}>
            Fleet / Cars
          </Link>
          <Link href="/#faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/#testimonials" className="hover:text-primary transition-colors">
            Testimonials
          </Link>
        </nav>

        {/* Auth Buttons / Profile Panel */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              {user.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center space-x-1 px-3 h-9 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              ) : user.role === 'driver' ? (
                <Link
                  href="/driver"
                  className="hidden sm:flex items-center space-x-1 px-3 h-9 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Driver Panel</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center space-x-1 px-3 h-9 rounded-md bg-blue-50 text-primary text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Bookings</span>
                </Link>
              )}
              
              <div className="text-xs text-right hidden lg:block">
                <p className="font-semibold text-accent">{user.name}</p>
                <p className="text-gray-400 capitalize">{user.role}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-50 text-gray-500 hover:text-secondary transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-accent hover:text-primary transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/cars"
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-secondary rounded-md hover:bg-red-600 transition-colors shadow-sm"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Book a Cab</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
