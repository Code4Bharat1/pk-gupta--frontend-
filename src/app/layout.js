import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PK Gupta Tour & Travels | Premium Car Rentals",
  description: "Rent the best SUVs, luxury cars, and sports sedans. Customized travel packages and verified chauffeurs.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-light text-accent">
        {children}

        {/* Floating Call & WhatsApp Widgets */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-auto">
          {/* WhatsApp Floating Button */}
          <a
            href="https://wa.me/919024644165"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer"
            title="Chat on WhatsApp"
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.729-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.788 2.012 14.312 1 11.99 1c-5.442 0-9.87 4.372-9.874 9.802-.001 1.768.478 3.49 1.39 5.031L2.433 20.3l4.214-1.146zm11.233-5.97c-.328-.163-1.94-.945-2.24-1.053-.3-.11-.519-.163-.738.163-.219.327-.85 1.053-1.041 1.27-.192.217-.384.244-.712.081-1.378-.688-2.42-1.22-3.376-2.839-.253-.427-.087-.658.077-.822.148-.148.328-.381.492-.572.164-.19.219-.327.328-.545.11-.218.055-.409-.027-.572-.082-.164-.738-1.758-1.012-2.42-.267-.64-.539-.553-.738-.563-.19-.01-.409-.012-.628-.012-.219 0-.575.082-.876.409-.3.327-1.148 1.107-1.148 2.7 0 1.593 1.176 3.13 1.339 3.348.163.218 2.312 3.487 5.597 4.887.781.332 1.39.531 1.867.68.784.246 1.498.211 2.062.127.629-.094 1.94-.784 2.213-1.541.274-.757.274-1.404.192-1.541-.08-.137-.3-.219-.629-.382z"/>
            </svg>
          </a>

          {/* Primary Phone Floating Button */}
          <a
            href="tel:+919024644165"
            className="flex items-center justify-center w-14 h-14 bg-secondary hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer"
            title="Call +91 90246 44165"
          >
            <svg className="w-7 h-7 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
        </div>
      </body>
    </html>
  );
}
