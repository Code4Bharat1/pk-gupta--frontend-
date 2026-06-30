"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { 
  ShieldCheck, LayoutDashboard, Users, Car, ClipboardList, FileEdit, Settings, 
  ArrowLeft, Users2, IndianRupee, BookOpen, Plus, Edit, Trash, Check, X, 
  AlertCircle, Eye, RefreshCw, Sparkles, Upload, UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function AdminConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Users Management states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  // Fleet Management states
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({
    make: '', model: '', year: new Date().getFullYear(), category: 'SUV', pricePerDay: 2000, features: '', status: 'available', isEnabled: true
  });
  const [carFiles, setCarFiles] = useState([]);

  // Drivers Management states
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', licenseNumber: '', status: 'available', email: '', password: '' });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverBookings, setDriverBookings] = useState([]);
  const [driverBookingsLoading, setDriverBookingsLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [carBookings, setCarBookings] = useState([]);
  const [carBookingsLoading, setCarBookingsLoading] = useState(false);

  // Logo Crop states
  const [cropSrc, setCropSrc] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [imageObject, setImageObject] = useState(null);
  const [cropAspect, setCropAspect] = useState('1:1'); // '1:1' or '4:1'

  // Bookings states
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [driverInputs, setDriverInputs] = useState({});

  // CMS states
  const [cmsPages, setCmsPages] = useState([]);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [selectedCmsKey, setSelectedCmsKey] = useState('home_page');
  const [cmsForm, setCmsForm] = useState({ title: '', content: {}, seo: { metaTitle: '', metaDescription: '' } });

  // Settings states
  const [settingsForm, setSettingsForm] = useState({
    companyName: '', logo: '', contactDetails: { email: '', phone: '', address: '' },
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
    paymentGateway: { stripePublicKey: '', stripeSecretKey: '' },
    emailSettings: { smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '' },
    smsSettings: { provider: 'twilio', apiKey: '' },
    seo: { defaultMetaTitle: '', defaultMetaDescription: '' }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setAdminUser(parsedUser);
      setLoading(false);
      loadTabContent(activeTab);
    } catch (err) {
      router.push('/login');
    }
  }, [activeTab]);

  const loadTabContent = (tab) => {
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'users') fetchUsers();
    if (tab === 'cars') fetchCars();
    if (tab === 'bookings') {
      fetchBookings();
      fetchDrivers();
    }
    if (tab === 'drivers') fetchDrivers();
    if (tab === 'cms') fetchCMSPages();
    if (tab === 'settings') fetchSettings();
  };

  // 1. Fetch Dashboard Analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await API.get('/dashboard/analytics');
      if (res.data && res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {}
    setAnalyticsLoading(false);
  };

  // 2. Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        search: userSearch || undefined,
        role: userRole || undefined,
        status: userStatusFilter || undefined
      };
      const res = await API.get('/users', { params });
      if (res.data && res.data.success) {
        setUsers(res.data.data.data);
      }
    } catch (err) {}
    setUsersLoading(false);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await API.put(`/users/${userId}`, { status: nextStatus });
      if (res.data && res.data.success) {
        alert(`User account has been set to ${nextStatus}.`);
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to change user status.');
    }
  };

  // 3. Fetch Fleet Cars
  const fetchCars = async () => {
    setCarsLoading(true);
    try {
      const res = await API.get('/cars', { params: { limit: 100 } });
      if (res.data && res.data.success) {
        setCars(res.data.data.data);
      }
    } catch (err) {}
    setCarsLoading(false);
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('make', carForm.make);
    formData.append('model', carForm.model);
    formData.append('year', carForm.year);
    formData.append('category', carForm.category);
    formData.append('pricePerDay', carForm.pricePerDay);
    formData.append('status', carForm.status);
    formData.append('isEnabled', carForm.isEnabled);

    // Split features by comma
    const featuresArray = carForm.features.split(',').map((f) => f.trim()).filter(Boolean);
    featuresArray.forEach((feat) => formData.append('features', feat));

    // Append images
    for (let i = 0; i < carFiles.length; i++) {
      formData.append('images', carFiles[i]);
    }

    try {
      let res;
      if (editingCar) {
        res = await API.put(`/cars/${editingCar._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/cars', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data && res.data.success) {
        alert(editingCar ? 'Car details modified successfully.' : 'Car added to fleet inventory.');
        setCarModalOpen(false);
        setEditingCar(null);
        setCarFiles([]);
        setCarForm({ make: '', model: '', year: 2026, category: 'SUV', pricePerDay: 50, features: '', status: 'available', isEnabled: true });
        fetchCars();
      }
    } catch (err) {
      alert(err.message || 'Failed to save car details.');
    }
  };

  const handleEditCarClick = (car) => {
    setEditingCar(car);
    setCarForm({
      make: car.make,
      model: car.model,
      year: car.year,
      category: car.category,
      pricePerDay: car.pricePerDay,
      features: car.features.join(', '),
      status: car.status,
      isEnabled: car.isEnabled
    });
    setCarModalOpen(true);
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await API.delete(`/cars/${carId}`);
      if (res.data && res.data.success) {
        alert('Vehicle record removed.');
        fetchCars();
      }
    } catch (err) {
      alert('Failed to delete vehicle.');
    }
  };

  // 4. Fetch Bookings
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const params = { status: bookingStatusFilter || undefined };
      const res = await API.get('/bookings', { params });
      if (res.data && res.data.success) {
        setBookings(res.data.data.data);
      }
    } catch (err) {}
    setBookingsLoading(false);
  };

  const handleUpdateBooking = async (bookingId, status, paymentStatus) => {
    const driverAssigned = driverInputs[bookingId] || '';
    try {
      const res = await API.put(`/bookings/${bookingId}/status`, {
        status,
        paymentStatus,
        driverAssigned
      });
      if (res.data && res.data.success) {
        alert('Booking status and configurations updated.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to update booking status.');
    }
  };

  // Drivers Management Actions
  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      const res = await API.get('/drivers');
      if (res.data && res.data.success) {
        setDrivers(res.data.data);
      }
    } catch (err) {}
    setDriversLoading(false);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingDriver) {
        res = await API.put(`/drivers/${editingDriver._id}`, driverForm);
      } else {
        res = await API.post('/drivers', driverForm);
      }
      if (res.data && res.data.success) {
        alert(editingDriver ? 'Driver updated successfully.' : 'Driver registered successfully.');
        setDriverModalOpen(false);
        setEditingDriver(null);
        setDriverForm({ name: '', phone: '', licenseNumber: '', status: 'available', email: '', password: '' });
        fetchDrivers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save driver details.');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to remove this driver?')) return;
    try {
      const res = await API.delete(`/drivers/${driverId}`);
      if (res.data && res.data.success) {
        alert('Driver record removed.');
        fetchDrivers();
      }
    } catch (err) {
      alert('Failed to delete driver.');
    }
  };

  const handleViewDriverDetails = async (driver) => {
    setSelectedDriver(driver);
    setActiveTab('driver-detail');
    setDriverBookingsLoading(true);
    try {
      const res = await API.get('/bookings', { params: { driverAssigned: driver.name, limit: 100 } });
      if (res.data && res.data.success) {
        setDriverBookings(res.data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setDriverBookingsLoading(false);
  };

  const handleViewCarDetails = async (car) => {
    setSelectedCar(car);
    setActiveTab('car-detail');
    setCarBookingsLoading(true);
    try {
      const res = await API.get('/bookings', { params: { car: car._id, limit: 100 } });
      if (res.data && res.data.success) {
        setCarBookings(res.data.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setCarBookingsLoading(false);
  };

  // 5. Fetch CMS content keys
  const fetchCMSPages = async () => {
    setCmsLoading(true);
    try {
      const res = await API.get('/cms/pages/all');
      if (res.data && res.data.success) {
        setCmsPages(res.data.data);
        // Load default selected page content
        const activePage = res.data.data.find(p => p.key === selectedCmsKey);
        if (activePage) {
          setCmsForm({
            title: activePage.title,
            content: activePage.content,
            seo: activePage.seo || { metaTitle: '', metaDescription: '' }
          });
        }
      }
    } catch (err) {}
    setCmsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'cms') {
      const activePage = cmsPages.find(p => p.key === selectedCmsKey);
      if (activePage) {
        setCmsForm({
          title: activePage.title,
          content: activePage.content,
          seo: activePage.seo || { metaTitle: '', metaDescription: '' }
        });
      }
    }
  }, [selectedCmsKey]);

  const handleCMSSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/cms/${selectedCmsKey}`, cmsForm);
      if (res.data && res.data.success) {
        alert('CMS layout customized successfully.');
        fetchCMSPages();
      }
    } catch (err) {
      alert('Failed to customize CMS layout.');
    }
  };

  // 6. Settings management
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await API.get('/settings');
      if (res.data && res.data.success) {
        const data = res.data.data;
        setSettingsForm({
          companyName: data.companyName || '',
          logo: data.logo || '',
          contactDetails: data.contactDetails || { email: '', phone: '', address: '' },
          socialLinks: data.socialLinks || { facebook: '', instagram: '', twitter: '', linkedin: '' },
          paymentGateway: data.paymentGateway || { stripePublicKey: '', stripeSecretKey: '' },
          emailSettings: data.emailSettings || { smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '' },
          smsSettings: data.smsSettings || { provider: 'twilio', apiKey: '' },
          seo: data.seo || { defaultMetaTitle: '', defaultMetaDescription: '' }
        });
      }
    } catch (err) {}
    setSettingsLoading(false);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      const res = await API.put('/settings', settingsForm);
      if (res.data && res.data.success) {
        setSettingsSuccess('Global settings modifications saved successfully.');
        fetchSettings();
      }
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  // Live Canvas crop drawer
  useEffect(() => {
    if (!imageObject || !cropModalOpen) return;
    const canvas = document.getElementById('cropLiveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = cropAspect === '1:1' ? 300 : 400;
    const height = cropAspect === '1:1' ? 300 : 100;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const scale = Math.max(width / imageObject.width, height / imageObject.height) * cropZoom;
    const drawWidth = imageObject.width * scale;
    const drawHeight = imageObject.height * scale;

    const dx = (width - drawWidth) / 2 + cropX;
    const dy = (height - drawHeight) / 2 + cropY;

    ctx.drawImage(imageObject, dx, dy, drawWidth, drawHeight);

    // If 1:1, draw circular guideline
    if (cropAspect === '1:1') {
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [imageObject, cropZoom, cropX, cropY, cropAspect, cropModalOpen]);

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        setImageObject(img);
        setCropZoom(1.0);
        setCropX(0);
        setCropY(0);
        setCropModalOpen(true);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const executeCropAndUpload = async () => {
    if (!imageObject) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = cropAspect === '1:1' ? 300 : 400;
    const height = cropAspect === '1:1' ? 300 : 100;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const scale = Math.max(width / imageObject.width, height / imageObject.height) * cropZoom;
    const drawWidth = imageObject.width * scale;
    const drawHeight = imageObject.height * scale;

    const dx = (width - drawWidth) / 2 + cropX;
    const dy = (height - drawHeight) / 2 + cropY;

    ctx.drawImage(imageObject, dx, dy, drawWidth, drawHeight);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('logo', blob, 'logo.png');

      setSettingsSuccess('');
      setCropModalOpen(false);
      try {
        const res = await API.put('/settings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.success) {
          setSettingsSuccess('Corporate logo uploaded and saved successfully.');
          fetchSettings();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to upload logo.');
      }
    }, 'image/png');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-accent text-white px-6 py-4 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="font-extrabold text-sm tracking-wide">PK Gupta</h2>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Admin Console</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-gray-850 hover:bg-gray-800 text-gray-250 hover:text-white transition-colors"
          title="Open Navigation"
        >
          {/* Hamburger Icon */}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-45 w-64 bg-accent text-white flex flex-col justify-between shrink-0 shadow-xl lg:shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out`}>
        <div>
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="font-extrabold text-sm tracking-wide">PK Gupta</h2>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Admin Console</p>
              </div>
            </div>
            {/* Close button inside sidebar on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { id: 'analytics', label: 'Analytics Panel', icon: LayoutDashboard },
              { id: 'users', label: 'User Accounts', icon: Users },
              { id: 'cars', label: 'Fleet Inventory', icon: Car },
              { id: 'bookings', label: 'Bookings Ledger', icon: ClipboardList },
              { id: 'drivers', label: 'Driver Roster', icon: UserCheck },
              { id: 'cms', label: 'CMS Customizer', icon: FileEdit },
              { id: 'settings', label: 'Global Settings', icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                    activeTab === item.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-8 lg:overflow-y-auto lg:max-h-screen">
        
        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h1 className="text-2xl font-extrabold text-accent">Analytics Overview</h1>

            {analyticsLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : analytics ? (
              <>
                {/* Metrics counts grids */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                      <Users2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Registered Users</p>
                      <p className="text-2xl font-black text-accent mt-0.5">{analytics.metrics.totalUsers}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Bookings Logs</p>
                      <p className="text-2xl font-black text-accent mt-0.5">{analytics.metrics.totalBookings}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-red-50 text-secondary flex items-center justify-center">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Confirmed Revenue</p>
                      <p className="text-2xl font-black text-accent mt-0.5">₹{analytics.metrics.totalRevenue}</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Distribution Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      <span>Bookings Status Distribution</span>
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Confirmed Bookings', count: analytics.statusDistribution.confirmed, color: 'bg-green-500' },
                        { label: 'Pending Bookings', count: analytics.statusDistribution.pending, color: 'bg-amber-500' },
                        { label: 'Cancelled / Rejected', count: (analytics.statusDistribution.cancelled || 0) + (analytics.statusDistribution.rejected || 0), color: 'bg-red-500' }
                      ].map((status, index) => {
                        const total = (analytics.statusDistribution.confirmed || 0) + 
                                      (analytics.statusDistribution.pending || 0) + 
                                      (analytics.statusDistribution.cancelled || 0) + 
                                      (analytics.statusDistribution.rejected || 0) || 1;
                        const percentage = Math.round((status.count / total) * 100);
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-gray-500">{status.label}</span>
                              <span className="text-accent font-bold">{status.count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className={`${status.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking Types */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center space-x-1.5">
                      <Car className="w-4 h-4 text-primary" />
                      <span>Service Allocation (Trip Type)</span>
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Vehicle Fleet Rentals', count: analytics.typeDistribution.car, color: 'bg-blue-600', labelDesc: 'Customer rented a vehicle' },
                        { label: 'Tour Packages', count: analytics.typeDistribution.package, color: 'bg-indigo-600', labelDesc: 'All-inclusive tour booking' }
                      ].map((item, index) => {
                        const total = (analytics.typeDistribution.car || 0) + (analytics.typeDistribution.package || 0) || 1;
                        const percentage = Math.round((item.count / total) * 100);
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <div>
                                <span className="text-gray-500 block">{item.label}</span>
                                <span className="text-[10px] text-gray-400 font-normal">{item.labelDesc}</span>
                              </div>
                              <span className="text-accent font-bold">{item.count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top 5 Vehicles */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Most Booked Vehicles</span>
                    </h3>
                    {analytics.mostBookedCars.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No vehicle bookings data aggregated yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.mostBookedCars.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                            <span className="font-semibold text-accent">{item.car?.make} {item.car?.model} ({item.car?.category})</span>
                            <span className="bg-blue-50 text-primary px-2.5 py-0.5 rounded font-bold">{item.bookingCount} Bookings</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent system actions */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider">
                      Recent Booking Activity Logs
                    </h3>
                    <div className="space-y-3">
                      {analytics.recentActivities.map((act) => (
                        <div key={act._id} className="flex items-center justify-between text-[11px] border-b border-gray-50 pb-2">
                          <div>
                            <p className="font-semibold text-accent">{act.user?.name || 'Deleted User'}</p>
                            <p className="text-gray-400 mt-0.5">
                              {act.bookingType === 'car' ? `Rented ${act.car?.make} ${act.car?.model}` : `Booked ${act.packageDetails?.packageName}`}
                            </p>
                          </div>
                          <span className="text-secondary font-bold">₹{act.totalAmount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Admin Actions Hub */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Quick Administration Actions Hub</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => { setActiveTab('cars'); setCarModalOpen(true); setEditingCar(null); }}
                      className="p-4 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-start space-x-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-900 group-hover:text-blue-950 transition-colors">Add Fleet Vehicle</p>
                        <p className="text-[10px] text-blue-700/70 mt-0.5">Register a new car/cab</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('drivers'); setDriverModalOpen(true); setEditingDriver(null); }}
                      className="p-4 bg-green-50/50 hover:bg-green-50 border border-green-100 hover:border-green-200 rounded-xl transition-all text-left flex items-start space-x-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-900 group-hover:text-green-950 transition-colors">Register Driver</p>
                        <p className="text-[10px] text-green-700/70 mt-0.5">Register driver licensing</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('pending'); fetchBookings(); }}
                      className="p-4 bg-amber-50/50 hover:bg-amber-50 border border-amber-100 hover:border-amber-200 rounded-xl transition-all text-left flex items-start space-x-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900 group-hover:text-amber-950 transition-colors">Pending Bookings</p>
                        <p className="text-[10px] text-amber-700/70 mt-0.5">Approve or assign drivers</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">User Accounts Ledger</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search by name/email"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent w-full lg:w-64"
                />
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent w-full lg:w-auto"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent w-full lg:w-auto"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition-all w-full lg:w-auto cursor-pointer"
                >
                  Filter
                </button>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4 font-bold">{u.name}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">{u.phone || 'N/A'}</td>
                          <td className="p-4 uppercase font-semibold text-[10px]">{u.role}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.status)}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
                                u.status === 'active'
                                  ? 'bg-red-50 hover:bg-red-100 text-secondary border-red-200'
                                  : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                              }`}
                            >
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FLEET */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-accent">Fleet Inventory</h1>
              <button
                onClick={() => { setEditingCar(null); setCarForm({ make: '', model: '', year: 2026, category: 'SUV', pricePerDay: 2000, features: '', status: 'available', isEnabled: true }); setCarFiles([]); setCarModalOpen(true); }}
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {/* Fare CRUD Tip Banner */}
            <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg text-xs text-primary leading-relaxed">
              <strong>💡 Trip Fares CRUD Management:</strong> Daily vehicle fares (`pricePerDay`) configured in the inventory table below serve as the core rate for client trips. You can perform CRUD on vehicles and change daily rates here. To manually override a final billed amount for a specific trip booking request, use the actions under the <strong>Bookings Ledger</strong> tab.
            </div>

            {/* Car Form Modal */}
            {carModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-accent">
                      {editingCar ? 'Modify Car Details' : 'Add Vehicle to Fleet'}
                    </h3>
                    <button onClick={() => setCarModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCarSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Make</label>
                        <input
                          type="text"
                          required
                          value={carForm.make}
                          onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                          placeholder="e.g. Porsche"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Model</label>
                        <input
                          type="text"
                          required
                          value={carForm.model}
                          onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                          placeholder="e.g. 911"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Year</label>
                        <input
                          type="number"
                          required
                          value={carForm.year}
                          onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Category</label>
                        <select
                          value={carForm.category}
                          onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        >
                          <option value="SUV">SUV</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Luxury">Luxury</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Price / Day</label>
                        <input
                          type="number"
                          required
                          value={carForm.pricePerDay}
                          onChange={(e) => setCarForm({ ...carForm, pricePerDay: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Features (Comma Separated)</label>
                      <input
                        type="text"
                        value={carForm.features}
                        onChange={(e) => setCarForm({ ...carForm, features: e.target.value })}
                        placeholder="Air Conditioning, GPS, Leather Seats"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Availability</label>
                        <select
                          value={carForm.status}
                          onChange={(e) => setCarForm({ ...carForm, status: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Booked</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Enable Status</label>
                        <select
                          value={carForm.isEnabled}
                          onChange={(e) => setCarForm({ ...carForm, isEnabled: e.target.value === 'true' })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        >
                          <option value="true">Enabled (Public)</option>
                          <option value="false">Disabled (Hidden)</option>
                        </select>
                      </div>
                    </div>

                    {/* Image files upload */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1.5 uppercase">Upload Images</label>
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer bg-gray-50 relative">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setCarFiles(e.target.files)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="text-center space-y-1">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-xs font-semibold text-gray-600">Select images to upload</p>
                          <p className="text-[10px] text-gray-400">Up to 5 images (JPEG, PNG, WebP) max 5MB</p>
                        </div>
                      </div>
                      {carFiles.length > 0 && (
                        <div className="mt-2 text-xs text-primary font-bold">
                          {carFiles.length} files selected
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setCarModalOpen(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Fleet List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
              {carsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Car details</th>
                        <th className="p-4">Class</th>
                        <th className="p-4">Rate / Day</th>
                        <th className="p-4">Availability</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <tr key={car._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4 flex items-center space-x-3">
                            <img
                              src={car.images[0] ? `http://localhost:5000/${car.images[0]}` : '/hero-bg.png'}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                            />
                            <div>
                              <p className="font-bold">{car.make} {car.model}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">Year {car.year}</p>
                            </div>
                          </td>
                          <td className="p-4 font-semibold">{car.category}</td>
                          <td className="p-4 font-bold text-secondary">₹{car.pricePerDay}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              car.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {car.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              car.isEnabled ? 'bg-blue-50 text-primary' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {car.isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewCarDetails(car)}
                              className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-50 inline-flex"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditCarClick(car)}
                              className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-50 inline-flex"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id)}
                              className="p-1.5 text-gray-400 hover:text-secondary rounded hover:bg-gray-50 inline-flex"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">Bookings Ledger</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
              {/* Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent w-full sm:w-64"
                >
                  <option value="">All Booking Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={fetchBookings}
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all w-full sm:w-auto cursor-pointer"
                >
                  Filter
                </button>
              </div>

              {bookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Rental item</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Driver Assigned</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4">
                            <p className="font-bold">{b.user?.name || 'Deleted User'}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{b.user?.email || 'N/A'}</p>
                          </td>
                          <td className="p-4 font-semibold">
                            {b.bookingType === 'car' ? `${b.car?.make} ${b.car?.model}` : b.packageDetails?.packageName}
                          </td>
                          <td className="p-4">
                            <p>{new Date(b.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">to {new Date(b.endDate).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 font-bold text-secondary">₹{b.totalAmount}</td>
                          <td className="p-4">
                             {b.status === 'pending' || b.status === 'confirmed' ? (
                               <select
                                 value={driverInputs[b._id] !== undefined ? driverInputs[b._id] : b.driverAssigned || ''}
                                 onChange={(e) => setDriverInputs({ ...driverInputs, [b._id]: e.target.value })}
                                 className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] focus:outline-none focus:border-primary text-accent w-40 font-semibold cursor-pointer"
                               >
                                 <option value="">Select Driver</option>
                                 {drivers.map((d) => (
                                   <option key={d._id} value={d.name} disabled={d.status !== 'available' && d.name !== b.driverAssigned}>
                                     {d.name} ({d.status})
                                   </option>
                                 ))}
                               </select>
                             ) : (
                               <span>{b.driverAssigned || 'N/A'}</span>
                             )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                              b.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {b.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBooking(b._id, 'confirmed', 'paid')}
                                  className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200"
                                  title="Approve & Confirm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateBooking(b._id, 'rejected', 'pending')}
                                  className="p-1.5 bg-red-50 text-secondary rounded hover:bg-red-100 border border-red-200"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBooking(b._id, 'cancelled', 'refunded')}
                                className="px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-secondary text-[10px]"
                              >
                                Cancel & Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DRIVERS */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-accent">Driver Roster</h1>
              <button
                onClick={() => { setEditingDriver(null); setDriverForm({ name: '', phone: '', licenseNumber: '', status: 'available', email: '', password: '' }); setDriverModalOpen(true); }}
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Register Driver</span>
              </button>
            </div>

            {/* Driver Form Modal */}
            {driverModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-accent">
                      {editingDriver ? 'Modify Driver Details' : 'Register New Driver'}
                    </h3>
                    <button onClick={() => setDriverModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleDriverSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={driverForm.name}
                        onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Singh"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">License Number</label>
                      <input
                        type="text"
                        required
                        value={driverForm.licenseNumber}
                        onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                        placeholder="e.g. DL-1420230009876"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                     <div>
                       <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Status</label>
                       <select
                         value={driverForm.status}
                         onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                         className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                       >
                         <option value="available">Available (Free)</option>
                         <option value="busy">Busy (On Trip)</option>
                         <option value="inactive">Inactive</option>
                       </select>
                     </div>

                     <div>
                       <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Email Address (For Login)</label>
                       <input
                         type="email"
                         required={!editingDriver}
                         value={driverForm.email || ''}
                         onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                         placeholder="driver@example.com"
                         className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                       />
                     </div>

                     <div>
                       <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">
                         {editingDriver ? 'New Password (Leave blank to keep current)' : 'Password'}
                       </label>
                       <input
                         type="password"
                         required={!editingDriver}
                         value={driverForm.password || ''}
                         onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                         placeholder="••••••••"
                         className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                       />
                     </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setDriverModalOpen(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Drivers list table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
              {driversLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Driver Name</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">License Number</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((drv) => (
                        <tr key={drv._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4 font-bold">{drv.name}</td>
                          <td className="p-4">{drv.phone}</td>
                          <td className="p-4 font-mono">{drv.licenseNumber}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              drv.status === 'available' ? 'bg-green-50 text-green-700' :
                              drv.status === 'busy' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {drv.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewDriverDetails(drv)}
                              className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-50 inline-flex"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingDriver(drv); setDriverForm({ name: drv.name, phone: drv.phone, licenseNumber: drv.licenseNumber, status: drv.status, email: drv.email || '', password: '' }); setDriverModalOpen(true); }}
                              className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-50 inline-flex"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(drv._id)}
                              className="p-1.5 text-gray-400 hover:text-secondary rounded hover:bg-gray-50 inline-flex"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CMS */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">CMS Content Customizer</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Selected Section:</label>
                <select
                  value={selectedCmsKey}
                  onChange={(e) => setSelectedCmsKey(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                >
                  <option value="home_page">Home Page Banner & Promo</option>
                  <option value="about_us">About Us Page Story</option>
                  <option value="popular_trips">Popular Trips & Fares</option>
                  <option value="faq">FAQ Questions List</option>
                  <option value="testimonials">Client Reviews</option>
                </select>
              </div>

              {cmsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <form onSubmit={handleCMSSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Section Title</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.title}
                      onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary text-accent"
                    />
                  </div>

                  {/* Render dynamic inputs based on selected key */}
                  {selectedCmsKey === 'home_page' && cmsForm.content?.hero && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      <h3 className="font-bold text-sm text-accent">Hero Slider Configurations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hero Title</label>
                          <input
                            type="text"
                            value={cmsForm.content.hero.title || ''}
                            onChange={(e) => setCmsForm({
                              ...cmsForm,
                              content: { ...cmsForm.content, hero: { ...cmsForm.content.hero, title: e.target.value } }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hero Subtitle</label>
                          <input
                            type="text"
                            value={cmsForm.content.hero.subtitle || ''}
                            onChange={(e) => setCmsForm({
                              ...cmsForm,
                              content: { ...cmsForm.content, hero: { ...cmsForm.content.hero, subtitle: e.target.value } }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCmsKey === 'about_us' && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      <h3 className="font-bold text-sm text-accent">Company Story</h3>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Main Content</label>
                        <textarea
                          rows={4}
                          value={cmsForm.content.story || ''}
                          onChange={(e) => setCmsForm({
                            ...cmsForm,
                            content: { ...cmsForm.content, story: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                  )}

                  {selectedCmsKey === 'popular_trips' && cmsForm.content?.trips && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-accent">Popular Routes & Fares</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newTrips = [...(cmsForm.content.trips || [])];
                            newTrips.push({ route: '', distance: '', duration: '', oneWayPrice: 0, roundTripPrice: 0, image: 'uploads/popular-route.jpg' });
                            setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                          }}
                          className="bg-primary hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Route</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(cmsForm.content.trips || []).map((trip, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newTrips = cmsForm.content.trips.filter((_, i) => i !== idx);
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                              }}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Remove Route"
                            >
                              <Trash className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Route (e.g. Delhi to Jaipur)</label>
                                <input
                                  type="text"
                                  required
                                  value={trip.route || ''}
                                  onChange={(e) => {
                                    const newTrips = [...cmsForm.content.trips];
                                    newTrips[idx].route = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Distance (e.g. 270 km)</label>
                                <input
                                  type="text"
                                  required
                                  value={trip.distance || ''}
                                  onChange={(e) => {
                                    const newTrips = [...cmsForm.content.trips];
                                    newTrips[idx].distance = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Duration (e.g. 5 hrs)</label>
                                <input
                                  type="text"
                                  required
                                  value={trip.duration || ''}
                                  onChange={(e) => {
                                    const newTrips = [...cmsForm.content.trips];
                                    newTrips[idx].duration = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">One-Way Fare (Rs.)</label>
                                <input
                                  type="number"
                                  required
                                  value={trip.oneWayPrice || ''}
                                  onChange={(e) => {
                                    const newTrips = [...cmsForm.content.trips];
                                    newTrips[idx].oneWayPrice = Number(e.target.value);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-bold text-secondary"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Round-Trip Fare (Rs.)</label>
                                <input
                                  type="number"
                                  required
                                  value={trip.roundTripPrice || ''}
                                  onChange={(e) => {
                                    const newTrips = [...cmsForm.content.trips];
                                    newTrips[idx].roundTripPrice = Number(e.target.value);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-bold text-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCmsKey === 'faq' && cmsForm.content?.questions && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-accent">Frequently Asked Questions (FAQ)</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newQuestions = [...(cmsForm.content.questions || [])];
                            newQuestions.push({ q: '', a: '' });
                            setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                          }}
                          className="bg-primary hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(cmsForm.content.questions || []).map((faqItem, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newQuestions = cmsForm.content.questions.filter((_, i) => i !== idx);
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                              }}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Remove Question"
                            >
                              <Trash className="w-4 h-4" />
                            </button>

                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1 font-bold">Question</label>
                              <input
                                type="text"
                                required
                                value={faqItem.q || ''}
                                onChange={(e) => {
                                  const newQuestions = [...cmsForm.content.questions];
                                  newQuestions[idx].q = e.target.value;
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1 font-bold">Answer</label>
                              <textarea
                                rows={2}
                                required
                                value={faqItem.a || ''}
                                onChange={(e) => {
                                  const newQuestions = [...cmsForm.content.questions];
                                  newQuestions[idx].a = e.target.value;
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCmsKey === 'testimonials' && cmsForm.content?.reviews && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-accent">Customer Testimonials</h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newReviews = [...(cmsForm.content.reviews || [])];
                            newReviews.push({ name: '', rating: 5, review: '' });
                            setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                          }}
                          className="bg-primary hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Review</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(cmsForm.content.reviews || []).map((rev, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative space-y-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newReviews = cmsForm.content.reviews.filter((_, i) => i !== idx);
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                              }}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Remove Review"
                            >
                              <Trash className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1 font-bold">Customer Name</label>
                                <input
                                  type="text"
                                  required
                                  value={rev.name || ''}
                                  onChange={(e) => {
                                    const newReviews = [...cmsForm.content.reviews];
                                    newReviews[idx].name = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1 font-bold">Rating (1 to 5)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  step="0.1"
                                  required
                                  value={rev.rating || 5}
                                  onChange={(e) => {
                                    const newReviews = [...cmsForm.content.reviews];
                                    newReviews[idx].rating = Number(e.target.value);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 mb-1 font-bold">Review</label>
                              <textarea
                                rows={2}
                                required
                                value={rev.review || ''}
                                onChange={(e) => {
                                  const newReviews = [...cmsForm.content.reviews];
                                  newReviews[idx].review = e.target.value;
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SEO fields */}
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <h3 className="font-bold text-sm text-accent">Search Engine Optimization (SEO)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Title</label>
                        <input
                          type="text"
                          value={cmsForm.seo.metaTitle || ''}
                          onChange={(e) => setCmsForm({
                            ...cmsForm,
                            seo: { ...cmsForm.seo, metaTitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Description</label>
                        <input
                          type="text"
                          value={cmsForm.seo.metaDescription || ''}
                          onChange={(e) => setCmsForm({
                            ...cmsForm,
                            seo: { ...cmsForm.seo, metaDescription: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Save CMS Modifications
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">Global Settings & Gateways</h1>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSettingsSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                {settingsSuccess && <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200">{settingsSuccess}</div>}

                {/* Company Name & Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">Company Basics</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Define corporate name and upload logos.</p>
                  </div>
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Corporate Name</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.companyName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Company Logo</label>
                        <div className="flex items-center space-x-3">
                          {settingsForm.logo && (
                            <img
                              src={`http://localhost:5000/${settingsForm.logo}`}
                              alt="Logo"
                              className="w-10 h-10 object-contain border border-gray-200 rounded p-0.5 bg-gray-900"
                            />
                          )}
                          <input
                            type="file"
                            onChange={handleLogoSelect}
                            className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">Stripe Payment Gateway</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manage public and secret keys.</p>
                  </div>
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Stripe Publishable Key</label>
                        <input
                          type="text"
                          value={settingsForm.paymentGateway.stripePublicKey || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            paymentGateway: { ...settingsForm.paymentGateway, stripePublicKey: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Stripe Secret Key</label>
                        <input
                          type="password"
                          value={settingsForm.paymentGateway.stripeSecretKey || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            paymentGateway: { ...settingsForm.paymentGateway, stripeSecretKey: e.target.value }
                          })}
                          placeholder="••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMTP Email Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">SMTP Email Settings</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Configure mail dispatch credentials.</p>
                  </div>
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Server Host</label>
                        <input
                          type="text"
                          value={settingsForm.emailSettings.smtpHost || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            emailSettings: { ...settingsForm.emailSettings, smtpHost: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Port</label>
                        <input
                          type="number"
                          value={settingsForm.emailSettings.smtpPort || 587}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            emailSettings: { ...settingsForm.emailSettings, smtpPort: Number(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Save Global System Configurations
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB: DRIVER DETAILS */}
        {activeTab === 'driver-detail' && selectedDriver && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setActiveTab('drivers'); setSelectedDriver(null); }}
                className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 shadow-sm transition-all shadow-sm"
                type="button"
                title="Back to Roster"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-accent">Driver Profile Details</h1>
                <p className="text-xs text-gray-400">Detailed view of driver performance, contact information, and trip history.</p>
              </div>
            </div>

            {/* Profile Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-1">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-xl uppercase shadow-inner">
                    {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-accent">{selectedDriver.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedDriver.status === 'available' ? 'bg-green-50 text-green-700 border border-green-100' :
                      selectedDriver.status === 'busy' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {selectedDriver.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</p>
                    <p className="text-xs font-bold text-accent mt-0.5">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Driving License Number</p>
                    <p className="text-xs font-mono font-bold text-accent mt-0.5 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 inline-block">{selectedDriver.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Duty Status</p>
                    <p className="text-xs font-semibold text-accent mt-0.5">
                      {selectedDriver.status === 'available' ? 'Ready for new assignments' : 
                       selectedDriver.status === 'busy' ? 'On active trip' : 'Off-duty / Leave'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
                <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider">
                  Driver Performance & Analytics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center animate-fade-in">
                    <p className="text-2xl font-black text-primary">{driverBookings.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Trips</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center animate-fade-in">
                    <p className="text-2xl font-black text-green-600">
                      {driverBookings.filter(b => b.status === 'confirmed').length}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Completed / Active</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center animate-fade-in">
                    <p className="text-2xl font-black text-secondary">
                      ₹{driverBookings.reduce((sum, b) => b.status === 'confirmed' ? sum + b.totalAmount : sum, 0)}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Billed Revenue</p>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg text-xs text-primary leading-relaxed">
                  <strong>💡 Active Driver Assignment:</strong> Assigning this driver to a new cab trip from the <strong>Bookings Ledger</strong> tab automatically switches their status to <strong>busy</strong>. Once the booking status is changed to cancelled/rejected, they become available again.
                </div>
              </div>

            </div>

            {/* Trip History Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
              <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider mb-4">
                Assigned Trip History Ledger
              </h3>
              
              {driverBookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : driverBookings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No booking logs registered for this driver yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Trip Details</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Trip Dates</th>
                        <th className="p-4">Fare Billed</th>
                        <th className="p-4">Payment Status</th>
                        <th className="p-4">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverBookings.map((b) => (
                        <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4 font-bold">
                            {b.bookingType === 'car' ? `${b.car?.make} ${b.car?.model} (${b.car?.category})` : b.packageDetails?.packageName}
                          </td>
                          <td className="p-4">
                            <p className="font-bold">{b.user?.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{b.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <p>{new Date(b.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">to {new Date(b.endDate).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 font-bold text-secondary">₹{b.totalAmount}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              b.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' :
                              b.paymentStatus === 'refunded' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                              b.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: CAR DETAILS */}
        {activeTab === 'car-detail' && selectedCar && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setActiveTab('cars'); setSelectedCar(null); }}
                className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 shadow-sm transition-all shadow-sm"
                type="button"
                title="Back to Fleet"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-accent">Vehicle Profile Details</h1>
                <p className="text-xs text-gray-400">Detailed overview of vehicle status, specifications, and booking history.</p>
              </div>
            </div>

            {/* Profile Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Car Photo & Specs Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden md:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={selectedCar.images[0] ? `http://localhost:5000/${selectedCar.images[0]}` : '/hero-bg.png'}
                      alt={`${selectedCar.make} ${selectedCar.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      {selectedCar.category}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-accent leading-snug">
                        {selectedCar.make} {selectedCar.model}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5 font-semibold">Model Year: {selectedCar.year}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Daily Rental Fare</p>
                        <p className="text-lg font-black text-secondary mt-0.5">₹{selectedCar.pricePerDay} <span className="text-xs text-gray-400 font-normal font-semibold">/ day</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Availability Status</p>
                        <span className={`px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase inline-block ${
                          selectedCar.status === 'available' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {selectedCar.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Visibility Status</p>
                        <span className={`px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase inline-block ${
                          selectedCar.isEnabled ? 'bg-blue-50 text-primary border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {selectedCar.isEnabled ? 'Enabled (Public)' : 'Disabled (Hidden)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs & Performance Analytics Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 md:col-span-2">
                <div>
                  <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider mb-3">
                    Features & Specifications
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCar.features.map((feature, i) => (
                      <span key={i} className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-lg border border-gray-150 font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider mb-3">
                    Vehicle Performance & Analytics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center animate-fade-in">
                      <p className="text-2xl font-black text-primary">{carBookings.length}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Trips</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center animate-fade-in">
                      <p className="text-2xl font-black text-green-600">
                        {carBookings.filter(b => b.status === 'confirmed').length}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Completed / Active</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center animate-fade-in">
                      <p className="text-2xl font-black text-secondary">
                        ₹{carBookings.reduce((sum, b) => b.status === 'confirmed' ? sum + b.totalAmount : sum, 0)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Billed Revenue</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg text-xs text-primary leading-relaxed">
                  <strong>💡 Rental Status Auto-updates:</strong> Creating a confirmed rental request for this vehicle automatically flips its status to <strong>booked/unavailable</strong>. Once the booking finishes or is cancelled, the vehicle automatically returns to <strong>available</strong>.
                </div>
              </div>

            </div>

            {/* Trip History Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
              <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider mb-4">
                Vehicle Booking History Ledger
              </h3>
              
              {carBookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : carBookings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No booking logs registered for this vehicle yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Trip Dates</th>
                        <th className="p-4">Fare Billed</th>
                        <th className="p-4">Driver Assigned</th>
                        <th className="p-4">Payment Status</th>
                        <th className="p-4">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carBookings.map((b) => (
                        <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4">
                            <p className="font-bold">{b.user?.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{b.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <p>{new Date(b.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">to {new Date(b.endDate).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 font-bold text-secondary">₹{b.totalAmount}</td>
                          <td className="p-4 font-semibold">{b.driverAssigned || 'None Assigned'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              b.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' :
                              b.paymentStatus === 'refunded' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                              b.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Cropping Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-accent">Adjust & Crop Logo</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center border border-gray-200">
                <canvas
                  id="cropLiveCanvas"
                  className="border-2 border-primary shadow-sm bg-white rounded"
                  style={{
                    width: '200px',
                    height: cropAspect === '1:1' ? '200px' : '50px'
                  }}
                ></canvas>
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1.5 uppercase">Crop Shape / Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCropAspect('1:1'); setCropX(0); setCropY(0); setCropZoom(1); }}
                    className={`py-2 px-3 border rounded-lg text-xs font-semibold ${
                      cropAspect === '1:1'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Square / Circular (1:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCropAspect('4:1'); setCropX(0); setCropY(0); setCropZoom(1); }}
                    className={`py-2 px-3 border rounded-lg text-xs font-semibold ${
                      cropAspect === '4:1'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Landscape Banner (4:1)
                  </button>
                </div>
              </div>

              {/* Adjust Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1 font-bold">
                    <span>ZOOM SCALE</span>
                    <span>{cropZoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1 font-bold">
                      <span>PAN HORIZONTAL</span>
                      <span>{cropX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="1"
                      value={cropX}
                      onChange={(e) => setCropX(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1 font-bold">
                      <span>PAN VERTICAL</span>
                      <span>{cropY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="1"
                      value={cropY}
                      onChange={(e) => setCropY(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={executeCropAndUpload}
                  className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Crop & Save
                </button>
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
