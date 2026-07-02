"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { Star, MessageSquare, Award, ChevronLeft, Car } from 'lucide-react';
import Link from 'next/link';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/cms/testimonials')
      .then((res) => {
        if (res.data && res.data.success) {
          setTestimonials(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const reviews = testimonials?.content?.reviews || [
    {
      name: 'Sarah Connor',
      rating: 5,
      review: 'The Innova Crysta was in pristine condition. The driver Suresh was extremely professional and knew all the local spots in Jaipur!'
    },
    {
      name: 'John Miller',
      rating: 4.8,
      review: 'Superb customer service! They assigned an excellent driver for our weekend trip to Agra.'
    },
    {
      name: 'Vikram Singh',
      rating: 5,
      review: 'Booked a Fortuner for a family wedding. The service was top-notch and the rates were highly competitive.'
    }
  ];

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U';
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
              <Star className="w-3.5 h-3.5 fill-current text-primary" />
              <span>Reviews & Ratings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-accent">
              {testimonials?.content?.title || 'What Our Customers Say'}
            </h1>
            <p className="text-sm text-gray-500">
              Read stories and feedback from verified travelers who rented vehicles and toured India with PK Gupta Travels.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex items-center space-x-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        return (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              starValue <= Math.round(rev.rating) 
                                ? 'fill-current text-amber-500' 
                                : 'text-gray-200'
                            }`} 
                          />
                        );
                      })}
                      <span className="text-xs font-bold text-accent ml-2">{rev.rating || 5}</span>
                    </div>

                    {/* Review text */}
                    <blockquote className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                      "{rev.review}"
                    </blockquote>
                  </div>

                  {/* Reviewer Details */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-150 mt-5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-inner">
                      {getInitials(rev.name)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-accent">{rev.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Verified Client</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action Banner */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs mt-12">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-extrabold text-accent flex items-center justify-center md:justify-start space-x-2">
                <Award className="w-5 h-5 text-secondary" />
                <span>Ready for your own road trip?</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Book a premium cab with an expert chauffeur and experience Indian roads in absolute comfort.
              </p>
            </div>
            <Link 
              href="/cars" 
              className="flex items-center space-x-2 bg-secondary hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer w-full sm:w-auto justify-center text-xs uppercase tracking-wider"
            >
              <Car className="w-4 h-4" />
              <span>Book a Cab Now</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
