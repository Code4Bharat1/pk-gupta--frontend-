"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck, AlertCircle, ChevronLeft, User, Mail, Phone, Lock } from 'lucide-react';
import Link from 'next/link';

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
      <main className="flex-1 min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white relative">
        {/* Glassmorphic Back to Home Button at Top-Left */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-20 inline-flex items-center space-x-1.5 text-xs font-bold text-white hover:text-primary transition-all bg-accent/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

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
        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-gray-50/50">
          <div className="max-w-md w-full bg-white luxury-card p-8 sm:p-10">
            
            {/* Header & Branding */}
            <div className="text-center space-y-4">
              <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
                <span className="text-2xl font-black tracking-tight text-accent font-extrabold">PK Gupta</span>
                <span className="text-primary text-xs ml-2 font-normal border-l border-gray-300 pl-2">Tour & Travels</span>
              </Link>
              
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-accent tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                  {isLogin ? 'Sign in to access your bookings & packages' : 'Register to book custom itineraries instantly'}
                </p>
              </div>
            </div>

            {/* Segmented Controller Tab Switcher */}
            <div className="flex border-b border-gray-150 mt-6 relative">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer relative focus:outline-none ${
                  isLogin ? 'text-accent font-extrabold' : 'text-gray-400 hover:text-accent'
                }`}
                type="button"
              >
                <LogIn className={`w-4 h-4 transition-colors duration-300 ${isLogin ? 'text-primary' : 'text-gray-400'}`} />
                <span>SIGN IN</span>
                {isLogin && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full animate-fade-in"></span>
                )}
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer relative focus:outline-none ${
                  !isLogin ? 'text-accent font-extrabold' : 'text-gray-400 hover:text-accent'
                }`}
                type="button"
              >
                <UserPlus className={`w-4 h-4 transition-colors duration-300 ${!isLogin ? 'text-primary' : 'text-gray-400'}`} />
                <span>REGISTER</span>
                {!isLogin && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full animate-fade-in"></span>
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-secondary text-secondary text-xs rounded-r-xl flex items-start space-x-2 animate-pulse mt-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm font-semibold"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-xs focus:outline-none transition-all text-accent shadow-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-650 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all text-xs uppercase tracking-widest mt-6 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
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

          </div>
        </div>
      </main>
    </>
  );
}
