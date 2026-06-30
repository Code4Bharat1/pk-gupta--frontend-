"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await API.post('/auth/login', { email, password });
        if (res.data && res.data.success) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          
          if (res.data.data.user.role === 'admin') {
            router.push('/admin');
          } else if (res.data.data.user.role === 'driver') {
            router.push('/driver');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        const res = await API.post('/auth/register', { name, email, password, phone });
        if (res.data && res.data.success) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-1 min-h-[680px] grid grid-cols-1 lg:grid-cols-12 bg-white">
        
        {/* Left Side: Brand Promo Panel (Visible on Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-accent text-white p-16 flex-col justify-between relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl translate-x-20 translate-y-20"></div>

          <div className="relative z-10 space-y-10">
            <div className="font-extrabold text-2xl tracking-tight">
              <span className="text-secondary">PK Gupta</span>
              <span className="text-white text-xs ml-2 font-normal border-l border-white/30 pl-2">Tour & Travels</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black leading-tight">
                Explore India <br/>
                With Absolute Comfort.
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                Delhi & Rajasthan's premium cab service. Book one-way, round-trips, and custom travel packages instantly.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 text-xs font-semibold text-gray-300 border-t border-white/10 pt-8">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-primary text-[10px] font-bold">✓</div>
              <span>Verified Cabs & Professional Drivers</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-primary text-[10px] font-bold">✓</div>
              <span>No Surge Pricing & Zero Hidden Charges</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-primary text-[10px] font-bold">✓</div>
              <span>24/7 Dedicated Client Support Desk</span>
            </div>
          </div>
        </div>

        {/* Right Side: Elegant Form Panel */}
        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50/50">
          <div className="max-w-md w-full space-y-8">
            
            {/* Header Text */}
            <div className="text-center lg:text-left space-y-2">
              <h1 className="text-3xl font-black text-accent tracking-tight leading-none">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                {isLogin ? 'Sign in to access your bookings & packages' : 'Register to book custom itineraries instantly'}
              </p>
            </div>

            {/* Segmented Controller Tab Switcher */}
            <div className="bg-gray-100 p-1.5 rounded-xl flex border border-gray-200/50">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isLogin ? 'bg-white text-accent shadow-sm' : 'text-gray-400 hover:text-accent'
                }`}
                type="button"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
                  !isLogin ? 'bg-white text-accent shadow-sm' : 'text-gray-400 hover:text-accent'
                }`}
                type="button"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>REGISTER</span>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-secondary text-secondary text-xs rounded-r-xl flex items-start space-x-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm"
                />
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-widest mt-6 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-4.5 h-4.5" /> : <UserPlus className="w-4.5 h-4.5" />}
                    <span>{isLogin ? 'Sign In' : 'Register Account'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Seed account details */}
            {isLogin && (
              <div className="mt-8 pt-6 border-t border-gray-200/60 space-y-3">
                <div className="flex items-center space-x-1.5 justify-center bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-100 text-amber-800 w-fit mx-auto">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-bold uppercase tracking-wider text-[9px]">Demo Credentials</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-center text-xs text-gray-500 shadow-sm space-y-1 font-semibold">
                  <p>Email: <span className="text-accent">admin@travelrental.com</span></p>
                  <p>Password: <span className="text-accent font-bold">AdminSecurePassword123!</span></p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
