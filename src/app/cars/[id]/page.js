"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { Calendar, AlertCircle, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export default function CarDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const carId = params.id;

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Booking details
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    // Check logged in user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {}
    }

    fetchCar();
  }, [carId]);

  // Calculate days difference
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setDays(diffDays);
      } else {
        setDays(0);
      }
    } else {
      setDays(0);
    }
  }, [startDate, endDate]);

  const fetchCar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/cars/${carId}`);
      if (res.data && res.data.success) {
        setCar(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (days <= 0) {
      setBookingError('End date must be after start date.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const totalAmount = days * car.pricePerDay;
      const payload = {
        car: carId,
        bookingType: 'car',
        startDate,
        endDate,
        totalAmount,
      };

      const res = await API.post('/bookings', payload);
      if (res.data && res.data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2500);
      }
    } catch (err) {
      setBookingError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-bold text-accent mb-2">Error Loading Vehicle</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Vehicle record not found.'}</p>
          <Link href="/cars" className="bg-primary text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider">
            Back to Fleet
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <Link href="/cars" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Side: Images & Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <img
                src={car.images[0] ? `http://localhost:5000/${car.images[0]}` : '/hero-bg.png'}
                alt={`${car.make} ${car.model}`}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                  {car.category}
                </span>
                <h1 className="text-3xl font-extrabold text-accent mt-2 leading-tight">
                  {car.make} {car.model}
                </h1>
                <p className="text-gray-400 text-xs mt-1">Manufacture Year {car.year}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-base text-accent mb-3 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Premium Features & Amenities</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-4.5 h-4.5 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Price Card & Booking Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sticky top-24 space-y-6">
              {bookingSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-accent">Booking Submitted!</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Your request was recorded successfully. Redirecting you to your bookings dashboard...
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-3xl font-extrabold text-secondary">₹{car.pricePerDay}</span>
                      <span className="text-gray-400 text-xs"> / Day</span>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                      car.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {car.status}
                    </span>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-red-50 border-l-4 border-secondary text-secondary text-xs rounded-r-md">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleBook} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Pickup Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-primary" />
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Return Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-primary" />
                        <input
                          type="date"
                          required
                          min={startDate || new Date().toISOString().split('T')[0]}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    {days > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Rental Duration:</span>
                          <span className="font-semibold text-accent">{days} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate per Day:</span>
                          <span className="font-semibold text-accent">₹{car.pricePerDay}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-extrabold text-accent">
                          <span>Total Amount:</span>
                          <span className="text-secondary">₹{days * car.pricePerDay}</span>
                        </div>
                      </div>
                    )}

                    {!user ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200 leading-relaxed">
                          Please sign in or register an account to request booking confirmations on this vehicle.
                        </div>
                        <Link
                          href="/login"
                          className="w-full bg-accent hover:bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all text-sm uppercase tracking-wider flex items-center justify-center"
                        >
                          Sign In to Book
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={bookingLoading || car.status !== 'available'}
                        className="w-full bg-secondary hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{bookingLoading ? 'Submitting request...' : 'Confirm & Request Booking'}</span>
                      </button>
                    )}
                  </form>
                  <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 border-t border-gray-100 pt-4">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Safe Payment Gateway Integration</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
