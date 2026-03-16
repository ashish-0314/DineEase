import React, { useState, useEffect } from 'react';
import useAuthStore from '../context/useAuthStore';
import api from '../services/api';
import { toast } from 'sonner';
import { Trash2, CheckCircle, Users, Utensils, LayoutDashboard, Search, ChevronRight, Eye, ShieldAlert, Star } from 'lucide-react';
import { format } from 'date-fns';

const DashboardAdmin = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalRestaurants: 0, totalBookings: 0, pendingRestaurants: 0 });
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tab State: 'overview', 'users', 'restaurants'
    const [activeTab, setActiveTab] = useState('overview');

    // Search States
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');

    // Expand State
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [expandedRestaurantId, setExpandedRestaurantId] = useState(null);

    useEffect(() => {
        fetchData();
        // We only NEED the stats and pending for overview, but pre-fetching speeds up tabs
        fetchAllData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/restaurants/pending')
            ]);
            setStats(statsRes.data);
            setPendingRestaurants(pendingRes.data);
        } catch (error) {
            toast.error('Failed to load admin stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllData = async () => {
        try {
            const [usersRes, restRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/restaurants')
            ]);
            setAllUsers(usersRes.data);
            setAllRestaurants(restRes.data);
        } catch (error) {
            console.error("Data fetch error", error);
        }
    };

    const handleApproval = async (id, isApproved) => {
        try {
            await api.put(`/admin/restaurants/${id}/approve`, { isApproved });
            toast.success(`Restaurant ${isApproved ? 'approved' : 'rejected'} successfully`);
            fetchData();
            fetchAllData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    // Derived filtered lists
    const filteredUsers = allUsers.filter(u =>
        u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const filteredRestaurants = allRestaurants.filter(r =>
        r.name?.toLowerCase().includes(restaurantSearchTerm.toLowerCase()) ||
        r.ownerId?.email?.toLowerCase().includes(restaurantSearchTerm.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(restaurantSearchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] bg-blue-50/50 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="bg-blue-50/50 min-h-[calc(100vh-64px)] pb-12">

            {/* Dark Blue Header Header */}
            <div className="bg-blue-950 pt-8 pb-24 border-b border-blue-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">System Administration</h1>
                    <p className="text-blue-200">Manage user accounts, monitor application metrics, and approve partner restaurants.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 p-4 sticky top-24">
                            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 px-3">Control Panel</h2>
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-blue-900 hover:bg-blue-50'}`}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>Overview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-blue-900 hover:bg-blue-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5" />
                                        <span>User List</span>
                                    </div>
                                    {activeTab !== 'users' && <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">{allUsers.length}</span>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('restaurants')}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'restaurants' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-blue-900 hover:bg-blue-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Utensils className="h-5 w-5" />
                                        <span>Restaurants</span>
                                    </div>
                                    {activeTab !== 'restaurants' && <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">{allRestaurants.length}</span>}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 min-w-0">

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-50 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Users className="h-16 w-16 text-blue-600" />
                                        </div>
                                        <p className="text-sm font-bold text-blue-900/60 mb-1">Total Users</p>
                                        <p className="text-3xl font-black text-blue-950">{stats.totalUsers}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-50 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Utensils className="h-16 w-16 text-blue-600" />
                                        </div>
                                        <p className="text-sm font-bold text-blue-900/60 mb-1">Total Restaurants</p>
                                        <p className="text-3xl font-black text-blue-950">{stats.totalRestaurants}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-50 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <CheckCircle className="h-16 w-16 text-blue-600" />
                                        </div>
                                        <p className="text-sm font-bold text-blue-900/60 mb-1">Total Bookings</p>
                                        <p className="text-3xl font-black text-blue-950">{stats.totalBookings}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl shadow-xl shadow-blue-900/20 border border-blue-500 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-20">
                                            <ShieldAlert className="h-16 w-16 text-white" />
                                        </div>
                                        <p className="text-sm font-bold text-blue-100 mb-1">Pending Approval</p>
                                        <p className="text-3xl font-black text-white">{stats.pendingRestaurants}</p>
                                    </div>
                                </div>

                                {/* Pending List */}
                                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
                                        <h2 className="text-lg font-bold text-blue-950">Pending Partnerships Queue</h2>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-200">{pendingRestaurants.length} Needs Review</span>
                                    </div>

                                    {pendingRestaurants.length === 0 ? (
                                        <div className="p-12 text-center text-blue-800/60 font-medium">
                                            <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-3 opacity-50" />
                                            <p>All caught up! No active requests waiting.</p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-blue-50">
                                            {pendingRestaurants.map((r) => (
                                                <li key={r._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-blue-50/30 transition-colors">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-blue-950 mb-1">{r.name}</h3>
                                                        <p className="text-sm font-medium text-blue-700/80 mb-3 flex items-center gap-1.5">
                                                            <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 text-xs">{r.cuisine}</span>
                                                            &bull; {r.location?.address || 'Address pending'}
                                                        </p>
                                                        <p className="text-sm text-blue-900/70 max-w-2xl bg-white border border-blue-100 p-3 rounded-xl italic">"{r.description || 'No description provided.'}"</p>
                                                    </div>
                                                    <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                                                        <button
                                                            onClick={() => handleApproval(r._id, true)}
                                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                                                        >
                                                            <CheckCircle className="h-4 w-4" /> Approve Listing
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(r._id, false)}
                                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 hover:border-red-200 rounded-xl font-bold transition-all active:scale-95"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Reject Request
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[70vh]">
                                <div className="p-6 border-b border-blue-50 bg-blue-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <h2 className="text-xl font-black text-blue-950 pr-4">User Directory</h2>
                                    <div className="relative w-full sm:w-72 shrink-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                                        <input
                                            type="text"
                                            placeholder="Search name, email, role..."
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium text-blue-950"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-blue-950 text-white text-xs uppercase tracking-wider sticky top-0">
                                                <th className="px-6 py-4 font-bold">User</th>
                                                <th className="px-6 py-4 font-bold">Contact</th>
                                                <th className="px-6 py-4 font-bold">Role</th>
                                                <th className="px-6 py-4 font-bold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-50">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-blue-400 font-medium">No users found matching query.</td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map(u => (
                                                    <React.Fragment key={u._id}>
                                                        <tr
                                                            onClick={() => setExpandedUserId(expandedUserId === u._id ? null : u._id)}
                                                            className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-inner border border-blue-200 overflow-hidden shrink-0">
                                                                        {u.avatar ? <img src={u.avatar} className="object-cover h-full w-full" /> : u.name?.[0]?.toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-blue-950">{u.name}</div>
                                                                        <div className="text-xs text-blue-400 font-mono">{u._id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-medium text-blue-800">{u.email}</div>
                                                                {u.phone && <div className="text-xs text-blue-600/70">{u.phone}</div>}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${u.role === 'admin' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                                        u.role === 'owner' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                                            'bg-blue-100 text-blue-700 border border-blue-200'
                                                                    }`}>
                                                                    {u.role.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium text-blue-900/60 max-w-[120px]">
                                                                <div className="flex justify-between items-center">
                                                                    <span>{u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
                                                                    <ChevronRight className={`h-5 w-5 text-blue-400 transition-transform ${expandedUserId === u._id ? 'rotate-90' : ''}`} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {expandedUserId === u._id && (
                                                            <tr className="bg-blue-50/50">
                                                                <td colSpan="4" className="px-6 py-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border border-blue-100 bg-white p-4 rounded-xl shadow-inner my-2">
                                                                        <div>
                                                                            <p className="text-blue-400 font-bold text-xs uppercase mb-1">Account Details</p>
                                                                            <p><span className="font-semibold text-blue-900">User ID:</span> <span className="font-mono text-blue-600">{u._id}</span></p>
                                                                            <p><span className="font-semibold text-blue-900">Registered:</span> {u.createdAt ? format(new Date(u.createdAt), 'PPpp') : 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-blue-400 font-bold text-xs uppercase mb-1">Platform Activity</p>
                                                                            <p className="text-blue-600 font-medium italic">Detailed user booking & activity metrics coming soon.</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* RESTAURANTS TAB */}
                        {activeTab === 'restaurants' && (
                            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[70vh]">
                                <div className="p-6 border-b border-blue-50 bg-blue-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <h2 className="text-xl font-black text-blue-950 pr-4">Global Restaurant Database</h2>
                                    <div className="relative w-full sm:w-72 shrink-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                                        <input
                                            type="text"
                                            placeholder="Search establishment, owner..."
                                            value={restaurantSearchTerm}
                                            onChange={(e) => setRestaurantSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium text-blue-950"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-blue-950 text-white text-xs uppercase tracking-wider sticky top-0">
                                                <th className="px-6 py-4 font-bold">Restaurant</th>
                                                <th className="px-6 py-4 font-bold">Contact / Owner</th>
                                                <th className="px-6 py-4 font-bold">Status</th>
                                                <th className="px-6 py-4 font-bold text-center">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-50">
                                            {filteredRestaurants.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-blue-400 font-medium">No restaurants found.</td>
                                                </tr>
                                            ) : (
                                                filteredRestaurants.map(r => (
                                                    <React.Fragment key={r._id}>
                                                        <tr
                                                            onClick={() => setExpandedRestaurantId(expandedRestaurantId === r._id ? null : r._id)}
                                                            className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm border border-blue-200 overflow-hidden shrink-0">
                                                                        {r.images?.[0] ? <img src={r.images[0]} className="object-cover h-full w-full" /> : <Utensils className="h-5 w-5" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-blue-950">{r.name}</div>
                                                                        <div className="text-xs text-blue-600/80 font-medium mt-0.5">{r.cuisine} • {r.priceRange}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-bold text-blue-800">{r.ownerId?.name || 'Unknown'}</div>
                                                                <div className="text-xs text-blue-600/70">{r.ownerId?.email || 'N/A'}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {r.isApproved ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 border border-green-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center max-w-[120px]">
                                                                <div className="flex justify-between items-center">
                                                                    <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 mx-auto">
                                                                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                                        <span className="text-sm font-bold text-blue-950">{r.rating?.toFixed(1) || '0.0'}</span>
                                                                    </div>
                                                                    <ChevronRight className={`h-5 w-5 text-blue-400 transition-transform ${expandedRestaurantId === r._id ? 'rotate-90' : ''}`} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {expandedRestaurantId === r._id && (
                                                            <tr className="bg-blue-50/50">
                                                                <td colSpan="4" className="px-6 py-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border border-blue-100 bg-white p-5 rounded-xl shadow-inner my-2">
                                                                        <div>
                                                                            <p className="text-blue-400 font-bold text-xs uppercase mb-2 border-b border-blue-50 pb-1">Restaurant Info</p>
                                                                            <p className="mb-1"><span className="font-semibold text-blue-900">ID:</span> <span className="font-mono text-blue-600">{r._id}</span></p>
                                                                            <p className="mb-1"><span className="font-semibold text-blue-900">Address:</span> {r.location?.address || 'N/A'}</p>
                                                                            <p className="mb-1"><span className="font-semibold text-blue-900">Total Tables:</span> {r.tables?.length || 0}</p>
                                                                            <p className="text-blue-800 italic mt-2">"{r.description}"</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-blue-400 font-bold text-xs uppercase mb-2 border-b border-blue-50 pb-1 flex justify-between items-center">
                                                                                <span>Owner Management</span>
                                                                                {r.isApproved ? (
                                                                                    <button onClick={() => handleApproval(r._id, false)} className="text-red-500 hover:text-red-700 flex items-center gap-1.5 text-xs bg-red-50 px-2 py-0.5 rounded-md">
                                                                                        Suspend Listing <Trash2 className="h-3 w-3" />
                                                                                    </button>
                                                                                ) : (
                                                                                    <button onClick={() => handleApproval(r._id, true)} className="text-green-600 hover:text-green-800 flex items-center gap-1.5 text-xs bg-green-50 px-2 py-0.5 rounded-md">
                                                                                        Approve Listing <CheckCircle className="h-3 w-3" />
                                                                                    </button>
                                                                                )}
                                                                            </p>
                                                                            <p className="mb-1"><span className="font-semibold text-blue-900">Owner ID:</span> <span className="font-mono text-blue-600">{r.ownerId?._id || 'N/A'}</span></p>
                                                                            <p className="mb-1"><span className="font-semibold text-blue-900">Owner Name:</span> {r.ownerId?.name || 'N/A'}</p>
                                                                            <p className="mb-1"><span className="font-semibold text-blue-900">Owner Email:</span> {r.ownerId?.email || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;

