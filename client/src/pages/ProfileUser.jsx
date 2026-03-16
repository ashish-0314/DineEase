import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../context/useAuthStore';
import api from '../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, XCircle, MapPin, User as UserIcon, Settings as SettingsIcon, Camera, Lock, Save, Store } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileUser = () => {
    const { user, updateUser } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(user?.role === 'user' ? 'bookings' : 'settings'); // 'bookings' or 'settings'

    // Profile Settings State
    const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(user?.avatar || null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const fileInputRef = useRef(null);

    // Password State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/my');
            setBookings(res.data);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.put(`/bookings/${id}/cancel`);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsUpdatingProfile(true);
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('phone', profileData.phone);
            if (profileFile) {
                formData.append('avatar', profileFile);
            }

            const res = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            updateUser(res.data); // Correctly update global store without triggering a login API call
            toast.success('Profile updated successfully');
            setProfileFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords don't match");
        }
        try {
            setIsUpdatingPassword(true);
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-blue-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );

    return (
        <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 bg-blue-950 font-sans">
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse pointer-events-none z-0"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header Profile Summary */}
                <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-blue-500 bg-blue-900 flex items-center justify-center shadow-xl">
                            {profilePreview ? (
                                <img src={profilePreview} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <UserIcon className="h-16 w-16 text-blue-300" />
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-grow">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{user?.name}</h1>
                        <p className="text-blue-200 mt-2 text-lg">{user?.email}</p>
                        <div className="mt-4 inline-flex items-center gap-2 bg-blue-900/50 px-4 py-1.5 rounded-full border border-blue-400/30">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-sm font-semibold text-blue-200 capitalize">{user?.role} Account</span>
                        </div>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
                    {user?.role === 'user' && (
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-blue-200 hover:bg-white/10'}`}
                        >
                            <Calendar className="h-5 w-5" />
                            My Bookings
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-blue-200 hover:bg-white/10'}`}
                    >
                        <SettingsIcon className="h-5 w-5" />
                        Account Settings
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {bookings.length === 0 ? (
                                <div className="text-center py-20 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
                                    <Calendar className="h-16 w-16 text-blue-400/50 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-white mb-2">No bookings found</h3>
                                    <p className="text-blue-200 mb-8">You haven't made any restaurant reservations yet.</p>
                                    {user?.role === 'user' && (
                                        <Link to="/restaurants" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all border border-blue-400 inline-block">
                                            Explore Restaurants
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {bookings.map((booking) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={booking._id}
                                            className="bg-black/20 backdrop-blur-xl p-0 rounded-3xl border border-white/10 flex flex-col sm:flex-row shadow-2xl overflow-hidden group hover:border-blue-500/50 transition-colors"
                                        >
                                            <div className="h-48 sm:h-auto sm:w-48 bg-blue-900/50 relative overflow-hidden flex-shrink-0">
                                                {booking.restaurantId?.images?.[0] ? (
                                                    <img src={booking.restaurantId.images[0]} alt="Restaurant" className="absolute inset-0 h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="h-full w-full flex flex-col items-center justify-center text-blue-300/50">
                                                        <Store className="h-10 w-10 mb-2" />
                                                        <span className="text-sm">No Image</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                                                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-md border ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                                    booking.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                    }`}>
                                                    {booking.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="p-6 flex-grow flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-extrabold text-white mb-4">
                                                        <Link to={`/restaurant/${booking.restaurantId?._id}`} className="hover:text-blue-300 transition-colors">
                                                            {booking.restaurantId?.name || 'Unknown Restaurant'}
                                                        </Link>
                                                    </h3>

                                                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-200/80 mb-4">
                                                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-400" /> {format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                                                        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-400" /> {booking.timeSlot}</span>
                                                        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-400" /> {booking.numberOfGuests} Guests</span>
                                                        {booking.restaurantId?.location?.address && <span className="flex items-center gap-2 truncate" title={booking.restaurantId.location.address}><MapPin className="h-4 w-4 text-blue-400" /> {booking.restaurantId.location.address}</span>}
                                                    </div>

                                                    {booking.specialRequest && (
                                                        <p className="text-sm bg-blue-900/30 p-3 rounded-xl italic text-blue-300 border border-blue-500/20 mb-4">

                                                            "{booking.specialRequest}"
                                                        </p>
                                                    )}
                                                </div>

                                                {booking.status === 'confirmed' && new Date(booking.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                                                    <div className="flex justify-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => handleCancel(booking._id)}
                                                            className="flex items-center justify-center gap-2 text-red-300 hover:text-white hover:bg-red-500 border border-red-500/30 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-red-900/20 w-full sm:w-auto bg-red-500/10"
                                                        >
                                                            <XCircle className="h-5 w-5" /> Cancel Booking
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-12"
                        >
                            {/* Profile Details Form */}
                            <section>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <UserIcon className="h-6 w-6 text-blue-400" /> Basic Details
                                </h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">

                                    {/* Avatar Upload */}
                                    <div className="flex items-start gap-6">
                                        <div className="relative group cursor-pointer">
                                            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white/20 bg-black/40 flex items-center justify-center">
                                                {profilePreview ? (
                                                    <img src={profilePreview} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <UserIcon className="h-8 w-8 text-blue-300/50" />
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors border border-white/10 mb-2"
                                            >
                                                Change Picture
                                            </button>
                                            <p className="text-xs text-blue-300/70">JPG, PNG or WEBP. Max 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-blue-200 font-medium">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-blue-200 font-medium">Email Address</label>
                                            <input
                                                type="email"
                                                value={user?.email}
                                                disabled
                                                className="w-full bg-black/10 border border-white/5 rounded-xl p-3 text-gray-400 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-white/40">Email cannot be changed.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-blue-200 font-medium">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdatingProfile}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all border border-blue-400 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdatingProfile ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
                                        Save Changes
                                    </button>
                                </form>
                            </section>

                            {/* Password Form */}
                            <section>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <Lock className="h-6 w-6 text-red-400" /> Security
                                </h3>
                                <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-xl">
                                    <div className="space-y-2">
                                        <label className="text-sm text-blue-200 font-medium">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-blue-200 font-medium">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={passwordData.newPassword}
                                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-blue-200 font-medium">Confirm Password</label>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={passwordData.confirmPassword}
                                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword}
                                        className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 px-6 py-3 rounded-xl font-bold shadow-lg transition-all border border-red-500/50 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdatingPassword ? <div className="h-5 w-5 border-2 border-red-500/50 border-t-red-200 rounded-full animate-spin"></div> : <Lock className="h-5 w-5" />}
                                        Update Password
                                    </button>
                                </form>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProfileUser;
