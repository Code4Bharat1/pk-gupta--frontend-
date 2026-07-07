"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { 
  Calendar, Clock, MapPin, Navigation, Car, CheckCircle2, ChevronRight, 
  Menu, X, Phone, Mail, Award, Compass, Star, ChevronDown, FileDown, BookOpen 
} from 'lucide-react';

const destinationsList = [
  // Delhi NCR
  'New Delhi', 'Delhi NCR', 'Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad',
  // Rajasthan
  'Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Ajmer', 'Pushkar', 'Bikaner', 'Mount Abu', 'Alwar', 'Ranthambore', 'Kota', 'Chittorgarh', 'Bharatpur',
  // Uttar Pradesh
  'Agra', 'Mathura', 'Vrindavan', 'Lucknow', 'Varanasi', 'Prayagraj', 'Kanpur', 'Ayodhya', 'Jhansi',
  // Uttarakhand
  'Haridwar', 'Rishikesh', 'Dehradun', 'Mussoorie', 'Nainital', 'Corbett National Park',
  // Himachal Pradesh
  'Shimla', 'Manali', 'Dharamshala', 'Kasauli', 'Dalhousie', 'Spiti Valley',
  // Jammu & Kashmir
  'Srinagar', 'Gulmarg', 'Pahalgam', 'Jammu', 'Leh Ladakh',
  // Other major cities
  'Mumbai', 'Pune', 'Lonavala', 'Goa', 'Ahmedabad', 'Surat', 'Vadodara', 'Kochi', 'Munnar', 'Alleppey', 'Bengaluru', 'Mysore', 'Coorg', 'Chennai', 'Ooty', 'Kodaikanal', 'Hyderabad', 'Kolkata', 'Patna'
];

const DEFAULT_SECTIONS = [
  {
    key: 'hero',
    title: 'Hero Section banner and form',
    enabled: true,
    order: 1,
    content: {
      title: "Rajasthan's Premier Taxi Service - PK Gupta Tours & Travels",
      subtitle: 'Book premium one-way, round-trip, or local cabs from Jaipur to Delhi NCR and across Rajasthan with verified drivers.',
      description: 'Jaipur\'s #1 Premium Cab & Car Rental Service.',
      bannerImage: 'hero-bg.png',
      bannerType: 'image',
      trustBadge: '★ Trusted Since 2025',
      cancellationText: 'Cancellation Fee: ₹1,000',
      bookingForm: {
        showOneWay: true,
        showRoundTrip: true,
        showLocal: true,
        showAirport: true
      }
    }
  },
  {
    key: 'metrics',
    title: 'Statistics panel',
    enabled: true,
    order: 2,
    content: {
      statistics: [
        { value: '50,000+', label: 'Happy Riders' },
        { value: '200+', label: 'Cities Covered' },
        { value: '1,200+', label: 'Verified Drivers' },
        { value: '4.8★', label: 'Average Rating' },
        { value: '10+ Yrs', label: 'Trusted Since 2025' }
      ]
    }
  },
  {
    key: 'steps',
    title: 'Booking process steps guide',
    enabled: true,
    order: 3,
    content: {
      title: 'Book Your Cab in 4 Easy Steps',
      subtitle: 'Simple Process',
      items: [
        { num: '01', title: 'Choose Your Route', desc: 'Select your pickup & drop cities, travel date, and preferred time.' },
        { num: '02', title: 'Pick Your Cab', desc: 'Compare vehicles by size, features, and price to find the perfect fit.' },
        { num: '03', title: 'Instant Confirmation', desc: 'Get immediate booking confirmation via SMS and WhatsApp.' },
        { num: '04', title: 'Enjoy the Ride', desc: 'Track your driver in real-time and enjoy a safe, comfortable journey.' }
      ]
    }
  },
  {
    key: 'services',
    title: 'Company premium services list',
    enabled: true,
    order: 4,
    content: {
      title: 'Our Premium Travel Services',
      subtitle: 'What We Offer',
      items: [
        { title: 'Local Taxi Rental', desc: 'Hourly packages for city tours, shopping, and business travel.', icon: 'Car' },
        { title: 'Outstation One-Way', desc: 'Affordable one-way drops to major cities with zero return fare.', icon: 'Navigation' },
        { title: 'Airport Transfers', desc: 'Punctual pickup and drop services to/from major airports.', icon: 'Plane' }
      ]
    }
  },
  {
    key: 'popular_trips',
    title: 'Popular routes list',
    enabled: true,
    order: 5,
    content: {
      title: 'Popular Cab Routes',
      subtitle: 'Popular Intercity Routes',
      description: 'Outstation one-way & round-trip taxi packages starting from Jaipur.',
      trips: [
        { route: 'Jaipur to Delhi NCR', distance: '270 KM', duration: '5 Hrs', oneWayPrice: '2999', roundTripPrice: '5999' },
        { route: 'Jaipur to Udaipur', distance: '400 KM', duration: '7 Hrs', oneWayPrice: '4499', roundTripPrice: '8999' },
        { route: 'Jaipur to Jodhpur', distance: '340 KM', duration: '6 Hrs', oneWayPrice: '3799', roundTripPrice: '7499' },
        { route: 'Jaipur to Ajmer', distance: '135 KM', duration: '2.5 Hrs', oneWayPrice: '1499', roundTripPrice: '2999' }
      ]
    }
  },
  {
    key: 'faq',
    title: 'Frequently Asked Questions',
    enabled: true,
    order: 6,
    content: {
      title: 'Frequently Asked Questions',
      questions: [
        { q: 'How do I pay the advance amount?', a: 'You can pay the advance amount online during booking using our UPI QR Code. The booking will be pending approval until the payment is verified.' },
        { q: 'Are tolls and taxes included in the fare?', a: 'Tolls, state taxes, and parking fees are typically charged extra as per receipts unless specified otherwise.' },
        { q: 'What is the cancellation policy?', a: 'You can cancel your booking for free up to 24 hours before your scheduled pickup time.' }
      ]
    }
  },
  {
    key: 'testimonials',
    title: 'What Our Customers Say',
    enabled: true,
    order: 7,
    content: {
      title: 'What Our Customers Say',
      reviews: [
        { name: 'Rahul Sharma', review: 'Excellent service! The driver was on time, and the car was clean. The UPI advance payment was very simple and convenient.' },
        { name: 'Priya Patel', review: 'Booked a one-way cab from Jaipur to Gurgaon. Very professional driver and reasonable pricing compared to other services.' }
      ]
    }
  },
  {
    key: 'blogs',
    title: 'Latest Travel Guides & News',
    enabled: true,
    order: 8,
    content: {
      title: 'Latest Travel Guides & News',
      subtitle: 'Our Blogs',
      items: [
        { title: 'Exploring the Pink City: A 3-Day Jaipur Itinerary', desc: 'Discover the best palaces, forts, and bazaars in Jaipur with our comprehensive travel guide.', date: 'July 5, 2026', image: '' },
        { title: 'Jaipur to Delhi NCR Road Trip Guide', desc: 'Tips, route options, and top food stops along the Jaipur-Delhi national highway.', date: 'June 28, 2026', image: '' }
      ]
    }
  },
  {
    key: 'brochure',
    title: 'Download Trip Brochure',
    enabled: true,
    order: 9,
    content: {
      title: 'Download Trip Brochure',
      description: 'Get detailed travel itinerary, route maps, and price lists for Delhi & Rajasthan.'
    }
  }
];

export default function Home() {
  const router = useRouter();
  
  // Search state
  const [tab, setTab] = useState('one-way');
  const [fromCity, setFromCity] = useState('Jaipur');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [cabType, setCabType] = useState('SUV');

  // Autocomplete states
  const [filteredFrom, setFilteredFrom] = useState(destinationsList);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [filteredTo, setFilteredTo] = useState(destinationsList);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Dynamic CMS sections
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/cms')
      .then((res) => {
        if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
          // Merge default sections with fetched ones to make sure we keep any defaults not stored in DB
          const dbSections = res.data.data;
          const merged = DEFAULT_SECTIONS.map(def => {
            const match = dbSections.find(db => db.key === def.key);
            return match ? match : def;
          });
          setSections(merged);
        }
      })
      .catch(() => {
        // Fall back to default sections silently
        setSections(DEFAULT_SECTIONS);
      });
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
    const query = new URLSearchParams({
      category: cabType,
      to: toCity,
      from: fromCity,
      date,
      time,
      type: tab
    }).toString();
    router.push(`/cars?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter and sort active sections
  const activeSections = [...sections]
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Navbar />
      
      {activeSections.map((section) => {
        const content = section.content || {};

        switch (section.key) {
          case 'hero':
            return (
              <section 
                key="hero"
                className="relative min-h-[580px] flex items-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8 transition-all"
                style={{ 
                  backgroundImage: `linear-gradient(rgba(13, 27, 42, 0.75), rgba(13, 27, 42, 0.85)), url('${content.bannerImage ? (content.bannerImage.startsWith('http') || content.bannerImage.startsWith('uploads') || content.bannerImage.startsWith('/') ? (content.bannerImage.startsWith('/') || content.bannerImage.startsWith('http') ? content.bannerImage : `http://localhost:5000/${content.bannerImage}`) : `/hero-bg.png`) : `/hero-bg.png`}')` 
                }}
              >
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  
                  {/* Left Title details */}
                  <div className="lg:col-span-7 text-white space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-secondary/90 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <span>{content.trustBadge || '★ Trusted Since 2025'}</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                      {content.title || 'Your Trusted Journey Across India, Starts Here.'}
                    </h1>
                    
                    <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
                      {content.subtitle || 'Book one-way, round-trip or local cabs with verified drivers.'}
                    </p>

                    {/* Cancellation & Features Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-sm font-medium">
                      <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>{content.cancellationText || 'Cancellation Fee: ₹1,000'}</span>
                      </div>
                      {/* <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>No Surge Pricing</span>
                      </div> */}
                      <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>24/7 Support</span>
                      </div>
                    </div>

                    {/* Call Now Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 text-xs font-bold uppercase tracking-wider">
                      <a href="tel:+919024644165" className="flex items-center space-x-2 bg-primary hover:bg-yellow-600 text-white px-5 py-3 rounded-lg shadow transition-all cursor-pointer">
                        <span>📞 Call Now: +91 90246 44165</span>
                      </a>
                      <a href="tel:+919828252470" className="flex items-center space-x-2 bg-secondary hover:bg-red-600 text-white px-5 py-3 rounded-lg shadow transition-all cursor-pointer">
                        <span>📞 Call Now: +91 98282 52470</span>
                      </a>
                    </div>
                  </div>

                  {/* Right Floating Booking Widget */}
                  <div className="lg:col-span-5 bg-white rounded-xl shadow-2xl p-6 text-accent border border-gray-100">
                    {/* Cab type Tabs */}
                    <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg mb-6 text-xs font-semibold">
                      {[
                        { id: 'one-way', label: 'One Way', enabled: content.bookingForm?.showOneWay !== false },
                        { id: 'round-trip', label: 'Round Trip', enabled: content.bookingForm?.showRoundTrip !== false },
                        { id: 'local', label: 'Local Rajasthan', enabled: content.bookingForm?.showLocal !== false },
                        { id: 'airport', label: 'Airport', enabled: content.bookingForm?.showAirport !== false }
                      ].filter(t => t.enabled).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setTab(t.id);
                            setCabType(t.id === 'local' ? 'Jaipur (RJ-14)' : 'SUV');
                          }}
                          className={`py-2 px-1 rounded-md text-center transition-all cursor-pointer ${
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
                      {/* Pickup location autocomplete */}
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">From</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-primary" />
                          <input
                            type="text"
                            required
                            value={fromCity}
                            onFocus={() => {
                              setShowFromDropdown(true);
                              setFilteredFrom(destinationsList);
                            }}
                            onBlur={() => setTimeout(() => setShowFromDropdown(false), 250)}
                            onChange={(e) => {
                              setFromCity(e.target.value);
                              const val = e.target.value.toLowerCase();
                              setFilteredFrom(destinationsList.filter(c => c.toLowerCase().includes(val)));
                            }}
                            placeholder="Enter pickup city"
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-accent font-semibold"
                          />
                        </div>
                        {showFromDropdown && filteredFrom.length > 0 && (
                          <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-xs font-semibold">
                            {filteredFrom.map((city, idx) => (
                              <li
                                key={idx}
                                onMouseDown={() => {
                                  setFromCity(city);
                                  setShowFromDropdown(false);
                                }}
                                className="px-4 py-2.5 hover:bg-primary hover:text-white cursor-pointer border-b border-gray-50 last:border-0 text-accent hover:text-white transition-colors"
                              >
                                {city}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Dropoff location autocomplete */}
                      {tab !== 'local' && (
                        <div className="relative">
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">To</label>
                          <div className="relative">
                            <Navigation className="absolute left-3 top-3.5 w-4 h-4 text-primary" />
                            <input
                              type="text"
                              required
                              value={toCity}
                              onFocus={() => {
                                setShowToDropdown(true);
                                setFilteredTo(destinationsList);
                              }}
                              onBlur={() => setTimeout(() => setShowToDropdown(false), 250)}
                              onChange={(e) => {
                                setToCity(e.target.value);
                                const val = e.target.value.toLowerCase();
                                setFilteredTo(destinationsList.filter(c => c.toLowerCase().includes(val)));
                              }}
                              placeholder="Enter destination city"
                              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-accent font-semibold"
                            />
                          </div>
                          {showToDropdown && filteredTo.length > 0 && (
                            <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-xs font-semibold">
                              {filteredTo.map((city, idx) => (
                                <li
                                  key={idx}
                                  onMouseDown={() => {
                                    setToCity(city);
                                    setShowToDropdown(false);
                                  }}
                                  className="px-4 py-2.5 hover:bg-primary hover:text-white cursor-pointer border-b border-gray-50 last:border-0 text-accent hover:text-white transition-colors"
                                >
                                  {city}
                                </li>
                              ))}
                            </ul>
                          )}
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
                              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-accent font-semibold"
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
                              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary appearance-none transition-all text-accent font-semibold"
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

                      {/* Cab Category selection / Local Rajasthan */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">
                          {tab === 'local' ? 'Local Rajasthan' : 'Cab Type'}
                        </label>
                        <div className="relative">
                          <Car className="absolute left-3 top-3 w-4 h-4 text-primary" />
                          <select
                            value={cabType}
                            onChange={(e) => setCabType(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary appearance-none transition-all text-accent font-semibold"
                          >
                            {tab === 'local' ? (
                              [
                                { value: 'Jaipur (RJ-14)', label: 'Jaipur (RJ-14)' },
                                { value: 'Udaipur (RJ-27)', label: 'Udaipur (RJ-27)' },
                                { value: 'Jodhpur (RJ-19)', label: 'Jodhpur (RJ-19)' },
                                { value: 'Ajmer (RJ-01)', label: 'Ajmer (RJ-01)' },
                                { value: 'Kota (RJ-20)', label: 'Kota (RJ-20)' },
                                { value: 'Bikaner (RJ-07)', label: 'Bikaner (RJ-07)' },
                                { value: 'Alwar (RJ-02)', label: 'Alwar (RJ-02)' },
                                { value: 'Other Rajasthan', label: 'Other Rajasthan Area' }
                              ].map((opt, index) => (
                                <option key={index} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))
                            ) : (
                              (content.bookingForm?.cabTypes || [
                                { value: 'SUV', label: 'SUV - 6 Seater (Innova, Ertiga)' },
                                { value: 'Sedan', label: 'Sedan - 4 Seater (Dzire, Etios)' },
                                { value: 'Luxury', label: 'Luxury - Elite Seater (Fortuner, E-Class)' }
                              ]).map((ct, index) => (
                                <option key={index} value={ct.value}>
                                  {ct.label}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-secondary hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm uppercase tracking-wider mt-4 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>{content.ctaText || 'Search Cabs'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                    <p className="text-[10px] text-gray-400 text-center mt-3">
                      No hidden charges • Flexible cancellations • Instant confirmation
                    </p>
                  </div>
                </div>
              </section>
            );

          case 'metrics':
            return (
              <section key="metrics" className="bg-primary text-white py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                  {(content.statistics || []).map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-3xl font-extrabold">{stat.value}</p>
                      <p className="text-xs text-blue-100 mt-1 font-semibold">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'steps':
            return (
              <section key="steps" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                    {content.subtitle || 'Simple Process'}
                  </p>
                  <h2 className="text-3xl font-extrabold text-accent mb-12">
                    {content.title || 'Book Your Cab in 4 Easy Steps'}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(content.items || []).map((s) => (
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
            );

          case 'services':
            return (
              <section id="services" key="services" className="py-16 bg-gray-50 border-t border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                    {content.subtitle || 'What We Offer'}
                  </p>
                  <h2 className="text-3xl font-extrabold text-accent mb-12">
                    {content.title || 'Our Premium Travel Services'}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(content.items || []).map((serv, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                        <div className="w-14 h-14 bg-primary/5 text-primary rounded-lg flex items-center justify-center mb-6">
                          <Car className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-accent mb-3">{serv.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{serv.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'popular_trips':
            return (
              <section key="popular_trips" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                      {content.subtitle || 'Popular Intercity Routes'}
                    </p>
                    <h2 className="text-3xl font-extrabold text-accent">
                      {content.title || 'Popular Cab Routes & Fares'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      {content.description || 'Affordable outstation one-way & round-trip taxi packages.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(content.trips || []).map((trip, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div className="p-5 space-y-4">
                          <div>
                            <h3 className="text-base font-extrabold text-accent group-hover:text-primary transition-colors">{trip.route}</h3>
                            <p className="text-[11px] text-gray-400 mt-1 font-semibold">{trip.distance} • {trip.duration}</p>
                          </div>

                          <div className="pt-3 border-t border-gray-100 text-center">
                            <p className="text-xs font-bold text-secondary">Premium Luxury Car Included</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Toll & tax policies apply</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePopularBook(trip.route)}
                          className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2.5 text-center text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Book Cab Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'faq':
            return (
              <section id="faq" key="faq" className="py-16 bg-gray-50 border-t border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-extrabold text-accent text-center mb-12">
                    {content.title || 'Frequently Asked Questions'}
                  </h2>
                  <div className="space-y-4">
                    {(content.questions || []).map((item, index) => (
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
            );

          case 'testimonials':
            return (
              <section id="testimonials" key="testimonials" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-extrabold text-accent text-center mb-12">
                    {content.title || 'What Our Customers Say'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(content.reviews || []).map((t, index) => (
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
            );

          case 'blogs':
            return (
              <section id="blogs" key="blogs" className="py-16 bg-gray-50 border-t border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
                      {content.subtitle || 'Our Blogs'}
                    </p>
                    <h2 className="text-3xl font-extrabold text-accent">
                      {content.title || 'Latest Travel Guides & News'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(content.items || []).map((blog, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                        <div className="sm:w-1/3 bg-gray-100 h-40 sm:h-auto">
                          <img 
                            src={blog.image ? `http://localhost:5000/${blog.image}` : '/hero-bg.png'} 
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6 sm:w-2/3 flex flex-col justify-between space-y-3">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{blog.date}</p>
                            <h3 className="text-base font-extrabold text-accent mt-1 leading-snug">{blog.title}</h3>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{blog.desc}</p>
                          </div>
                          <Link href="/blogs" className="text-xs text-primary font-bold hover:text-blue-700 inline-flex items-center space-x-1">
                            <span>Read Article</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'brochure':
            return null;

          default:
            return null;
        }
      })}

      <Footer />
    </>
  );
}
