"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { User, ShieldCheck, FileText, CheckCircle, Clock, XCircle, Settings, UserCheck, ListOrdered } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // Profile update states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name);
      setPhone(parsedUser.phone || '');
      setLoading(false);
      fetchBookings();
    } catch (err) {
      router.push('/login');
    }
  }, []);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.data && res.data.success) {
        setBookings(res.data.data.data);
      }
    } catch (err) {
      // Ignore
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await API.put('/auth/profile', { name, phone });
      if (res.data && res.data.success) {
        setProfileSuccess('Profile updated successfully.');
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setUser(res.data.data);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data && res.data.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await API.post(`/bookings/my-bookings/${bookingId}/cancel`);
      if (res.data && res.data.success) {
        alert('Booking cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Cancellation failed. Bookings can only be cancelled if they are pending or more than 24 hours in advance.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Dashboard Tabs Sidebar */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
              {user.name[0]}
            </div>
            <div>
              <h3 className="font-bold text-sm text-accent leading-tight">{user.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-accent'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>My Booking History</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-accent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* Right Tab Contents */}
        <div className="lg:col-span-3">
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-accent">Booking Logs & Requests</h2>

              {bookingsLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 shadow-sm">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold">No bookings recorded yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Book packages or rent cars to get started.</p>
                  <Link href="/cars" className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider">
                    Browse Fleet
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const isCar = booking.bookingType === 'car';
                    return (
                      <div key={booking._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {booking.bookingType} booking
                            </span>
                            <h4 className="font-bold text-base text-accent mt-1">
                              {isCar ? `${booking.car?.make} ${booking.car?.model}` : booking.packageDetails?.packageName}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-2 text-xs">
                            {booking.status === 'confirmed' && (
                              <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold flex items-center space-x-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Confirmed</span>
                              </span>
                            )}
                            {booking.status === 'pending' && (
                              <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending Approval</span>
                              </span>
                            )}
                            {(booking.status === 'cancelled' || booking.status === 'rejected') && (
                              <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-semibold flex items-center space-x-1">
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="capitalize">{booking.status}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="text-gray-400 font-medium">Pickup Date</p>
                            <p className="font-bold text-accent mt-1">{new Date(booking.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Return Date</p>
                            <p className="font-bold text-accent mt-1">{new Date(booking.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Driver Status</p>
                            <p className="font-bold text-accent mt-1">{booking.driverAssigned || 'No Driver Assigned'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Total Amount</p>
                            <p className="font-bold text-secondary text-sm mt-0.5">₹{booking.totalAmount}</p>
                          </div>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-secondary text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Details */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-accent border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <span>Update Profile Info</span>
                </h2>

                {profileSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200">{profileSuccess}</div>}
                {profileError && <div className="p-3 bg-red-50 text-secondary text-xs rounded border border-red-200">{profileError}</div>}

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all w-fit"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Password change */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-accent border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>Change Password</span>
                </h2>

                {passwordSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200">{passwordSuccess}</div>}
                {passwordError && <div className="p-3 bg-red-50 text-secondary text-xs rounded border border-red-200">{passwordError}</div>}

                <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all w-fit"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
