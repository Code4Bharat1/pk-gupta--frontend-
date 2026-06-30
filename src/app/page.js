"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { Calendar, Clock, MapPin, Navigation, Car, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  // Search state
  const [tab, setTab] = useState('one-way');
  const [fromCity, setFromCity] = useState('New Delhi');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [cabType, setCabType] = useState('SUV');

  // CMS dynamic content
  const [heroContent, setHeroContent] = useState({
    title: 'Your Trusted Journey Across India, Starts Here.',
    subtitle: 'Book one-way, round-trip or local cabs with verified drivers. Delhi & Rajasthan specialists with Pan India coverage.',
  });
  const [faq, setFaq] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [popularTrips, setPopularTrips] = useState([]);

  useEffect(() => {
    // Fetch Homepage Hero Content
    API.get('/cms/home_page')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.content?.hero) {
          setHeroContent(res.data.data.content.hero);
        }
      })
      .catch(() => {});

    // Fetch FAQs
    API.get('/cms/faq')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.content?.questions) {
          setFaq(res.data.data.content.questions);
        }
      })
      .catch(() => {});

    // Fetch Testimonials
    API.get('/cms/testimonials')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.content?.reviews) {
          setTestimonials(res.data.data.content.reviews);
        }
      })
      .catch(() => {});

    // Fetch Popular Trips
    API.get('/cms/popular_trips')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.content?.trips) {
          setPopularTrips(res.data.data.content.trips);
        }
      })
      .catch(() => {});
  }, []);

  const handlePopularBook = (route) => {
    const parts = route.split(/ to /i);
    if (parts.length === 2) {
      setFromCity(parts[0].trim());
      setToCity(parts[1].trim());
    } else {
      setToCity(route);
    }
    setTab('one-way');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!toCity && tab !== 'local') {
      alert('Please enter a destination city');
      return;
    }
    // Redirect to cars fleet listing page with search params
    const query = new URLSearchParams({
      category: cabType,
      search: toCity,
      from: fromCity,
      date,
      time,
      type: tab
    }).toString();
    router.push(`/cars?${query}`);
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Banner Section */}
      <section 
        className="relative min-h-[580px] flex items-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundImage: `linear-gradient(rgba(13, 27, 42, 0.75), rgba(13, 27, 42, 0.85)), url('/hero-bg.png')` }}
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Title details */}
          <div className="lg:col-span-7 text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-secondary/90 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span>★ Trusted Since 2014</span>
              <span className="opacity-60">|</span>
              <span>Delhi & Rajasthan's #1 Cab Service</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Your Trusted <span className="text-primary font-black">Journey</span> <br className="hidden sm:inline"/>
              Across India, <span className="text-secondary font-black">Starts Here.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
              {heroContent.subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-sm font-medium">
              <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Free Cancellation</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>No Surge Pricing</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Floating Booking Widget */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-2xl p-6 text-accent border border-gray-100">
            {/* Cab type Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg mb-6 text-xs font-semibold">
              {[
                { id: 'one-way', label: 'One Way' },
                { id: 'round-trip', label: 'Round Trip' },
                { id: 'local', label: 'Local' },
                { id: 'airport', label: 'Airport' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`py-2 px-1 rounded-md text-center transition-all ${
                    tab === t.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-500 hover:text-accent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              {/* Pickup location */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-primary" />
                  <input
                    type="text"
                    required
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    placeholder="Enter pickup city"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Dropoff location */}
              {tab !== 'local' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">To</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-3 w-4 h-4 text-primary" />
                    <input
                      type="text"
                      required
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      placeholder="Enter destination city"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Date & Time grids */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-primary" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Pickup Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-primary" />
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary appearance-none transition-all"
                    >
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cab Category selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Cab Type</label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 w-4 h-4 text-primary" />
                  <select
                    value={cabType}
                    onChange={(e) => setCabType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary appearance-none transition-all"
                  >
                    <option value="SUV">SUV - 6 Seater (Innova, Ertiga)</option>
                    <option value="Sedan">Sedan - 4 Seater (Dzire, Etios)</option>
                    <option value="Luxury">Luxury - Elite Seater (Camry, Tesla)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-secondary hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm uppercase tracking-wider mt-4 flex items-center justify-center space-x-2"
              >
                <span>Search Cabs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              No hidden charges • Free cancellation • Instant confirmation
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Row Section */}
      <section className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold">50,000+</p>
            <p className="text-xs text-blue-100 mt-1">Happy Riders</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">200+</p>
            <p className="text-xs text-blue-100 mt-1">Cities Covered</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">1,200+</p>
            <p className="text-xs text-blue-100 mt-1">Verified Drivers</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold">4.8★</p>
            <p className="text-xs text-blue-100 mt-1">Average Rating</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-3xl font-extrabold">10+ Yrs</p>
            <p className="text-xs text-blue-100 mt-1">Trusted Since</p>
          </div>
        </div>
      </section>

      {/* Steps Guide Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="text-3xl font-extrabold text-accent mb-12">Book Your Cab in 4 Easy Steps</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Choose Your Route', desc: 'Select your pickup & drop cities, travel date, and preferred time.' },
              { num: '02', title: 'Pick Your Cab', desc: 'Compare vehicles by size, features, and price to find the perfect fit.' },
              { num: '03', title: 'Instant Confirmation', desc: 'Get immediate booking confirmation via SMS and WhatsApp.' },
              { num: '04', title: 'Enjoy the Ride', desc: 'Track your driver in real-time and enjoy a safe, comfortable journey.' }
            ].map((s) => (
              <div key={s.num} className="relative p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg mb-4">
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-accent mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      {popularTrips.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Popular Intercity Routes</p>
              <h2 className="text-3xl font-extrabold text-accent">Popular Cab Routes & Fares</h2>
              <p className="text-sm text-gray-500 mt-2">Affordable outstation one-way & round-trip taxi packages from Delhi & Jaipur.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularTrips.map((trip, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-extrabold text-accent group-hover:text-primary transition-colors">{trip.route}</h3>
                      <p className="text-[11px] text-gray-400 mt-1">{trip.distance} • {trip.duration}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-blue-50/50 p-2 rounded-lg">
                        <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">One Way</p>
                        <p className="text-sm font-bold text-secondary mt-0.5">₹{trip.oneWayPrice}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Round Trip</p>
                        <p className="text-sm font-bold text-primary mt-0.5">₹{trip.roundTripPrice}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePopularBook(trip.route)}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2.5 text-center text-xs uppercase tracking-wider transition-colors"
                  >
                    Book Cab Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion Grid */}
      {faq.length > 0 && (
        <section id="faq" className="py-16 bg-gray-50 border-t border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-accent text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faq.map((item, index) => (
                <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-base text-accent mb-2 flex items-start">
                    <span className="text-primary mr-2">Q:</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-sm text-gray-500 pl-6 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Review Slider */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-accent text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-1 text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4 leading-relaxed">
                    "{t.review}"
                  </p>
                  <p className="font-bold text-accent text-sm text-right">- {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
