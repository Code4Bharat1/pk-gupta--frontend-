"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { Calendar, ChevronLeft, BookOpen, Clock, X } from 'lucide-react';
import Link from 'next/link';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    API.get('/cms/blogs')
      .then((res) => {
        if (res.data && res.data.success && res.data.data.content?.items) {
          setBlogs(res.data.data.content.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Back Navigation */}
          <Link href="/" className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Travel Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-accent">Latest Blogs & Travel Tips</h1>
            <p className="text-sm text-gray-500">Discover handpicked destinations, local travel routes, and expert car rental guides across India.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-xl border border-gray-150 p-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 font-semibold">No travel guides available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, idx) => (
                <article key={idx} className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="cursor-pointer" onClick={() => setSelectedBlog(blog)}>
                    <div className="h-48 bg-gray-100 relative">
                      <img 
                        src={blog.image ? `http://localhost:5000/${blog.image}` : '/hero-bg.png'} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{blog.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-accent leading-snug hover:text-primary transition-colors">{blog.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{blog.desc}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-semibold">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>5 min read</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => setSelectedBlog(blog)}
                      className="text-primary hover:text-blue-700 font-bold transition-colors cursor-pointer"
                    >
                      Read Article &rarr;
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Blog Reading Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden animate-scale-up flex flex-col">
            <div className="relative h-56 sm:h-72 bg-gray-100 shrink-0">
              <img 
                src={selectedBlog.image ? `http://localhost:5000/${selectedBlog.image}` : '/hero-bg.png'} 
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedBlog(null)} 
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/85 text-white p-2 rounded-full backdrop-blur-xs cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[50vh]">
              <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedBlog.date}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3.5 h-3.5" />
                <span>5 min read</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-accent leading-tight">{selectedBlog.title}</h2>
              <div className="border-b border-gray-100"></div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedBlog.desc}
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right shrink-0">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="bg-accent hover:bg-black text-white font-bold py-2 px-6 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
