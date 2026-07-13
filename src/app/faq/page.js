"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, ChevronLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    API.get('/cms/faq')
      .then((res) => {
        if (res.data && res.data.success) {
          setFaq(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const questions = faq?.content?.questions || [
    {
      q: 'What is required to rent a vehicle?',
      a: 'A valid driver’s license, Adhaar card / Identity verification, and proof of address.'
    },
    {
      q: 'What is your cancellation policy?',
      a: 'Bookings can be cancelled up to 24 hours prior to the start time with a full refund.'
    },
    {
      q: 'Are toll taxes and state taxes included in the fare?',
      a: 'Standard fares exclude toll and state entrance taxes. They can be added to your custom invoice.'
    }
  ];

  const filteredQuestions = questions.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] w-11/12 mx-auto space-y-8 animate-fade-in">
          {/* Navigation Back */}
          <Link href="/" className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Header Block */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-accent">
              {faq?.content?.title || 'Frequently Asked Questions'}
            </h1>
            <p className="text-sm text-gray-500">
              Find instant answers to common questions about our car rentals, VIP chauffeurs, cancellation policies, and tour pricing.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-accent transition-all font-semibold"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-16 luxury-card bg-white flex flex-col items-center justify-center p-8">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 font-semibold">No answers match your query. Try searching for other terms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className="luxury-card bg-white !p-0 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-accent hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="text-sm sm:text-base pr-4">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-500 leading-relaxed border-t border-gray-50 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Help Card */}
          <div className="bg-gradient-to-r from-accent to-black text-white rounded-2xl p-6 sm:p-8 shadow-md text-center space-y-4">
            <MessageSquare className="w-10 h-10 mx-auto text-amber-300" />
            <h3 className="text-lg sm:text-xl font-extrabold">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-md mx-auto leading-relaxed">
              If you couldn't find the answers you need in our help center, feel free to reach out to our support desk directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-xs sm:text-sm font-semibold">
              <a 
                href="mailto:pkgupta2372@gmail.com" 
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-all w-fit"
              >
                <Mail className="w-4 h-4 text-amber-300" />
                <span>pkgupta2372@gmail.com</span>
              </a>
              <a 
                href="tel:+919024644165" 
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-all w-fit"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>+91 90246 44165</span>
              </a>
              <a 
                href="tel:+919828252470" 
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-all w-fit"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>+91 98282 52470</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
