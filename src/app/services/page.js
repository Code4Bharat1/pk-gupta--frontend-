"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { Car, Navigation, Plane, Award, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/cms/services')
      .then((res) => {
        if (res.data && res.data.success) {
          setServices(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const items = services?.content?.items || [
    {
      title: 'Local Sightseeing & Day Rentals',
      desc: 'Explore cities at your own pace with our hourly local car rental packages and professional local guides.',
      icon: 'Navigation'
    },
    {
      title: 'Airport Transfer Services',
      desc: 'Never miss a flight with our prompt, reliable airport pickup and drop-off services across major Indian airports.',
      icon: 'Plane'
    },
    {
      title: 'Premium Outstation Trips',
      desc: 'Comfortable long-distance rides with experienced chauffeurs for weekend getaways and family vacations.',
      icon: 'Car'
    }
  ];

  const renderServiceIcon = (iconName) => {
    switch (iconName) {
      case 'Navigation':
        return <Navigation className="w-7 h-7" />;
      case 'Plane':
        return <Plane className="w-7 h-7" />;
      case 'Award':
        return <Award className="w-7 h-7" />;
      case 'Car':
      default:
        return <Car className="w-7 h-7" />;
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Navigation Back */}
          <Link href="/" className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Header Block */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>What We Offer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-accent">
              {services?.content?.title || 'Our Premium Travel Services'}
            </h1>
            <p className="text-sm text-gray-500">
              {services?.content?.subtitle || 'Professional chauffeur services, outstation trips, airport transfers, and tailored holiday packages.'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((serv, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-14 h-14 bg-primary/5 text-primary rounded-xl flex items-center justify-center shadow-inner">
                    {renderServiceIcon(serv.icon)}
                  </div>
                  <h3 className="text-lg font-extrabold text-accent">{serv.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{serv.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action Banner */}
          <div className="bg-gradient-to-r from-accent to-black text-white rounded-2xl p-8 sm:p-10 shadow-md flex flex-col lg:flex-row items-center justify-between gap-6 mt-12">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold">Ready to select a vehicle?</h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                Browse our fleet catalog of SUVs, luxury sedans, and vans. Select the perfect car that fits your journey's budget and comfort requirements.
              </p>
            </div>
            <Link 
              href="/cars" 
              className="flex items-center space-x-2 bg-primary hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              <span>Explore Fleet Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
