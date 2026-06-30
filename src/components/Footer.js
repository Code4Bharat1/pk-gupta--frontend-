"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import API from '@/utils/api';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get('/settings')
      .then((res) => {
        if (res.data && res.data.success) {
          setSettings(res.data.data);
        }
      })
      .catch(() => {
        // use default fallback
      });
  }, []);

  const companyName = settings?.companyName || 'PK Gupta Tour & Travels';
  const email = settings?.contactDetails?.email || 'info@travelrental.com';
  const phone = settings?.contactDetails?.phone || '+1234567890';
  const address = settings?.contactDetails?.address || '123 Travel Lane, Delhi, India';

  return (
    <footer className="bg-accent text-gray-300 pt-12 pb-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* About */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">{companyName}</h3>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Leading travel booking and car rental platform across India. Providing clean rides, verified drivers, and transparent pricing models since 2014.
          </p>
          <div className="flex space-x-3">
            {settings?.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center" target="_blank" rel="noreferrer">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
            )}
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center" target="_blank" rel="noreferrer">
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {settings?.socialLinks?.twitter && (
              <a href={settings.socialLinks.twitter} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center" target="_blank" rel="noreferrer">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {settings?.socialLinks?.linkedin && (
              <a href={settings.socialLinks.linkedin} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center" target="_blank" rel="noreferrer">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/cars" className="hover:text-white transition-colors">Rent a Car</Link></li>
            <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/#testimonials" className="hover:text-white transition-colors">Testimonials</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-white font-semibold mb-4">Policies & Rules</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Flexible 24-hour cancellations</li>
            <li>No hidden service fees</li>
            <li>Verified chauffeur assignments</li>
            <li>Local travel coverages</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{address}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>{phone}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>{email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
