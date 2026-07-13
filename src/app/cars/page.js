"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API, { getAssetUrl } from '@/utils/api';
import { Search, SlidersHorizontal, Check, AlertCircle, Eye, Car } from 'lucide-react';
import Link from 'next/link';

function CarsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  
  // Data states
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    fetchCars();
  }, [page, category, searchParams]); // Fetch when page, category, or url params change

  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        category: category || undefined,
        search: searchParams.get('search') || undefined,
        minPrice: searchParams.get('minPrice') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
      };

      const res = await API.get('/cars', { params });
      if (res.data && res.data.success) {
        setCars(res.data.data.data);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);

    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (minPrice) query.set('minPrice', minPrice);
    if (maxPrice) query.set('maxPrice', maxPrice);
    query.set('page', '1');

    router.push(`/cars?${query.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    router.push('/cars');
  };

  return (
    <div className="max-w-[1440px] w-11/12 mx-auto py-10 flex-1 flex flex-col">
      <h1 className="text-3xl font-extrabold text-accent mb-8">Browse Our Premium Fleet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 luxury-card bg-white h-fit space-y-6">
          <div className="flex items-center space-x-2 text-accent border-b border-gray-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">Search Filters</h2>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Car Name or Brand</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Tesla, Civic"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold shadow-sm"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Car Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold shadow-sm"
              >
                <option value="">All Categories</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Luxury">Luxury</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Daily Rental Budget</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold shadow-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold shadow-sm"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Cars Fleet Grid */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-secondary min-h-[300px]">
              <AlertCircle className="w-12 h-12 mb-3" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 min-h-[300px]">
              <Car className="w-16 h-16 text-gray-300 mb-3" />
              <p className="font-semibold text-lg">No vehicles found</p>
              <p className="text-sm text-gray-400 mt-1">Try modifying your search or filter requirements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {cars.map((car) => (
                <div key={car._id} className="luxury-card bg-white !p-0 overflow-hidden flex flex-col justify-between">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={car.images[0] ? getAssetUrl(car.images[0]) : '/hero-bg.png'}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      {car.category}
                    </div>
                    {car.status === 'available' ? (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-gray-400 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Booked
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-accent leading-snug">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">Year {car.year}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {car.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                        {car.features.length > 3 && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            +{car.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs font-semibold text-accent">
                        <span className="text-secondary uppercase text-[9px] tracking-wider font-bold">Premium Cab Service</span>
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[9px] font-bold uppercase">All Inclusive Toll Options</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400 font-semibold">Capacity: {car.features.includes('6 Seater') || car.category === 'SUV' ? '6 Passengers' : '4 Passengers'}</span>
                        <Link
                          href={`/cars/${car._id}?${searchParams.toString()}`}
                          className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-primary transition-all shadow-sm"
                        >
                          <span>Select Vehicle</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 border-t border-gray-100 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-accent"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold border ${
                    page === idx + 1
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-200 hover:bg-gray-50 text-accent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-accent"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Cars() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <CarsContent />
      </Suspense>
      <Footer />
    </>
  );
}
