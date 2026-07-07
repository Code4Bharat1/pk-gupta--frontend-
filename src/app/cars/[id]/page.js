"use client";
import { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API, { getAssetUrl } from '@/utils/api';
import { Calendar, AlertCircle, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

function CarDetailContent({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = params.id;

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Booking details from URL parameters or defaults
  const [tripType, setTripType] = useState(searchParams.get('type') || 'one-way');
  const [fromCity, setFromCity] = useState(searchParams.get('from') || 'Jaipur');
  const [toCity, setToCity] = useState(searchParams.get('to') || '');
  const [startDate, setStartDate] = useState(searchParams.get('date') || '');
  const [endDate, setEndDate] = useState('');
  const [pickupTime, setPickupTime] = useState(searchParams.get('time') || '10:00');
  const [distance, setDistance] = useState(250);
  const [transactionId, setTransactionId] = useState('');

  // UI state flow
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [days, setDays] = useState(1);
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
        setDays(1);
      }
    } else {
      setDays(1);
    }
  }, [startDate, endDate]);

  // Pre-calculate distance for common routes starting from Jaipur
  useEffect(() => {
    if (fromCity && toCity) {
      const f = fromCity.toLowerCase().trim();
      const t = toCity.toLowerCase().trim();
      if (f.includes('jaipur')) {
        if (t.includes('delhi') || t.includes('ncr') || t.includes('gurgaon') || t.includes('gurugram') || t.includes('noida')) {
          setDistance(270);
          return;
        }
        if (t.includes('udaipur')) {
          setDistance(400);
          return;
        }
        if (t.includes('jodhpur')) {
          setDistance(340);
          return;
        }
        if (t.includes('ajmer') || t.includes('pushkar')) {
          setDistance(135);
          return;
        }
        if (t.includes('jaisalmer')) {
          setDistance(570);
          return;
        }
        if (t.includes('bikaner')) {
          setDistance(335);
          return;
        }
        if (t.includes('agra') || t.includes('vrindavan') || t.includes('mathura')) {
          setDistance(240);
          return;
        }
        if (t.includes('kota')) {
          setDistance(250);
          return;
        }
        if (t.includes('ranthambore')) {
          setDistance(180);
          return;
        }
        if (t.includes('alwar')) {
          setDistance(150);
          return;
        }
      }
      setDistance(250); // standard fallback
    }
  }, [fromCity, toCity]);

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

  const getFareDetails = () => {
    if (!car) return { estimatedFare: 0, allowanceAmount: 0, totalAmount: 0, advanceAmount: 0 };
    const dist = Number(distance) || 0;
    const minDistance = car.minBillingDistance || 250;
    const allowance = car.driverAllowance || 300;

    let estimatedFare = 0;
    let allowanceAmount = 0;
    let totalAmount = 0;

    if (tripType === 'one-way') {
      const billedDist = Math.max(dist, minDistance);
      estimatedFare = billedDist * (car.pricePerKmOneWay || 12);
      allowanceAmount = allowance;
      totalAmount = estimatedFare + allowanceAmount;
    } else if (tripType === 'round-trip') {
      const billedDist = Math.max(dist, minDistance * days);
      estimatedFare = billedDist * (car.pricePerKmRoundTrip || 10);
      allowanceAmount = allowance * days;
      totalAmount = estimatedFare + allowanceAmount;
    } else if (tripType === 'local') {
      estimatedFare = car.priceLocalPkg || 2000;
      allowanceAmount = 0;
      totalAmount = estimatedFare;
    } else if (tripType === 'airport') {
      estimatedFare = car.priceAirportTransfer || 1500;
      allowanceAmount = 0;
      totalAmount = estimatedFare;
    }

    const advanceAmount = Math.round(totalAmount * 0.2); // 20% advance
    return { estimatedFare, allowanceAmount, totalAmount, advanceAmount };
  };

  const fareData = getFareDetails();

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!startDate) {
      setBookingError('Pickup date is required.');
      return;
    }

    if (tripType !== 'local' && !toCity) {
      setBookingError('Destination drop city is required.');
      return;
    }

    if (tripType === 'round-trip' && !endDate) {
      setBookingError('Return date is required for round trips.');
      return;
    }

    setBookingError('');
    setShowPaymentStep(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!transactionId || transactionId.trim().length < 8) {
      setBookingError('Please enter a valid UPI transaction reference ID.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const payload = {
        car: carId,
        bookingType: 'car',
        startDate,
        endDate: endDate || startDate,
        tripType,
        fromCity,
        toCity: tripType === 'local' ? 'Local' : toCity,
        distance: Number(distance) || 0,
        totalAmount: fareData.totalAmount,
        advancePaid: fareData.advanceAmount,
        transactionId: transactionId.trim(),
      };

      const res = await API.post('/bookings', payload);
      if (res.data && res.data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setBookingError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-secondary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-accent mb-2">Error Loading Vehicle</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'Vehicle record not found.'}</p>
        <Link href="/cars" className="bg-primary text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider">
          Back to Fleet
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <Link href="/cars" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fleet</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Images, Features, and Pricing Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <img
              src={car.images[0] ? getAssetUrl(car.images[0]) : '/hero-bg.png'}
              alt={`${car.make} ${car.model}`}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                {car.category}
              </span>
              <h1 className="text-3xl font-extrabold text-accent mt-2 leading-tight">
                {car.make} {car.model}
              </h1>
              <p className="text-gray-400 text-xs mt-1">Manufacture Year {car.year}</p>
            </div>

            {/* Pricing Displays (Only visible in Step 2) */}
            {showPaymentStep && (
              <div className="border-t border-gray-100 pt-6 animate-fade-in">
                <h3 className="font-bold text-base text-accent mb-4 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Fare & Pricing Structure</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150 text-xs font-semibold text-accent">
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">One-Way Fare</span>
                    <span className="text-secondary text-base font-extrabold">₹{car.pricePerKmOneWay}/KM</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Round-Trip Fare</span>
                    <span className="text-primary text-base font-extrabold">₹{car.pricePerKmRoundTrip}/KM</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Min Billing Distance</span>
                    <span>{car.minBillingDistance || 250} KM</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Driver Allowance</span>
                    <span>₹{car.driverAllowance || 300} / Day</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Local 8h/80km Package</span>
                    <span>₹{car.priceLocalPkg || 2000} flat</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-0.5">Airport Transfer drop</span>
                    <span>₹{car.priceAirportTransfer || 1500} flat</span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-400 block uppercase text-[9px] tracking-wider mb-1">Toll, Parking & State Tax Policy</span>
                    <p className="text-gray-500 font-normal leading-relaxed text-[11px]">{car.tollParkingPolicy || 'Toll, parking, and state tax will be charged extra as per actual receipts.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-base text-accent mb-3 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Features & Amenities</span>
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

        {/* Right Side: Booking Wizard & UPI Payments */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sticky top-24 space-y-6">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-accent">Booking Submitted!</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Your advance payment has been submitted. We are validating your payment and will confirm your booking shortly. Redirecting...
                </p>
              </div>
            ) : showPaymentStep ? (
              // STEP 2: UPI PAYMENT SCREEN
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-base text-accent uppercase tracking-wider">UPI QR Code Advance Payment</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">STEP 2 OF 2</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Estimated Fare:</span>
                    <span className="font-bold text-accent">₹{fareData.totalAmount - (tripType === 'one-way' || tripType === 'round-trip' ? car.driverAllowance : 0)}</span>
                  </div>
                  {(tripType === 'one-way' || tripType === 'round-trip') && (
                    <div className="flex justify-between">
                      <span>Driver Allowance:</span>
                      <span className="font-bold text-accent">₹{fareData.allowanceAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-gray-200 text-sm font-extrabold text-accent">
                    <span>Total Cost:</span>
                    <span>₹{fareData.totalAmount}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 text-base font-extrabold text-secondary">
                    <span>Advance to Pay (20%):</span>
                    <span>₹{fareData.advanceAmount}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center space-y-4 shadow-inner">
                  <p className="text-[11px] font-semibold text-center text-gray-400 uppercase tracking-widest">Scan & Pay using PhonePe or Any UPI App</p>
                  
                  {/* PhonePe QR Code Image */}
                  <img
                    src="/upi-qr.png"
                    alt="UPI QR Code Payment to SANGITA"
                    className="w-48 h-auto border border-gray-100 rounded-lg"
                    onError={(e) => {
                      e.target.src = '/upi-qr.png'; // fallback if image is missing
                    }}
                  />
                  
                  
                </div>

                {bookingError && (
                  <div className="p-3 bg-red-50 border-l-4 border-secondary text-secondary text-xs rounded-r-md">
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">UPI Ref No / Transaction ID (12-Digit)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 627192840192"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-primary text-accent text-center tracking-widest"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPaymentStep(false)}
                      className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-2/3 bg-secondary hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <span>{bookingLoading ? 'Verifying payment...' : 'Confirm & Request Booking'}</span>
                    </button>
                  </div>
                </form>
                
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 pt-3 border-t border-gray-100">
                  Need Help? Call us:<br />
                  <a href="tel:+919024644165" className="text-secondary hover:underline">+91 90246 44165</a> or{' '}
                  <a href="tel:+919828252470" className="text-secondary hover:underline">+91 98282 52470</a>
                </div>
              </div>
            ) : (
              // STEP 1: TRIP DETAILS FORM
              <>
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vehicle Booking</span>
                    <span className="text-lg font-black text-accent">{car.make} {car.model}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    car.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {car.status === 'available' ? 'Available' : 'Booked'}
                  </span>
                </div>

                {bookingError && (
                  <div className="p-3 bg-red-50 border-l-4 border-secondary text-secondary text-xs rounded-r-md">
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  {/* Trip Type */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Trip Type</label>
                    <select
                      value={tripType}
                      onChange={(e) => {
                        setTripType(e.target.value);
                        if (e.target.value === 'local') {
                          setToCity('Local');
                        } else {
                          setToCity('');
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent"
                    >
                      <option value="one-way">One Way Outstation</option>
                      <option value="round-trip">Round Trip Outstation</option>
                      <option value="local">Local City (8h/80km)</option>
                      <option value="airport">Airport Transfer</option>
                    </select>
                  </div>

                  {/* Pickup & Drop cities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">From (Pickup)</label>
                      <input
                        type="text"
                        required
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">To (Dropoff)</label>
                      <input
                        type="text"
                        required
                        disabled={tripType === 'local'}
                        placeholder={tripType === 'local' ? 'Local' : 'e.g. New Delhi'}
                        value={tripType === 'local' ? 'Local' : toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Pickup Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                    {tripType === 'round-trip' ? (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Return Date</label>
                        <input
                          type="date"
                          required
                          min={startDate || new Date().toISOString().split('T')[0]}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Pickup Time</label>
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent"
                        >
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Estimated Distance in KM (only for outstation drops) */}
                  {(tripType === 'one-way' || tripType === 'round-trip') && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Estimated Trip Distance (KM)</label>
                      <input
                        type="number"
                        required
                        min="10"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary text-accent"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Adjust the distance to estimate trip cost accurately. Minimum billing applies.</span>
                    </div>
                  )}

                  {/* Dynamic Estimations Panel (No price) */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2 text-xs text-gray-600 font-semibold">
                    <div className="flex justify-between">
                      <span>Trip Duration:</span>
                      <span className="text-accent">{days} Day(s)</span>
                    </div>
                    {(tripType === 'one-way' || tripType === 'round-trip') && (
                      <div className="flex justify-between">
                        <span>Billed Distance:</span>
                        <span className="text-accent">
                          {tripType === 'one-way' ? Math.max(distance, car.minBillingDistance || 250) : Math.max(distance, (car.minBillingDistance || 250) * days)} KM
                        </span>
                      </div>
                    )}
                    <div className="pt-2.5 border-t border-gray-200 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Fares will be revealed in the next step
                    </div>
                  </div>

                  {!user ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 text-amber-800 text-[11px] rounded border border-amber-200 leading-relaxed font-semibold">
                        Please sign in or register an account to request booking confirmations on this vehicle.
                      </div>
                      <Link
                        href="/login"
                        className="w-full bg-accent hover:bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center"
                      >
                        Sign In to Book
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={car.status !== 'available'}
                      className="w-full bg-primary hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Payment</span>
                    </button>
                  )}
                </form>
                <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 border-t border-gray-100 pt-4">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Verified & Secured UPI QR Integration</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CarDetail({ params }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <CarDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}
