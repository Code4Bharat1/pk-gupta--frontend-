"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { 
  ShieldCheck, LayoutDashboard, Users, Car, ClipboardList, FileEdit, Settings, 
  ArrowLeft, Users2, IndianRupee, BookOpen, Plus, Edit, Trash, Check, X, 
  AlertCircle, Eye, RefreshCw, Sparkles, Upload, UserCheck, MoveUp, MoveDown, FileText,
  Calendar, Star, Megaphone, Download, Printer
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
    make: '', model: '', year: new Date().getFullYear(), category: 'SUV', pricePerDay: 2000,
    pricePerKmOneWay: 12, pricePerKmRoundTrip: 10, minBillingDistance: 250, driverAllowance: 300,
    priceLocalPkg: 2000, priceAirportTransfer: 1500, tollParkingPolicy: 'Toll, parking, and state tax will be charged extra as per actual receipts.',
    features: '', status: 'available', isEnabled: true
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

  // CMS Section Customizer states
  const [cmsPages, setCmsPages] = useState([]);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [selectedCmsKey, setSelectedCmsKey] = useState('hero');
  const [cmsForm, setCmsForm] = useState({ title: '', content: {}, enabled: true, order: 0, seo: { metaTitle: '', metaDescription: '' } });
  const [cmsSubTab, setCmsSubTab] = useState('content'); // 'content' or 'seo'
  
  // Section creation states
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('services');

  // Settings states
  const [settingsForm, setSettingsForm] = useState({
    companyName: '', logo: '', contactDetails: { email: '', phone: '', address: '' },
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
    paymentGateway: { stripePublicKey: '', stripeSecretKey: '', upiId: '', advancePaymentPercent: 20 },
    emailSettings: { smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '' },
    smsSettings: { provider: 'twilio', apiKey: '' },
    seo: { defaultMetaTitle: '', defaultMetaDescription: '' }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayBookings, setSelectedDayBookings] = useState([]);
  const [selectedDayStr, setSelectedDayStr] = useState('');

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('');

  // Broadcaster states
  const [broadcastForm, setBroadcastForm] = useState({ recipientType: 'all', subject: '', message: '' });
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Invoice state
  const [invoiceBooking, setInvoiceBooking] = useState(null);

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
    if (tab === 'reviews') fetchReviews();
    if (tab === 'calendar') fetchBookings();
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
    formData.append('pricePerKmOneWay', carForm.pricePerKmOneWay);
    formData.append('pricePerKmRoundTrip', carForm.pricePerKmRoundTrip);
    formData.append('minBillingDistance', carForm.minBillingDistance);
    formData.append('driverAllowance', carForm.driverAllowance);
    formData.append('priceLocalPkg', carForm.priceLocalPkg);
    formData.append('priceAirportTransfer', carForm.priceAirportTransfer);
    formData.append('tollParkingPolicy', carForm.tollParkingPolicy);
    formData.append('status', carForm.status);
    formData.append('isEnabled', carForm.isEnabled);

    const featuresArray = carForm.features.split(',').map((f) => f.trim()).filter(Boolean);
    featuresArray.forEach((feat) => formData.append('features', feat));

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
        setCarForm({
          make: '', model: '', year: 2026, category: 'SUV', pricePerDay: 2000,
          pricePerKmOneWay: 12, pricePerKmRoundTrip: 10, minBillingDistance: 250, driverAllowance: 300,
          priceLocalPkg: 2000, priceAirportTransfer: 1500, tollParkingPolicy: 'Toll, parking, and state tax will be charged extra as per actual receipts.',
          features: '', status: 'available', isEnabled: true
        });
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
      pricePerDay: car.pricePerDay || 2000,
      pricePerKmOneWay: car.pricePerKmOneWay || 12,
      pricePerKmRoundTrip: car.pricePerKmRoundTrip || 10,
      minBillingDistance: car.minBillingDistance || 250,
      driverAllowance: car.driverAllowance || 300,
      priceLocalPkg: car.priceLocalPkg || 2000,
      priceAirportTransfer: car.priceAirportTransfer || 1500,
      tollParkingPolicy: car.tollParkingPolicy || 'Toll, parking, and state tax will be charged extra as per actual receipts.',
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

  // 5. CMS Customizer Operations
  const fetchCMSPages = async () => {
    setCmsLoading(true);
    try {
      const res = await API.get('/cms/pages/all');
      if (res.data && res.data.success) {
        const sorted = res.data.data.sort((a, b) => a.order - b.order);
        setCmsPages(sorted);
        
        // Match currently selected page
        const activePage = sorted.find(p => p.key === selectedCmsKey) || sorted[0];
        if (activePage) {
          setSelectedCmsKey(activePage.key);
          setCmsForm({
            title: activePage.title,
            content: activePage.content || {},
            enabled: activePage.enabled !== undefined ? activePage.enabled : true,
            order: activePage.order !== undefined ? activePage.order : 0,
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
          content: activePage.content || {},
          enabled: activePage.enabled !== undefined ? activePage.enabled : true,
          order: activePage.order !== undefined ? activePage.order : 0,
          seo: activePage.seo || { metaTitle: '', metaDescription: '' }
        });
      }
    }
  }, [selectedCmsKey, cmsPages]);

  const handleCMSOrderShift = async (idx, direction) => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === cmsPages.length - 1) return;
    
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const currentSection = cmsPages[idx];
    const targetSection = cmsPages[targetIdx];
    
    const tempOrder = currentSection.order;
    currentSection.order = targetSection.order;
    targetSection.order = tempOrder;
    
    setCmsLoading(true);
    try {
      await API.put(`/cms/${currentSection.key}`, { order: currentSection.order });
      await API.put(`/cms/${targetSection.key}`, { order: targetSection.order });
      await fetchCMSPages();
    } catch (err) {
      alert('Failed to swap section ordering.');
    }
    setCmsLoading(false);
  };

  const handleCMSToggleEnabled = async (section) => {
    try {
      const updatedEnabled = !section.enabled;
      const res = await API.put(`/cms/${section.key}`, { enabled: updatedEnabled });
      if (res.data && res.data.success) {
        await fetchCMSPages();
      }
    } catch (err) {
      alert('Failed to change section visibility.');
    }
  };

  const handleCMSDeleteSection = async (key) => {
    if (!window.confirm(`Are you sure you want to delete the "${key}" section?`)) return;
    try {
      const res = await API.delete(`/cms/${key}`);
      if (res.data && res.data.success) {
        alert('Section deleted successfully.');
        setSelectedCmsKey('hero');
        await fetchCMSPages();
      }
    } catch (err) {
      alert('Failed to remove CMS section.');
    }
  };

  const handleAddSectionSubmit = async (e) => {
    e.preventDefault();
    if (!newSectionKey) return;
    
    let defaultContent = {};
    if (newSectionType === 'services') {
      defaultContent = {
        title: 'Our Premium Services',
        subtitle: 'What We Offer',
        items: []
      };
    } else if (newSectionType === 'blogs') {
      defaultContent = {
        title: 'Latest Travel Blogs',
        subtitle: 'Our Blogs',
        items: []
      };
    } else if (newSectionType === 'brochure') {
      defaultContent = {
        title: 'Download Trip Brochure',
        description: 'Get detailed travel itinerary, route maps, and price lists.',
        fileUrl: '',
        buttonText: 'Download Brochure'
      };
    } else {
      defaultContent = {
        text: 'Custom Content value'
      };
    }
    
    try {
      const res = await API.post('/cms', {
        key: newSectionKey.trim().toLowerCase(),
        title: newSectionTitle || newSectionKey,
        content: defaultContent,
        order: cmsPages.length + 1,
        enabled: true
      });
      if (res.data && res.data.success) {
        alert('New section added to CMS customizer!');
        setAddSectionOpen(false);
        setNewSectionKey('');
        setNewSectionTitle('');
        await fetchCMSPages();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create section.');
    }
  };

  const handleInlineFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/cms/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        callback(res.data.data.filePath);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload media files.');
    }
  };

  const handleCMSSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/cms/${selectedCmsKey}`, cmsForm);
      if (res.data && res.data.success) {
        alert('CMS layout customizations saved successfully.');
        await fetchCMSPages();
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
          paymentGateway: data.paymentGateway || { stripePublicKey: '', stripeSecretKey: '', upiId: '', advancePaymentPercent: 20 },
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

  // 7. Reviews Management Actions
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const params = { status: reviewStatusFilter || undefined };
      const res = await API.get('/reviews', { params });
      if (res.data && res.data.success) {
        setReviews(res.data.data.data);
      }
    } catch (err) {}
    setReviewsLoading(false);
  };

  const handleUpdateReviewStatus = async (reviewId, status) => {
    try {
      const res = await API.put(`/reviews/${reviewId}/status`, { status });
      if (res.data && res.data.success) {
        alert(`Review status has been updated to ${status}.`);
        fetchReviews();
      }
    } catch (err) {
      alert('Failed to update review status.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await API.delete(`/reviews/${reviewId}`);
      if (res.data && res.data.success) {
        alert('Review deleted.');
        fetchReviews();
      }
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  // 8. Bulk Broadcaster Notification
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setBroadcastLoading(true);
    setBroadcastResult(null);
    try {
      const res = await API.post('/settings/broadcast', broadcastForm);
      if (res.data && res.data.success) {
        setBroadcastResult(res.data.data);
        alert(res.data.message || 'Notification broadcast completed.');
        setBroadcastForm({ recipientType: 'all', subject: '', message: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch broadcast message.');
    }
    setBroadcastLoading(false);
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-35 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-accent text-white flex flex-col justify-between shrink-0 shadow-xl lg:shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out`}>
        <div>
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="font-extrabold text-sm tracking-wide">PK Gupta</h2>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Admin Console</p>
              </div>
            </div>
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
              { id: 'calendar', label: 'Booking Calendar', icon: Calendar },
              { id: 'reviews', label: 'Customer Reviews', icon: Star },
              { id: 'broadcaster', label: 'Broadcaster Log', icon: Megaphone },
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
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      ].map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold text-accent">
                          <span>{s.label}</span>
                          <span className="flex items-center space-x-2">
                            <span className="w-12 h-2.5 bg-gray-100 rounded-full overflow-hidden block">
                              <span className={`h-full block ${s.color}`} style={{ width: `${(s.count / (analytics.metrics.totalBookings || 1)) * 100}%` }}></span>
                            </span>
                            <span className="w-6 text-right">{s.count}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center space-x-1.5">
                      <Car className="w-4 h-4 text-primary" />
                      <span>Most Booked Fleet Vehicles</span>
                    </h3>
                    <div className="space-y-4">
                      {(analytics.mostBookedCars || []).slice(0, 3).map((item, idx) => {
                        const totalB = analytics.metrics.totalBookings || 1;
                        const pct = Math.min((item.bookingCount / totalB) * 100, 100);
                        return (
                          <div key={idx} className="space-y-1.5 text-xs text-accent">
                            <div className="flex justify-between font-semibold">
                              <span>{item.car?.make} {item.car?.model}</span>
                              <span className="text-secondary">{item.bookingCount} bookings ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SVG Revenue Charts Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-sm text-accent uppercase tracking-wider flex items-center space-x-1.5">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span>Sales & Revenue Trends (Month-on-Month)</span>
                    </h3>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider">Live Metrics</span>
                  </div>
                  <div className="w-full pt-4">
                    {(() => {
                      const julRevenue = analytics.metrics.totalRevenue || 0;
                      const mockMonths = [
                        { name: 'Feb', value: 15000 },
                        { name: 'Mar', value: 25000 },
                        { name: 'Apr', value: 18000 },
                        { name: 'May', value: 32000 },
                        { name: 'Jun', value: 45000 },
                        { name: 'Jul', value: julRevenue }
                      ];
                      
                      const maxValue = Math.max(...mockMonths.map(m => m.value), 50000);
                      const chartHeight = 160;
                      const chartWidth = 600;
                      const paddingX = 40;
                      const paddingY = 30;
                      
                      const points = mockMonths.map((m, idx) => {
                        const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (mockMonths.length - 1);
                        const y = chartHeight - paddingY - (m.value / maxValue) * (chartHeight - paddingY * 2);
                        return { x, y, name: m.name, value: m.value };
                      });
                      
                      const pathD = points.reduce((path, p, idx) => {
                        return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
                      }, '');

                      const fillD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

                      return (
                        <div className="relative">
                          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Horizontal gridlines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                              const y = paddingY + ratio * (chartHeight - paddingY * 2);
                              return (
                                <line key={i} x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f3f4f6" strokeWidth={1} />
                              );
                            })}
                            
                            {/* Baseline */}
                            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e5e7eb" strokeWidth={1.5} />
                            
                            {/* Filled Path */}
                            <path d={fillD} fill="url(#chartGrad)" />
                            
                            {/* Line Path */}
                            <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Data points */}
                            {points.map((p, idx) => (
                              <g key={idx} className="group cursor-pointer">
                                <circle cx={p.x} cy={p.y} r={5} fill="#ffffff" stroke="#2563eb" strokeWidth={3} className="transition-all hover:scale-150" />
                                <text x={p.x} y={chartHeight - 12} textAnchor="middle" className="text-[10px] fill-gray-500 font-bold">{p.name}</text>
                                <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] fill-accent font-extrabold bg-white px-1">
                                  ₹{p.value >= 1000 ? `${(p.value/1000).toFixed(1)}k` : p.value}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400">Failed to load analytical metrics.</p>
            )}
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">User Accounts Manager</h1>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-wrap gap-3">
                <input 
                  type="text" 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent w-full sm:w-64"
                />
                <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="driver">Driver</option>
                </select>
                <select 
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button onClick={fetchUsers} className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
                  Search
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
                        <th className="p-4">Customer</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">User Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4">
                            <p className="font-bold">{u.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                          </td>
                          <td className="p-4 font-semibold">{u.phone || 'N/A'}</td>
                          <td className="p-4 capitalize font-semibold">{u.role}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {u._id !== adminUser?._id && (
                              <button 
                                onClick={() => handleToggleUserStatus(u._id, u.status)}
                                className={`px-2.5 py-1.5 rounded text-[10px] font-bold border cursor-pointer ${
                                  u.status === 'active' 
                                    ? 'bg-red-50 text-secondary border-red-200 hover:bg-red-100' 
                                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                }`}
                              >
                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
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

        {/* TAB 3: CARS */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-accent">Fleet Inventory</h1>
              <button 
                onClick={() => { setEditingCar(null); setCarForm({ make: '', model: '', year: 2026, category: 'SUV', pricePerDay: 2000, features: '', status: 'available', isEnabled: true }); setCarFiles([]); setCarModalOpen(true); }}
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {carModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-accent">
                      {editingCar ? 'Modify Vehicle details' : 'Register New Fleet Vehicle'}
                    </h3>
                    <button onClick={() => setCarModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCarSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Make / Brand</label>
                        <input 
                          type="text" 
                          required
                          value={carForm.make}
                          onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                          placeholder="e.g. Toyota"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Model</label>
                        <input 
                          type="text" 
                          required
                          value={carForm.model}
                          onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                          placeholder="e.g. Innova"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Year</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.year}
                          onChange={(e) => setCarForm({ ...carForm, year: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Category</label>
                        <select
                          value={carForm.category}
                          onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        >
                          <option value="SUV">SUV</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Luxury">Luxury</option>
                        </select>
                      </div>
                    </div>

                     <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Price Per Day (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.pricePerDay}
                          onChange={(e) => setCarForm({ ...carForm, pricePerDay: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">One-Way / KM (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.pricePerKmOneWay}
                          onChange={(e) => setCarForm({ ...carForm, pricePerKmOneWay: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Round-Trip / KM (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.pricePerKmRoundTrip}
                          onChange={(e) => setCarForm({ ...carForm, pricePerKmRoundTrip: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Min Distance (KM)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.minBillingDistance}
                          onChange={(e) => setCarForm({ ...carForm, minBillingDistance: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Driver Allowance (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.driverAllowance}
                          onChange={(e) => setCarForm({ ...carForm, driverAllowance: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Status</label>
                        <select
                          value={carForm.status}
                          onChange={(e) => setCarForm({ ...carForm, status: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable / Booked</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Local Package Rate (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.priceLocalPkg}
                          onChange={(e) => setCarForm({ ...carForm, priceLocalPkg: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Airport Transfer Rate (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={carForm.priceAirportTransfer}
                          onChange={(e) => setCarForm({ ...carForm, priceAirportTransfer: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Toll, Parking & State Tax Policy</label>
                      <input 
                        type="text" 
                        required
                        value={carForm.tollParkingPolicy}
                        onChange={(e) => setCarForm({ ...carForm, tollParkingPolicy: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Features (Comma Separated)</label>
                      <textarea 
                        value={carForm.features}
                        onChange={(e) => setCarForm({ ...carForm, features: e.target.value })}
                        placeholder="AC, Leather Seats, Sunroof..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Vehicle Photo files</label>
                      <input 
                        type="file" 
                        multiple
                        onChange={(e) => setCarFiles(e.target.files)}
                        className="text-xs text-gray-500 w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={carForm.isEnabled}
                        onChange={(e) => setCarForm({ ...carForm, isEnabled: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                        id="carIsEnabled"
                      />
                      <label htmlFor="carIsEnabled" className="text-xs font-semibold text-accent">Display Publicly on Website Catalog</label>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button type="submit" className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm cursor-pointer">
                        Save
                      </button>
                      <button type="button" onClick={() => setCarModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                        <th className="p-4">Car Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Pricing Model</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <tr key={car._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4">
                            <p className="font-bold">{car.make} {car.model}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Year: {car.year}</p>
                          </td>
                          <td className="p-4 font-semibold">{car.category}</td>
                          <td className="p-4 text-xs">
                            <p className="font-bold text-secondary">OW: ₹{car.pricePerKmOneWay}/KM</p>
                            <p className="font-bold text-primary">RT: ₹{car.pricePerKmRoundTrip}/KM</p>
                          </td>
                          <td className="p-4 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${car.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {car.status}
                            </span>
                          </td>
                          <td className="p-4 font-semibold">
                            {car.isEnabled ? 'Public' : 'Hidden'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => handleViewCarDetails(car)} className="p-1 text-gray-400 hover:text-primary rounded inline-flex cursor-pointer" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleEditCarClick(car)} className="p-1 text-gray-400 hover:text-primary rounded inline-flex cursor-pointer" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteCar(car._id)} className="p-1 text-gray-400 hover:text-secondary rounded inline-flex cursor-pointer" title="Delete"><Trash className="w-4 h-4" /></button>
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
                <button onClick={fetchBookings} className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
                  Filter
                </button>
                <button 
                  onClick={() => {
                    const headers = 'Customer Name,Email,Rental Item,Start Date,End Date,Amount,Driver,Status,Payment Status\n';
                    const rows = bookings.map(b => {
                      const name = b.user?.name || 'Deleted User';
                      const email = b.user?.email || '';
                      const item = b.bookingType === 'car' ? `${b.car?.make} ${b.car?.model}` : b.packageDetails?.packageName || '';
                      const start = new Date(b.startDate).toLocaleDateString();
                      const end = new Date(b.endDate).toLocaleDateString();
                      const amount = b.totalAmount || 0;
                      const driver = b.driverAssigned || 'None';
                      const status = b.status || '';
                      const payStatus = b.paymentStatus || '';
                      return `"${name}","${email}","${item}","${start}","${end}",${amount},"${driver}","${status}","${payStatus}"`;
                    }).join('\n');
                    
                    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-accent hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer flex items-center space-x-1.5 sm:ml-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
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
                        <th className="p-4">Rental Item</th>
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
                            {b.user?.phone && <p className="text-[10px] text-gray-400 font-semibold">{b.user.phone}</p>}
                          </td>
                          <td className="p-4">
                            <p className="font-bold">{b.bookingType === 'car' ? `${b.car?.make} ${b.car?.model}` : b.packageDetails?.packageName}</p>
                            {b.bookingType === 'car' && (
                              <p className="text-[10px] text-primary font-bold uppercase mt-0.5">
                                {b.tripType || 'One-Way'} • {b.fromCity || 'Jaipur'} to {b.toCity || 'Local'} {b.distance ? `(${b.distance} KM)` : ''}
                              </p>
                            )}
                          </td>
                          <td className="p-4">
                            <p>{new Date(b.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">to {new Date(b.endDate).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 text-xs">
                            <p className="font-bold text-secondary text-sm">₹{b.totalAmount}</p>
                            {b.advancePaid ? (
                              <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                Adv: ₹{b.advancePaid} {b.transactionId ? `(Ref: ${b.transactionId})` : ''}
                              </p>
                            ) : null}
                          </td>
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
                                  className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200 cursor-pointer"
                                  title="Approve & Confirm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateBooking(b._id, 'rejected', 'pending')}
                                  className="p-1.5 bg-red-50 text-secondary rounded hover:bg-red-100 border border-red-200 cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                               <div className="flex items-center justify-end space-x-1.5">
                                 <button
                                   onClick={() => handleUpdateBooking(b._id, 'cancelled', 'refunded')}
                                   className="px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-secondary text-[10px] cursor-pointer"
                                 >
                                   Cancel & Refund
                                 </button>
                                 <button
                                   onClick={() => setInvoiceBooking(b)}
                                   className="p-1 bg-blue-50 text-primary hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                                   title="Print Invoice"
                                 >
                                   <Printer className="w-3.5 h-3.5" />
                                 </button>
                               </div>
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
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Driver</span>
              </button>
            </div>

            {driverModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-accent">
                      {editingDriver ? 'Modify Driver Details' : 'Register New Driver'}
                    </h3>
                    <button onClick={() => setDriverModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleDriverSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Full Name</label>
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
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Phone Number</label>
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
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">License Number</label>
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
                       <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Status</label>
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
                       <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Email Address (For Login)</label>
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
                       <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
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
                      <button type="submit" className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm cursor-pointer animate-all">
                        Save
                      </button>
                      <button type="button" onClick={() => setDriverModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                            <button onClick={() => handleViewDriverDetails(drv)} className="p-1 text-gray-400 hover:text-primary rounded cursor-pointer" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingDriver(drv); setDriverForm({ name: drv.name, phone: drv.phone, licenseNumber: drv.licenseNumber, status: drv.status, email: drv.email || '', password: '' }); setDriverModalOpen(true); }} className="p-1 text-gray-400 hover:text-primary rounded cursor-pointer" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteDriver(drv._id)} className="p-1 text-gray-400 hover:text-secondary rounded cursor-pointer" title="Delete"><Trash className="w-4 h-4" /></button>
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

        {/* TAB 5: CMS OVERHAUL */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">CMS Content & Page Layout Manager</h1>

            {/* Layout Creation Modal */}
            {addSectionOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-150 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-accent">Create New Page Section</h3>
                    <button onClick={() => setAddSectionOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleAddSectionSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Section Identifier Key (lowercase, unique)</label>
                      <input 
                        type="text" 
                        required
                        value={newSectionKey}
                        onChange={(e) => setNewSectionKey(e.target.value)}
                        placeholder="e.g. travel_services"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Section Administrative Title</label>
                      <input 
                        type="text" 
                        required
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="e.g. Travel Services Description"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Section Template Type</label>
                      <select
                        value={newSectionType}
                        onChange={(e) => setNewSectionType(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                      >
                        <option value="services">Services Grid</option>
                        <option value="blogs">Blogs Slider</option>
                        <option value="brochure">Brochure Download Banner</option>
                        <option value="custom">Generic Text/Content</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button type="submit" className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm cursor-pointer">
                        Add Section
                      </button>
                      <button type="button" onClick={() => setAddSectionOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* CMS Sidebar Panel */}
              <div className="xl:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Page Sections</h3>
                  <button 
                    onClick={() => setAddSectionOpen(true)}
                    className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {cmsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {cmsPages.map((page, idx) => (
                      <div 
                        key={page._id}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${
                          selectedCmsKey === page.key 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedCmsKey(page.key)}
                        >
                          <p className="text-xs font-bold text-accent capitalize">{page.key.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{page.title}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            disabled={idx === 0}
                            onClick={() => handleCMSOrderShift(idx, 'up')}
                            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-accent rounded disabled:opacity-30 cursor-pointer"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={idx === cmsPages.length - 1}
                            onClick={() => handleCMSOrderShift(idx, 'down')}
                            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-accent rounded disabled:opacity-30 cursor-pointer"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleCMSToggleEnabled(page)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer ${
                              page.enabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-secondary'
                            }`}
                          >
                            {page.enabled ? 'Live' : 'Hidden'}
                          </button>
                          {['navbar', 'footer', 'hero', 'metrics', 'steps', 'popular_trips', 'faq', 'testimonials'].indexOf(page.key) === -1 && (
                            <button 
                              onClick={() => handleCMSDeleteSection(page.key)}
                              className="p-1 text-gray-400 hover:text-secondary rounded"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CMS Editor form */}
              <div className="xl:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {cmsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <form onSubmit={handleCMSSubmit} className="space-y-6">
                    <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                      <div>
                        <h2 className="font-extrabold text-base text-accent capitalize">Edit {selectedCmsKey.replace(/_/g, ' ')}</h2>
                        <p className="text-[10px] text-gray-400 mt-0.5">Customize fields and layout structures for this section.</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">Key: {selectedCmsKey}</span>
                    </div>

                    {/* Sub Tab Navigation */}
                    <div className="flex space-x-2 border-b border-gray-100 pb-2">
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('content')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                          cmsSubTab === 'content'
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-400 hover:text-accent hover:bg-gray-50'
                        }`}
                      >
                        📝 Section Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('seo')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                          cmsSubTab === 'seo'
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-400 hover:text-accent hover:bg-gray-50'
                        }`}
                      >
                        🔍 SEO & Search Settings
                      </button>
                    </div>

                    {cmsSubTab === 'content' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Administrative Title</label>
                          <input 
                            type="text" 
                            required
                            value={cmsForm.title}
                            onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                          />
                        </div>

                    {/* DYNAMIC FORM RENDERERS */}
                    
                    {/* 1. Navbar fields */}
                    {selectedCmsKey === 'navbar' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Logo Size Size (height in units)</label>
                            <input 
                              type="number"
                              value={cmsForm.content.logoSize || 14}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, logoSize: Number(e.target.value) }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Navigation Links</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newLinks = [...(cmsForm.content.links || [])];
                                newLinks.push({ label: '', url: '' });
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, links: newLinks } });
                              }}
                              className="bg-primary hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Link</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(cmsForm.content.links || []).map((link, idx) => (
                              <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
                                <input 
                                  type="text" 
                                  placeholder="Link text"
                                  value={link.label || ''}
                                  onChange={(e) => {
                                    const newLinks = [...cmsForm.content.links];
                                    newLinks[idx].label = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, links: newLinks } });
                                  }}
                                  className="w-1/2 px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Link URL"
                                  value={link.url || ''}
                                  onChange={(e) => {
                                    const newLinks = [...cmsForm.content.links];
                                    newLinks[idx].url = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, links: newLinks } });
                                  }}
                                  className="w-1/2 px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newLinks = cmsForm.content.links.filter((_, i) => i !== idx);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, links: newLinks } });
                                  }}
                                  className="text-red-500 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Hero fields */}
                    {selectedCmsKey === 'hero' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Title Heading</label>
                            <textarea 
                              rows={2}
                              value={cmsForm.content.title || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Subheading Description</label>
                            <textarea 
                              rows={2}
                              value={cmsForm.content.subtitle || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, subtitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Trust Badge Text</label>
                            <input 
                              type="text"
                              value={cmsForm.content.trustBadge || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, trustBadge: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Cancellation Policy Badge Text</label>
                            <input 
                              type="text"
                              value={cmsForm.content.cancellationText || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, cancellationText: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Search Button CTA Text</label>
                            <input 
                              type="text"
                              value={cmsForm.content.ctaText || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, ctaText: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Background Media File (Image/Video)</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text"
                                readOnly
                                value={cmsForm.content.bannerImage || ''}
                                className="flex-1 px-3 py-2 bg-gray-150 border border-gray-200 rounded-lg text-xs focus:outline-none text-accent font-mono"
                              />
                              <label className="bg-primary hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                                <Upload className="w-3.5 h-3.5 inline mr-1" />
                                Upload
                                <input 
                                  type="file" 
                                  className="hidden"
                                  onChange={(e) => handleInlineFileUpload(e, (path) => {
                                    setCmsForm({
                                      ...cmsForm,
                                      content: { ...cmsForm.content, bannerImage: path }
                                    });
                                  })}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Booking Widget Switches</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                            {[
                              { label: 'One Way tab', field: 'showOneWay' },
                              { label: 'Round Trip tab', field: 'showRoundTrip' },
                              { label: 'Local tab', field: 'showLocal' },
                              { label: 'Airport tab', field: 'showAirport' }
                            ].map((w) => (
                              <div key={w.field} className="flex items-center space-x-2">
                                <input 
                                  type="checkbox"
                                  checked={cmsForm.content.bookingForm?.[w.field] !== false}
                                  onChange={(e) => setCmsForm({
                                    ...cmsForm,
                                    content: { 
                                      ...cmsForm.content, 
                                      bookingForm: { 
                                        ...(cmsForm.content.bookingForm || {}), 
                                        [w.field]: e.target.checked 
                                      } 
                                    }
                                  })}
                                  className="rounded text-primary focus:ring-primary h-4 w-4"
                                  id={w.field}
                                />
                                <label htmlFor={w.field} className="text-xs font-semibold text-accent">{w.label}</label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cab Types Editor */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Cab Types in Booking Dropdown</label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentCabTypes = cmsForm.content.bookingForm?.cabTypes || [
                                  { value: 'SUV', label: 'SUV - 6 Seater (Innova, Ertiga)' },
                                  { value: 'Sedan', label: 'Sedan - 4 Seater (Dzire, Etios)' },
                                  { value: 'Luxury', label: 'Luxury - Elite Seater (Fortuner, E-Class)' }
                                ];
                                const newCabTypes = [...currentCabTypes, { value: '', label: '' }];
                                setCmsForm({
                                  ...cmsForm,
                                  content: {
                                    ...cmsForm.content,
                                    bookingForm: {
                                      ...(cmsForm.content.bookingForm || {}),
                                      cabTypes: newCabTypes
                                    }
                                  }
                                });
                              }}
                              className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Cab Type</span>
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {(cmsForm.content.bookingForm?.cabTypes || [
                              { value: 'SUV', label: 'SUV - 6 Seater (Innova, Ertiga)' },
                              { value: 'Sedan', label: 'Sedan - 4 Seater (Dzire, Etios)' },
                              { value: 'Luxury', label: 'Luxury - Elite Seater (Fortuner, E-Class)' }
                            ]).map((ct, idx) => (
                              <div key={idx} className="flex items-center space-x-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                                <input 
                                  type="text"
                                  placeholder="Value (e.g. SUV)"
                                  value={ct.value || ''}
                                  onChange={(e) => {
                                    const newCabTypes = [...(cmsForm.content.bookingForm?.cabTypes || [
                                      { value: 'SUV', label: 'SUV - 6 Seater (Innova, Ertiga)' },
                                      { value: 'Sedan', label: 'Sedan - 4 Seater (Dzire, Etios)' },
                                      { value: 'Luxury', label: 'Luxury - Elite Seater (Fortuner, E-Class)' }
                                    ])];
                                    newCabTypes[idx].value = e.target.value;
                                    setCmsForm({
                                      ...cmsForm,
                                      content: {
                                        ...cmsForm.content,
                                        bookingForm: {
                                          ...(cmsForm.content.bookingForm || {}),
                                          cabTypes: newCabTypes
                                        }
                                      }
                                    });
                                  }}
                                  className="w-1/3 px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-accent font-bold"
                                />
                                <input 
                                  type="text"
                                  placeholder="Display Label (e.g. SUV - 6 Seater)"
                                  value={ct.label || ''}
                                  onChange={(e) => {
                                    const newCabTypes = [...(cmsForm.content.bookingForm?.cabTypes || [
                                      { value: 'SUV', label: 'SUV - 6 Seater (Innova, Ertiga)' },
                                      { value: 'Sedan', label: 'Sedan - 4 Seater (Dzire, Etios)' },
                                      { value: 'Luxury', label: 'Luxury - Elite Seater (Fortuner, E-Class)' }
                                    ])];
                                    newCabTypes[idx].label = e.target.value;
                                    setCmsForm({
                                      ...cmsForm,
                                      content: {
                                        ...cmsForm.content,
                                        bookingForm: {
                                          ...(cmsForm.content.bookingForm || {}),
                                          cabTypes: newCabTypes
                                        }
                                      }
                                    });
                                  }}
                                  className="w-2/3 px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-accent font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCabTypes = (cmsForm.content.bookingForm?.cabTypes || [
                                      { value: 'SUV', label: 'SUV - 6 Seater (Innova, Ertiga)' },
                                      { value: 'Sedan', label: 'Sedan - 4 Seater (Dzire, Etios)' },
                                      { value: 'Luxury', label: 'Luxury - Elite Seater (Fortuner, E-Class)' }
                                    ]).filter((_, i) => i !== idx);
                                    setCmsForm({
                                      ...cmsForm,
                                      content: {
                                        ...cmsForm.content,
                                        bookingForm: {
                                          ...(cmsForm.content.bookingForm || {}),
                                          cabTypes: newCabTypes
                                        }
                                      }
                                    });
                                  }}
                                  className="text-red-500 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* 3. Metrics/Statistics fields */}
                    {selectedCmsKey === 'metrics' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Statistics Values</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newStats = [...(cmsForm.content.statistics || [])];
                              newStats.push({ value: '', label: '' });
                              setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statistics: newStats } });
                            }}
                            className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Stat</span>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(cmsForm.content.statistics || []).map((stat, idx) => (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <input 
                                type="text"
                                placeholder="Value (e.g. 50,000+)"
                                value={stat.value || ''}
                                onChange={(e) => {
                                  const newStats = [...cmsForm.content.statistics];
                                  newStats[idx].value = e.target.value;
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statistics: newStats } });
                                }}
                                className="w-1/2 px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-black"
                              />
                              <input 
                                type="text"
                                placeholder="Label (e.g. Happy Riders)"
                                value={stat.label || ''}
                                onChange={(e) => {
                                  const newStats = [...cmsForm.content.statistics];
                                  newStats[idx].label = e.target.value;
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statistics: newStats } });
                                }}
                                className="w-1/2 px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newStats = cmsForm.content.statistics.filter((_, i) => i !== idx);
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statistics: newStats } });
                                }}
                                className="text-red-500 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Steps guide fields */}
                    {selectedCmsKey === 'steps' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Process Title</label>
                            <input 
                              type="text"
                              value={cmsForm.content.title || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Process Subtitle</label>
                            <input 
                              type="text"
                              value={cmsForm.content.subtitle || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, subtitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Process Steps</label>
                          {(cmsForm.content.items || []).map((step, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-primary text-white font-bold w-6 h-6 rounded-full flex items-center justify-center">{step.num || idx + 1}</span>
                                <input 
                                  type="text"
                                  placeholder="Step Title"
                                  value={step.title || ''}
                                  onChange={(e) => {
                                    const newItems = [...cmsForm.content.items];
                                    newItems[idx].title = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                  }}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-bold"
                                />
                              </div>
                              <textarea 
                                placeholder="Description"
                                rows={2}
                                value={step.desc || ''}
                                onChange={(e) => {
                                  const newItems = [...cmsForm.content.items];
                                  newItems[idx].desc = e.target.value;
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Services fields */}
                    {selectedCmsKey === 'services' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Services Title</label>
                            <input 
                              type="text"
                              value={cmsForm.content.title || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Services Subtitle</label>
                            <input 
                              type="text"
                              value={cmsForm.content.subtitle || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, subtitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Service Cards List</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...(cmsForm.content.items || [])];
                                newItems.push({ title: '', desc: '', icon: 'Car' });
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                              }}
                              className="bg-primary hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Service</span>
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {(cmsForm.content.items || []).map((serv, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative space-y-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = cmsForm.content.items.filter((_, i) => i !== idx);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                  }}
                                  className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Service Title</label>
                                    <input 
                                      type="text" 
                                      value={serv.title || ''}
                                      onChange={(e) => {
                                        const newItems = [...cmsForm.content.items];
                                        newItems[idx].title = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Icon Code (Lucide)</label>
                                    <select
                                      value={serv.icon || 'Car'}
                                      onChange={(e) => {
                                        const newItems = [...cmsForm.content.items];
                                        newItems[idx].icon = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-semibold"
                                    >
                                      <option value="Car">Car</option>
                                      <option value="Navigation">Map / Navigation</option>
                                      <option value="Plane">Airplane</option>
                                      <option value="Award">Award Badge</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Short Description</label>
                                  <textarea 
                                    rows={2}
                                    value={serv.desc || ''}
                                    onChange={(e) => {
                                      const newItems = [...cmsForm.content.items];
                                      newItems[idx].desc = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. Popular trips fields (Destinations) */}
                    {selectedCmsKey === 'popular_trips' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Section Title</label>
                            <input 
                              type="text"
                              value={cmsForm.content.title || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Section Subtitle</label>
                            <input 
                              type="text"
                              value={cmsForm.content.subtitle || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, subtitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Trips Section Description</label>
                          <textarea 
                            rows={2}
                            value={cmsForm.content.description || ''}
                            onChange={(e) => setCmsForm({
                              ...cmsForm,
                              content: { ...cmsForm.content, description: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Popular Routes & Fares</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newTrips = [...(cmsForm.content.trips || [])];
                                newTrips.push({ route: '', distance: '', duration: '', oneWayPrice: 0, roundTripPrice: 0, image: '' });
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                              }}
                              className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Route</span>
                            </button>
                          </div>

                          <div className="space-y-4">
                            {(cmsForm.content.trips || []).map((trip, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative space-y-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTrips = cmsForm.content.trips.filter((_, i) => i !== idx);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                  }}
                                  className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1">Route (e.g. Delhi to Jaipur)</label>
                                    <input 
                                      type="text"
                                      required
                                      value={trip.route || ''}
                                      onChange={(e) => {
                                        const newTrips = [...cmsForm.content.trips];
                                        newTrips[idx].route = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1">Distance</label>
                                    <input 
                                      type="text"
                                      required
                                      value={trip.distance || ''}
                                      onChange={(e) => {
                                        const newTrips = [...cmsForm.content.trips];
                                        newTrips[idx].distance = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1">Duration</label>
                                    <input 
                                      type="text"
                                      required
                                      value={trip.duration || ''}
                                      onChange={(e) => {
                                        const newTrips = [...cmsForm.content.trips];
                                        newTrips[idx].duration = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1">One-Way Fare (Rs.)</label>
                                    <input 
                                      type="number"
                                      required
                                      value={trip.oneWayPrice || 0}
                                      onChange={(e) => {
                                        const newTrips = [...cmsForm.content.trips];
                                        newTrips[idx].oneWayPrice = Number(e.target.value);
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-bold text-secondary"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 mb-1">Round-Trip Fare (Rs.)</label>
                                    <input 
                                      type="number"
                                      required
                                      value={trip.roundTripPrice || 0}
                                      onChange={(e) => {
                                        const newTrips = [...cmsForm.content.trips];
                                        newTrips[idx].roundTripPrice = Number(e.target.value);
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, trips: newTrips } });
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-bold text-primary"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. FAQ fields */}
                    {selectedCmsKey === 'faq' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-500 uppercase">FAQ Questions</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...(cmsForm.content.questions || [])];
                              newQuestions.push({ q: '', a: '' });
                              setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                            }}
                            className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add FAQ</span>
                          </button>
                        </div>
                        <div className="space-y-4">
                          {(cmsForm.content.questions || []).map((faqItem, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm relative space-y-3 hover:border-primary/40 hover:shadow transition-all duration-200">
                              <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">FAQ #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQuestions = cmsForm.content.questions.filter((_, i) => i !== idx);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                                  }}
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Delete FAQ"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Question</label>
                                <input 
                                  type="text" 
                                  required
                                  value={faqItem.q || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...cmsForm.content.questions];
                                    newQuestions[idx].q = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Answer</label>
                                <textarea 
                                  rows={2}
                                  required
                                  value={faqItem.a || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...cmsForm.content.questions];
                                    newQuestions[idx].a = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, questions: newQuestions } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-primary text-accent leading-relaxed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 8. Testimonials reviews fields */}
                    {selectedCmsKey === 'testimonials' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Customer Reviews</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newReviews = [...(cmsForm.content.reviews || [])];
                              newReviews.push({ name: '', rating: 5, review: '' });
                              setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                            }}
                            className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Review</span>
                          </button>
                        </div>
                        <div className="space-y-4">
                          {(cmsForm.content.reviews || []).map((rev, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative space-y-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const newReviews = cmsForm.content.reviews.filter((_, i) => i !== idx);
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                                }}
                                className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[9px] font-bold text-gray-400 mb-1">Customer Name</label>
                                  <input 
                                    type="text" 
                                    required
                                    value={rev.name || ''}
                                    onChange={(e) => {
                                      const newReviews = [...cmsForm.content.reviews];
                                      newReviews[idx].name = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-gray-400 mb-1">Rating (1 to 5)</label>
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
                                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent font-semibold"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 mb-1">Review Statement</label>
                                <textarea 
                                  rows={2}
                                  required
                                  value={rev.review || ''}
                                  onChange={(e) => {
                                    const newReviews = [...cmsForm.content.reviews];
                                    newReviews[idx].review = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, reviews: newReviews } });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 9. Blogs section fields */}
                    {selectedCmsKey === 'blogs' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Blogs Title</label>
                            <input 
                              type="text"
                              value={cmsForm.content.title || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Blogs Subtitle</label>
                            <input 
                              type="text"
                              value={cmsForm.content.subtitle || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, subtitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Blog Articles List</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...(cmsForm.content.items || [])];
                                newItems.push({ title: '', desc: '', date: new Date().toISOString().split('T')[0], image: '', slug: '', readTime: '', seoTitle: '', seoDesc: '' });
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                              }}
                              className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Blog</span>
                            </button>
                          </div>

                          <div className="space-y-6">
                            {(cmsForm.content.items || []).map((blog, idx) => (
                              <div key={idx} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative space-y-4 hover:border-primary/40 hover:shadow transition-all duration-200">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-md">Article #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = cmsForm.content.items.filter((_, i) => i !== idx);
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="Delete Article"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Blog Title</label>
                                    <input 
                                      type="text" 
                                      value={blog.title || ''}
                                      onChange={(e) => {
                                        const newItems = [...cmsForm.content.items];
                                        newItems[idx].title = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                      }}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Date</label>
                                    <input 
                                      type="date" 
                                      value={blog.date || ''}
                                      onChange={(e) => {
                                        const newItems = [...cmsForm.content.items];
                                        newItems[idx].date = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                      }}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">URL Slug (e.g. jaipur-travel-guide)</label>
                                    <input 
                                      type="text" 
                                      value={blog.slug || ''}
                                      onChange={(e) => {
                                        const newItems = [...cmsForm.content.items];
                                        newItems[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                      }}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                                      placeholder="custom-url-slug"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Estimated Read Time</label>
                                    <input 
                                      type="text" 
                                      value={blog.readTime || ''}
                                      onChange={(e) => {
                                        const newItems = [...cmsForm.content.items];
                                        newItems[idx].readTime = e.target.value;
                                        setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                      }}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                                      placeholder="e.g. 5 min read"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Blog Image File</label>
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="text"
                                      readOnly
                                      value={blog.image || ''}
                                      className="flex-1 px-3 py-2 bg-gray-150 border border-gray-200 rounded-lg text-xs text-accent font-mono"
                                    />
                                    <label className="bg-primary hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors">
                                      <Upload className="w-3.5 h-3.5 inline mr-1" />
                                      Upload Image
                                      <input 
                                        type="file" 
                                        className="hidden"
                                        onChange={(e) => handleInlineFileUpload(e, (path) => {
                                          const newItems = [...cmsForm.content.items];
                                          newItems[idx].image = path;
                                          setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                        })}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Blog Text Content</label>
                                  <textarea 
                                    rows={4}
                                    value={blog.desc || ''}
                                    onChange={(e) => {
                                      const newItems = [...cmsForm.content.items];
                                      newItems[idx].desc = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent leading-relaxed"
                                    placeholder="Write the full blog article or description here..."
                                  />
                                </div>

                                {/* Article SEO Sub-Section */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3">
                                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">Article SEO Meta Configurations</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">SEO Title Override</label>
                                      <input 
                                        type="text" 
                                        value={blog.seoTitle || ''}
                                        onChange={(e) => {
                                          const newItems = [...cmsForm.content.items];
                                          newItems[idx].seoTitle = e.target.value;
                                          setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                        }}
                                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                                        placeholder="Defaults to Blog Title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">SEO Meta Description</label>
                                      <input 
                                        type="text" 
                                        value={blog.seoDesc || ''}
                                        onChange={(e) => {
                                          const newItems = [...cmsForm.content.items];
                                          newItems[idx].seoDesc = e.target.value;
                                          setCmsForm({ ...cmsForm, content: { ...cmsForm.content, items: newItems } });
                                        }}
                                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none text-accent"
                                        placeholder="Brief SEO summary of article"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 10. Brochure fields */}
                    {selectedCmsKey === 'brochure' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Brochure Heading</label>
                          <input 
                            type="text"
                            value={cmsForm.content.title || ''}
                            onChange={(e) => setCmsForm({
                              ...cmsForm,
                              content: { ...cmsForm.content, title: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Brochure Description</label>
                          <textarea 
                            rows={3}
                            value={cmsForm.content.description || ''}
                            onChange={(e) => setCmsForm({
                              ...cmsForm,
                              content: { ...cmsForm.content, description: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Button CTA Text</label>
                            <input 
                              type="text"
                              value={cmsForm.content.buttonText || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, buttonText: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Brochure PDF Document File</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text"
                                readOnly
                                value={cmsForm.content.fileUrl || ''}
                                className="flex-1 px-3 py-2 bg-gray-150 border border-gray-200 rounded-lg text-xs text-accent font-mono"
                              />
                              <label className="bg-primary hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-3.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                                <Upload className="w-3.5 h-3.5 inline mr-1" />
                                Upload File
                                <input 
                                  type="file" 
                                  className="hidden"
                                  onChange={(e) => handleInlineFileUpload(e, (path) => {
                                    setCmsForm({
                                      ...cmsForm,
                                      content: { ...cmsForm.content, fileUrl: path }
                                    });
                                  })}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 11. Footer fields */}
                    {selectedCmsKey === 'footer' && cmsForm.content && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Footer About Paragraph</label>
                          <textarea 
                            rows={3}
                            value={cmsForm.content.aboutText || ''}
                            onChange={(e) => setCmsForm({
                              ...cmsForm,
                              content: { ...cmsForm.content, aboutText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Brochure Button Text</label>
                            <input 
                              type="text"
                              value={cmsForm.content.brochureText || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, brochureText: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Brochure URL Link</label>
                            <input 
                              type="text"
                              value={cmsForm.content.brochureUrl || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                content: { ...cmsForm.content, brochureUrl: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Footer Policies Bullets</label>
                            <button
                              type="button"
                              onClick={() => {
                                const newPols = [...(cmsForm.content.policies || [])];
                                newPols.push('');
                                setCmsForm({ ...cmsForm, content: { ...cmsForm.content, policies: newPols } });
                              }}
                              className="bg-primary hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Policy</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(cmsForm.content.policies || []).map((pol, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={pol || ''}
                                  onChange={(e) => {
                                    const newPols = [...cmsForm.content.policies];
                                    newPols[idx] = e.target.value;
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, policies: newPols } });
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-accent font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPols = cmsForm.content.policies.filter((_, i) => i !== idx);
                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, policies: newPols } });
                                  }}
                                  className="text-red-500 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 12. Generic / Custom section content JSON editor */}
                    {['navbar', 'hero', 'metrics', 'steps', 'services', 'popular_trips', 'faq', 'testimonials', 'blogs', 'brochure', 'footer'].indexOf(selectedCmsKey) === -1 && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1 font-mono">Dynamic Content Structure JSON</label>
                          <textarea 
                            rows={8}
                            value={JSON.stringify(cmsForm.content, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setCmsForm({ ...cmsForm, content: parsed });
                              } catch (err) {
                                // ignore parse errors until submit
                              }
                            }}
                            className="w-full px-3 py-2 bg-gray-900 text-green-400 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Make sure the text is in valid JSON syntax format.</p>
                        </div>
                      </div>
                    )}

                      </div>
                    )}
 
                    {/* SEO fields */}
                    {cmsSubTab === 'seo' && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <h3 className="font-bold text-sm text-accent">Search Engine Optimization (SEO)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Title</label>
                            <input 
                              type="text"
                              value={cmsForm.seo?.metaTitle || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                seo: { ...(cmsForm.seo || {}), metaTitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Meta Description</label>
                            <input 
                              type="text"
                              value={cmsForm.seo?.metaDescription || ''}
                              onChange={(e) => setCmsForm({
                                ...cmsForm,
                                seo: { ...(cmsForm.seo || {}), metaDescription: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                    >
                      Save CMS Modifications
                    </button>
                  </form>
                )}
              </div>

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

                {/* Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">Contact Details</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Configure public support contact info.</p>
                  </div>
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={settingsForm.contactDetails?.email || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            contactDetails: { ...settingsForm.contactDetails, email: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                        <input 
                          type="text" 
                          required
                          value={settingsForm.contactDetails?.phone || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            contactDetails: { ...settingsForm.contactDetails, phone: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Office / Base Address</label>
                      <input 
                        type="text" 
                        required
                        value={settingsForm.contactDetails?.address || ''}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          contactDetails: { ...settingsForm.contactDetails, address: e.target.value } 
                        })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">Social Media Links</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Set up corporate social network links (must be valid URLs).</p>
                  </div>
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Facebook URL (e.g. https://facebook.com/...)</label>
                        <input 
                          type="url" 
                          value={settingsForm.socialLinks?.facebook || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            socialLinks: { ...settingsForm.socialLinks, facebook: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Instagram URL (e.g. https://instagram.com/...)</label>
                        <input 
                          type="url" 
                          value={settingsForm.socialLinks?.instagram || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Twitter / X URL (e.g. https://x.com/...)</label>
                        <input 
                          type="url" 
                          value={settingsForm.socialLinks?.twitter || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            socialLinks: { ...settingsForm.socialLinks, twitter: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">LinkedIn URL (e.g. https://linkedin.com/...)</label>
                        <input 
                          type="url" 
                          value={settingsForm.socialLinks?.linkedin || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            socialLinks: { ...settingsForm.socialLinks, linkedin: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Default SEO Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">Default SEO Configurations</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manage default meta details for search engines.</p>
                  </div>
                  <div className="sm:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Default Meta Title</label>
                        <input 
                          type="text" 
                          value={settingsForm.seo?.defaultMetaTitle || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            seo: { ...settingsForm.seo, defaultMetaTitle: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Default Meta Description</label>
                        <input 
                          type="text" 
                          value={settingsForm.seo?.defaultMetaDescription || ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            seo: { ...settingsForm.seo, defaultMetaDescription: e.target.value } 
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-accent">Payment Gateway & UPI</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manage credentials, UPI IDs, and booking advance percentages.</p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">UPI ID (For QR Code Payments)</label>
                        <input 
                          type="text"
                          value={settingsForm.paymentGateway.upiId || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            paymentGateway: { ...settingsForm.paymentGateway, upiId: e.target.value }
                          })}
                          placeholder="e.g. pkgupta2372@okaxis"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Booking Advance Percentage (%)</label>
                        <input 
                          type="number"
                          value={settingsForm.paymentGateway.advancePaymentPercent !== undefined ? settingsForm.paymentGateway.advancePaymentPercent : 20}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            paymentGateway: { ...settingsForm.paymentGateway, advancePaymentPercent: Number(e.target.value) }
                          })}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Username / Email</label>
                        <input 
                          type="text"
                          value={settingsForm.emailSettings.smtpUser || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            emailSettings: { ...settingsForm.emailSettings, smtpUser: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Password</label>
                        <input 
                          type="password"
                          value={settingsForm.emailSettings.smtpPass || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            emailSettings: { ...settingsForm.emailSettings, smtpPass: e.target.value }
                          })}
                          placeholder="••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
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
                className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 shadow-sm transition-all cursor-pointer"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
                <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider">
                  Driver Performance & Analytics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-2xl font-black text-primary">{driverBookings.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Trips</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-2xl font-black text-green-600">
                      {driverBookings.filter(b => b.status === 'confirmed').length}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Completed / Active</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
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
                className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 shadow-sm transition-all cursor-pointer"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    <div className="border-t border-gray-100 pt-4 space-y-2 text-xs font-semibold text-accent">
                      <div>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">One-Way Rate</p>
                        <p className="text-secondary font-bold">₹{selectedCar.pricePerKmOneWay}/KM</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Round-Trip Rate</p>
                        <p className="text-primary font-bold">₹{selectedCar.pricePerKmRoundTrip}/KM</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Min Billed Distance</p>
                        <p>{selectedCar.minBillingDistance || 250} KM</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Driver Allowance</p>
                        <p>₹{selectedCar.driverAllowance || 300} / Day</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Local / Airport Rates</p>
                        <p>Local: ₹{selectedCar.priceLocalPkg || 2000} | Airport: ₹{selectedCar.priceAirportTransfer || 1500}</p>
                      </div>
                      <div className="pt-1.5 border-t border-gray-100">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Policy</p>
                        <p className="text-gray-500 font-normal leading-normal text-[10px]">{selectedCar.tollParkingPolicy || 'Toll, parking, and state tax will be charged extra.'}</p>
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

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 md:col-span-2">
                <div>
                  <h3 className="font-extrabold text-sm text-accent border-b border-gray-100 pb-3 uppercase tracking-wider mb-3">
                    Features & Specifications
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCar.features.map((feature, i) => (
                      <span key={i} className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-lg border border-gray-155 font-medium">
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
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                      <p className="text-2xl font-black text-primary">{carBookings.length}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Trips</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                      <p className="text-2xl font-black text-green-600">
                        {carBookings.filter(b => b.status === 'confirmed').length}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Completed / Active</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
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

        {/* TAB: CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">Booking Calendar</h1>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Calendar Grid Card */}
              <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                  <h3 className="font-bold text-base text-accent">
                    {calendarDate.toLocaleString('default', { month: 'long' })} {calendarDate.getFullYear()}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      &larr; Prev
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const year = calendarDate.getFullYear();
                    const month = calendarDate.getMonth();
                    const totalDays = new Date(year, month + 1, 0).getDate();
                    const startDayOfWeek = new Date(year, month, 1).getDay();
                    
                    const cells = [];
                    // Empty leading cells
                    for (let i = 0; i < startDayOfWeek; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-16 bg-gray-50/50 rounded-lg border border-transparent"></div>);
                    }
                    
                    // Month day cells
                    for (let day = 1; day <= totalDays; day++) {
                      const currentDayDate = new Date(year, month, day);
                      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      
                      // Find bookings active on this date
                      const dayBookings = bookings.filter(b => {
                        const start = new Date(b.startDate);
                        start.setHours(0,0,0,0);
                        const end = new Date(b.endDate);
                        end.setHours(23,59,59,999);
                        return currentDayDate >= start && currentDayDate <= end;
                      });

                      const isSelected = selectedDayStr === dayStr;

                      cells.push(
                        <div
                          key={`day-${day}`}
                          onClick={() => {
                            setSelectedDayBookings(dayBookings);
                            setSelectedDayStr(dayStr);
                          }}
                          className={`h-20 p-2 border rounded-lg flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-gray-150 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-accent'}`}>{day}</span>
                          <div className="space-y-1">
                            {dayBookings.length > 0 && (
                              <div className="text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white bg-primary text-center truncate">
                                {dayBookings.length} Booked
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>

              {/* Day Bookings Ledger list */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="border-b border-gray-150 pb-3">
                  <h3 className="font-extrabold text-sm text-accent">
                    Bookings for {selectedDayStr ? new Date(selectedDayStr).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Selected Day'}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Click any date in the calendar grid to review day details.</p>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {selectedDayBookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-medium">
                      No active bookings scheduled for this day.
                    </div>
                  ) : (
                    selectedDayBookings.map((b) => (
                      <div key={b._id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-accent">
                              {b.bookingType === 'car' ? `${b.car?.make} ${b.car?.model}` : b.packageDetails?.packageName}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Client: {b.user?.name || 'Deleted User'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                            b.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-secondary'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] font-semibold border-t border-gray-100 pt-2 text-gray-500">
                          <span>Driver: {b.driverAssigned || 'None'}</span>
                          <span className="text-secondary font-bold">₹{b.totalAmount}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-accent">Customer Reviews Moderation</h1>
              <div className="flex items-center space-x-3">
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent w-40 font-semibold"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={fetchReviews}
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                >
                  Filter
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No customer reviews found matching filter criteria.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Vehicle Reviewed</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Comment</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((rev) => (
                        <tr key={rev._id} className="border-b border-gray-100 hover:bg-gray-50 text-accent">
                          <td className="p-4">
                            <p className="font-bold">{rev.user?.name || 'Deleted User'}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{rev.user?.email || 'N/A'}</p>
                          </td>
                          <td className="p-4 font-semibold">
                            {rev.car ? `${rev.car.make} ${rev.car.model}` : 'General Feedback'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-0.5 text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= rev.rating ? 'fill-amber-500' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                              <span className="text-[11px] font-bold text-accent ml-1">{rev.rating}</span>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs leading-relaxed text-gray-600">
                            {rev.comment}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              rev.status === 'approved' ? 'bg-green-50 text-green-700' :
                              rev.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {rev.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {rev.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateReviewStatus(rev._id, 'approved')}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded cursor-pointer inline-flex"
                                title="Approve"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {rev.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateReviewStatus(rev._id, 'rejected')}
                                className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer inline-flex"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="p-1.5 bg-red-50 text-secondary hover:bg-red-100 border border-red-200 rounded cursor-pointer inline-flex"
                              title="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
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

        {/* TAB: BROADCASTER */}
        {activeTab === 'broadcaster' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-accent">Notification Broadcaster</h1>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Broadcast Dispatch Form */}
              <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="border-b border-gray-150 pb-3">
                  <h3 className="font-extrabold text-sm text-accent uppercase tracking-wider">Compose Announcement Email</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Send a simulated bulk notification message to registered groups.</p>
                </div>

                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Recipient Audience</label>
                      <select
                        value={broadcastForm.recipientType}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, recipientType: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent font-semibold"
                      >
                        <option value="all">All Recipients (Users & Drivers)</option>
                        <option value="users">Active Users Only</option>
                        <option value="drivers">Available Drivers Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Subject Line</label>
                      <input
                        type="text"
                        required
                        placeholder="Monsoon Deals: 15% discount on SUV rentals!"
                        value={broadcastForm.subject}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Announcement Body</label>
                    <textarea
                      required
                      placeholder="Write your email notification text details here..."
                      rows={6}
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary text-accent leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={broadcastLoading}
                    className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>{broadcastLoading ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
                  </button>
                </form>
              </div>

              {/* Broadcast Result Summary Log */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="border-b border-gray-150 pb-3">
                  <h3 className="font-extrabold text-sm text-accent uppercase tracking-wider">Broadcast Result Logs</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Details of the latest dispatched bulk notification message.</p>
                </div>

                {broadcastResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-green-50 border border-green-150 rounded-xl text-green-700 flex items-start space-x-2">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-extrabold text-[11px] uppercase tracking-wider">Simulated Broadcast Success</strong>
                        <p className="mt-0.5">Successfully sent to <strong>{broadcastResult.sentCount}</strong> targets.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recipients Targeted:</span>
                      <div className="max-h-[220px] overflow-y-auto border border-gray-155 bg-gray-50 p-3 rounded-xl font-mono text-[10px] space-y-1 text-gray-600">
                        {broadcastResult.targets.map((email, idx) => (
                          <div key={idx} className="truncate">
                            &bull; {email}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400 text-xs font-medium">
                    No broadcast logs generated in this session. Complete the form to run a simulation.
                  </div>
                )}
              </div>

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
              <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
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

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Crop Shape / Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setCropAspect('1:1'); setCropX(0); setCropY(0); setCropZoom(1); }}
                    className={`py-2 px-3 border rounded-lg text-xs font-semibold cursor-pointer ${
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
                    className={`py-2 px-3 border rounded-lg text-xs font-semibold cursor-pointer ${
                      cropAspect === '4:1' 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Landscape Banner (4:1)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
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
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
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
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
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
                <button type="button" onClick={executeCropAndUpload} className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-sm cursor-pointer">
                  Crop & Save
                </button>
                <button type="button" onClick={() => setCropModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generator Modal */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-extrabold text-base text-accent">Rental Invoice Log</h3>
                <p className="text-[10px] text-gray-400">Order Ref: {invoiceBooking._id}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()} 
                  className="bg-primary hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button 
                  onClick={() => setInvoiceBooking(null)} 
                  className="bg-white hover:bg-gray-100 text-gray-600 text-xs font-bold py-2 px-3 border border-gray-200 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div id="invoicePrintArea" className="p-8 space-y-6 overflow-y-auto max-h-[60vh] bg-white text-accent">
              <div className="flex justify-between items-start border-b border-gray-150 pb-6">
                <div>
                  <h1 className="text-xl font-black text-primary tracking-wide">{settingsForm.companyName || 'PK Gupta Travel & Rentals'}</h1>
                  <p className="text-xs text-gray-500 mt-1">{settingsForm.contactDetails?.address}</p>
                  <p className="text-xs text-gray-500">Phone: {settingsForm.contactDetails?.phone}</p>
                  <p className="text-xs text-gray-500">Email: {settingsForm.contactDetails?.email}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-black text-accent uppercase tracking-wider">INVOICE</h2>
                  <p className="text-xs text-gray-500 mt-1">Invoice Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Due Date: On Delivery</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs border-b border-gray-155 pb-6">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">Billed To:</h4>
                  <p className="font-bold text-accent text-sm">{invoiceBooking.user?.name || 'Customer'}</p>
                  <p className="text-gray-500 mt-0.5">{invoiceBooking.user?.email}</p>
                  <p className="text-gray-500">{invoiceBooking.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">Trip Metadata:</h4>
                  <p className="text-gray-500"><strong className="text-accent">Booking Type:</strong> <span className="capitalize">{invoiceBooking.bookingType}</span></p>
                  <p className="text-gray-500"><strong className="text-accent">Duration:</strong> {new Date(invoiceBooking.startDate).toLocaleDateString()} to {new Date(invoiceBooking.endDate).toLocaleDateString()}</p>
                  <p className="text-gray-500"><strong className="text-accent">Chauffeur:</strong> {invoiceBooking.driverAssigned || 'Self Driven'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                      <th className="p-3">Rental / Package Details</th>
                      <th className="p-3 text-right">Fare Rate</th>
                      <th className="p-3 text-right">Duration</th>
                      <th className="p-3 text-right">Total Line Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 text-accent font-medium">
                      <td className="p-3">
                        {invoiceBooking.bookingType === 'car' ? (
                          <>
                            <p className="font-bold">{invoiceBooking.car?.make} {invoiceBooking.car?.model}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Category: {invoiceBooking.car?.category} (Year: {invoiceBooking.car?.year})</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold">{invoiceBooking.packageDetails?.packageName}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Destination: {invoiceBooking.packageDetails?.destination}</p>
                          </>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        ₹{invoiceBooking.bookingType === 'car' ? invoiceBooking.car?.pricePerDay : invoiceBooking.totalAmount}
                      </td>
                      <td className="p-3 text-right">
                        {(() => {
                          const diffTime = Math.abs(new Date(invoiceBooking.endDate) - new Date(invoiceBooking.startDate));
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                          return invoiceBooking.bookingType === 'car' ? `${diffDays} days` : '1 package';
                        })()}
                      </td>
                      <td className="p-3 text-right font-bold text-secondary">
                        ₹{invoiceBooking.totalAmount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-gray-150 pt-6">
                <div className="w-64 space-y-2 text-xs text-right">
                  <div className="flex justify-between font-semibold text-gray-500">
                    <span>Base Amount:</span>
                    <span>₹{(invoiceBooking.totalAmount * 0.82).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-500">
                    <span>GST (18%):</span>
                    <span>₹{(invoiceBooking.totalAmount * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-accent border-t border-gray-150 pt-2 text-sm">
                    <span>Total Paid Amount:</span>
                    <span className="text-secondary">₹{invoiceBooking.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 text-[10px] text-gray-400 text-center leading-relaxed">
                Thank you for choosing {settingsForm.companyName || 'PK Gupta Travel & Rentals'}. Have a safe journey!
                <br />
                This is a computer generated invoice and requires no physical signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
