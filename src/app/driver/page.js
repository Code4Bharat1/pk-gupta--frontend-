"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import API from '@/utils/api';
import { 
  User, ShieldCheck, MapPin, Calendar, Phone, Car, Clock, 
  CheckCircle, Settings, Key, UserCheck, ClipboardList, Briefcase
} from 'lucide-react';

export default function DriverDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trips');
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trips lists
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Status toggle state
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Profile update states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'driver') {
        router.push(parsedUser.role === 'admin' ? '/admin' : '/dashboard');
        return;
      }
      setUser(parsedUser);
      setName(parsedUser.name);
      setPhone(parsedUser.phone || '');
      
      // Fetch driver details and assigned bookings
      fetchDriverDetails();
      fetchAssignedTrips();
    } catch (err) {
      router.push('/login');
    }
  }, []);

  const fetchDriverDetails = async () => {
    try {
      const res = await API.get('/drivers/me');
      if (res.data && res.data.success) {
        setDriver(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load driver profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTrips = async () => {
    setTripsLoading(true);
    try {
      const res = await API.get('/bookings/driver-bookings');
      if (res.data && res.data.success) {
        setTrips(res.data.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load driver trips:', err);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await API.put('/drivers/status', { status: newStatus });
      if (res.data && res.data.success) {
        setDriver(res.data.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await API.put('/auth/profile', { name, phone });
      if (res.data && res.data.success) {
        setProfileSuccess('Profile details modified successfully.');
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
        setPasswordSuccess('Password customized successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
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

  // Filter trips into Active/Upcoming and Past
  const now = new Date();
  const activeTrips = trips.filter(trip => new Date(trip.endDate) >= now && trip.status !== 'cancelled' && trip.status !== 'rejected');
  const pastTrips = trips.filter(trip => new Date(trip.endDate) < now || trip.status === 'cancelled' || trip.status === 'rejected');

  return (
    <>
      <Navbar />

      <main className="max-w-[1440px] w-11/12 mx-auto py-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 bg-gray-50/50">
        
        {/* Left Column: Driver Info & Quick Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Driver Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-lg">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-accent leading-tight">{user.name}</h3>
                <p className="text-gray-400 text-xs mt-1 capitalize font-medium">{user.role} profile</p>
              </div>
            </div>

            {/* Availability Toggle */}
            {driver && (
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duty Status</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                  {[
                    { id: 'available', label: 'On Duty', color: 'text-green-700 bg-white border-green-200 shadow-sm' },
                    { id: 'busy', label: 'Busy', color: 'text-amber-700 bg-white border-amber-200 shadow-sm' },
                    { id: 'inactive', label: 'Off Duty', color: 'text-red-700 bg-white border-red-200 shadow-sm' }
                  ].map((opt) => {
                    const isActive = driver.status === opt.id;
                    return (
                      <button
                        key={opt.id}
                        disabled={statusUpdating}
                        onClick={() => handleStatusChange(opt.id)}
                        className={`py-2 text-[10px] font-extrabold rounded-lg transition-all duration-200 text-center uppercase tracking-wide cursor-pointer ${
                          isActive 
                            ? opt.color + ' border scale-[1.02]' 
                            : 'text-gray-400 hover:text-accent hover:bg-white/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Driver Details List */}
            {driver && (
              <div className="space-y-4 pt-4 border-t border-gray-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">License Number</span>
                  <span className="font-bold text-accent font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    {driver.licenseNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Contact Phone</span>
                  <span className="font-bold text-accent">{driver.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
            <button
              onClick={() => setActiveTab('trips')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
                activeTab === 'trips'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-accent'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Duty Trips Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-accent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account settings</span>
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Content Tab */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: TRIPS LIST */}
          {activeTab === 'trips' && (
            <div className="space-y-8">
              
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-accent tracking-tight">Assigned Duty Trips</h2>
                <button
                  onClick={fetchAssignedTrips}
                  className="bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary p-2 rounded-xl transition-all shadow-sm flex items-center space-x-1 text-xs font-bold"
                >
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Sync Trips</span>
                </button>
              </div>

              {tripsLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : trips.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500 shadow-sm max-w-xl mx-auto space-y-4">
                  <Car className="w-16 h-16 text-gray-300 mx-auto" />
                  <div>
                    <p className="font-extrabold text-base text-accent">No trips assigned yet</p>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      You currently have no bookings assigned to you. Once the administrator assigns a trip to your roster, it will display here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Active / Upcoming Section */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-accent tracking-wider uppercase flex items-center space-x-2 border-b border-gray-200/60 pb-2.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Active & Upcoming Duties ({activeTrips.length})</span>
                    </h3>

                    {activeTrips.length === 0 ? (
                      <p className="text-xs text-gray-400 italic bg-white luxury-card text-center">
                        No active or upcoming duties assigned.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {activeTrips.map((trip) => {
                          const isCar = trip.bookingType === 'car';
                          return (
                            <div key={trip._id} className="bg-white luxury-card relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
                              
                              <div className="absolute top-0 left-0 w-2.5 h-full bg-primary"></div>
                              
                              {/* Trip Details */}
                              <div className="space-y-4 pl-4 md:pl-0">
                                <div>
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-primary px-2.5 py-0.5 rounded-full border border-blue-100">
                                    {trip.bookingType} DUTY
                                  </span>
                                  <h4 className="font-black text-lg text-accent mt-2 tracking-tight leading-snug">
                                    {isCar ? `${trip.car?.make} ${trip.car?.model}` : trip.packageDetails?.packageName}
                                  </h4>
                                  {!isCar && trip.packageDetails?.destination && (
                                    <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1 font-semibold">
                                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                                      <span>Destination: {trip.packageDetails.destination}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Pickup & Return Dates */}
                                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                  <div className="space-y-0.5">
                                    <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Reporting Time</p>
                                    <div className="flex items-center space-x-1 mt-1 font-bold text-accent">
                                      <Calendar className="w-3.5 h-3.5 text-primary" />
                                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Duty Release</p>
                                    <div className="flex items-center space-x-1 mt-1 font-bold text-accent">
                                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                                      <span>{new Date(trip.endDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Customer Contact Panel */}
                              <div className="shrink-0 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 space-y-4 pl-4 md:pl-6 md:w-64">
                                <div className="space-y-1 md:text-right w-full">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Client / Passenger</p>
                                  <p className="font-bold text-sm text-accent">{trip.user?.name || 'Deleted User'}</p>
                                  <p className="text-[10px] text-gray-400 font-medium truncate">{trip.user?.email || 'N/A'}</p>
                                </div>

                                {trip.user?.phone && (
                                  <a
                                    href={`tel:${trip.user.phone}`}
                                    className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2.5 px-4 rounded-xl border border-green-200 text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                                  >
                                    <Phone className="w-4 h-4" />
                                    <span>Call Passenger</span>
                                  </a>
                                )}

                                <div className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                  Status: {trip.status}
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Past Duties Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-extrabold text-sm text-gray-400 tracking-wider uppercase flex items-center space-x-2 border-b border-gray-200/60 pb-2.5">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span>Completed / Past Duties ({pastTrips.length})</span>
                    </h3>

                    {pastTrips.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">
                        No previous duties logged.
                      </p>
                    ) : (
                      <div className="bg-white luxury-card overflow-hidden !p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-100">
                                <th className="p-4">Duty Item</th>
                                <th className="p-4">Passenger</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pastTrips.map((trip) => (
                                <tr key={trip._id} className="border-b border-gray-50 hover:bg-gray-50 text-accent">
                                  <td className="p-4 font-bold">
                                    {trip.bookingType === 'car' ? `${trip.car?.make} ${trip.car?.model}` : trip.packageDetails?.packageName}
                                  </td>
                                  <td className="p-4">{trip.user?.name || 'Deleted User'}</td>
                                  <td className="p-4">
                                    {new Date(trip.startDate).toLocaleDateString()} to {new Date(trip.endDate).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 uppercase text-[9px] font-extrabold">
                                    <span className={`px-2 py-0.5 rounded ${
                                      trip.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                      {trip.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-accent tracking-tight">Driver Account Settings</h2>

              <div className="grid grid-cols-1 gap-8">
                
                {/* Profile Details Form */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-accent border-b border-gray-100 pb-3 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <span>Personal Profile Details</span>
                  </h3>

                  {profileSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200 font-semibold">{profileSuccess}</div>}
                  {profileError && <div className="p-3 bg-red-50 text-secondary text-xs rounded border border-red-200 font-semibold">{profileError}</div>}

                  <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary text-accent shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary text-accent shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="sm:col-span-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all w-fit cursor-pointer active:scale-95"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* Password modification */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-accent border-b border-gray-100 pb-3 flex items-center space-x-2">
                    <Key className="w-5 h-5 text-primary" />
                    <span>Change Login Password</span>
                  </h3>

                  {passwordSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200 font-semibold">{passwordSuccess}</div>}
                  {passwordError && <div className="p-3 bg-red-50 text-secondary text-xs rounded border border-red-200 font-semibold">{passwordError}</div>}

                  <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary text-accent shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary text-accent shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="sm:col-span-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all w-fit cursor-pointer active:scale-95"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
