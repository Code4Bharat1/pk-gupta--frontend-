import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, ShieldAlert, Car, Menu, X } from 'lucide-react';
import API from '@/utils/api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [logo, setLogo] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarContent, setNavbarContent] = useState({
    logoSize: 14,
    links: [
      { label: 'Home', url: '/' },
      { label: 'Cars', url: '/cars' },
      { label: 'FAQ', url: '/#faq' },
      { label: 'Testimonials', url: '/#testimonials' }
    ]
  });
  
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

    // Load CMS navbar links
    API.get('/cms/navbar')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.content) {
          setNavbarContent(res.data.data.content);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          {logo ? (
            <img
              src={`http://localhost:5000/${logo}`}
              alt="Logo"
              className="h-11 md:h-13 object-contain transition-all"
            />
          ) : (
            <div className="font-bold text-xl md:text-2xl tracking-tight flex items-center">
              <span className="text-secondary">PK Gupta</span>
              <span className="text-accent text-xs ml-2 font-normal border-l border-gray-300 pl-2">Tour & Travels</span>
            </div>
          )}
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-accent">
          {navbarContent.links?.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.url} 
              className={`hover:text-primary transition-colors ${pathname === link.url ? 'text-primary font-bold' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / Profile Panel / Hamburger (Desktop & Tablet) */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 px-3 h-9 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                ) : user.role === 'driver' ? (
                  <Link
                    href="/driver"
                    className="flex items-center space-x-1 px-3 h-9 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Driver Panel</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1 px-3 h-9 rounded-md bg-blue-50 text-primary text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
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

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-accent hover:bg-gray-100 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 shadow-md animate-fade-in">
          <nav className="flex flex-col space-y-3">
            {navbarContent.links?.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.url} 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold py-1.5 px-2.5 rounded-lg text-accent hover:bg-gray-50 hover:text-primary transition-colors ${pathname === link.url ? 'text-primary bg-primary/5' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            {user ? (
              <div className="space-y-3">
                <div className="px-2.5 py-1">
                  <p className="text-xs font-bold text-accent">{user.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-xs font-semibold py-2 px-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-100"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {user.role === 'driver' && (
                  <Link
                    href="/driver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-xs font-semibold py-2 px-3 rounded-lg bg-green-50 text-green-700 border border-green-100"
                  >
                    <User className="w-4 h-4" />
                    <span>Driver Panel</span>
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-xs font-semibold py-2 px-3 rounded-lg bg-blue-50 text-primary border border-blue-100"
                  >
                    <User className="w-4 h-4" />
                    <span>My Bookings</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 text-xs font-semibold py-2 px-3 rounded-lg text-secondary hover:bg-red-50 transition-colors border border-transparent hover:border-red-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-bold text-accent border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/cars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-bold text-white bg-secondary rounded-lg py-2.5 hover:bg-red-600 transition-colors"
                >
                  Book a Cab
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
