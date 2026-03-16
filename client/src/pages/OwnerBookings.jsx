import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Calendar, Clock, Users, CheckCircle, XCircle, Info, ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerBookings = () => {
    const { id } = useParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBookings, setExpandedBookings] = useState(new Set());

    // Search and Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchBookings();
    }, [id]);

    const fetchBookings = async () => {
        try {
            const res = await api.get(`/bookings/restaurant/${id}`);

            // Sort bookings: Latest date at the top
            const sortedBookings = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setBookings(sortedBookings);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            await api.put(`/bookings/${bookingId}/cancel`);
            toast.success(`Booking cancelled`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    }

    const toggleExpand = (bookingId) => {
        const newExpanded = new Set(expandedBookings);
        if (newExpanded.has(bookingId)) {
            newExpanded.delete(bookingId);
        } else {
            newExpanded.add(bookingId);
        }
        setExpandedBookings(newExpanded);
    };

    // Filter by search query
    const filteredBookings = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return bookings.filter(b => {
            const name = (b.userId?.name || 'Walk-in Guest').toLowerCase();
            const email = (b.userId?.email || '').toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [bookings, searchQuery]);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) return (
        <div className="min-h-screen bg-blue-950 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-blue-900/30 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
    );

    const today = startOfDay(new Date());

    return (
        <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-blue-950">

            {/* Glowing Orbs for extra depth */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse pointer-events-none z-0"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl shadow-inner border border-white/10 backdrop-blur-md">
                            <Calendar className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Manage Reservations</h1>
                            <p className="text-blue-200 mt-1 drop-shadow-sm text-sm">View, search, and manage customer bookings.</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-blue-300" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                        />
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
                        <Calendar className="h-16 w-16 text-blue-300 mx-auto mb-4 drop-shadow-md" />
                        <h3 className="text-xl font-bold text-white drop-shadow-md">No bookings found</h3>
                        <p className="text-blue-200 mt-2">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {currentBookings.map((b) => {
                            const bookingDate = new Date(b.date);
                            const isPast = isBefore(bookingDate, today);
                            const isExpanded = expandedBookings.has(b._id);

                            // Grayscale for past dates, Glassmorphic for future dates
                            const cardBaseClass = isPast
                                ? "bg-black/40 border-white/5 grayscale-[0.8] opacity-70 backdrop-blur-md hover:opacity-100"
                                : "bg-white/10 border-white/20 backdrop-blur-xl hover:bg-white/20 shadow-xl";

                            const textPrimaryClass = isPast ? "text-gray-300" : "text-white";
                            const textSecondaryClass = isPast ? "text-gray-400" : "text-blue-200";
                            const iconClass = isPast ? "text-gray-400" : "text-blue-300";
                            const highlightClass = isPast ? "bg-black/30 text-gray-300" : "bg-black/20 text-blue-100 shadow-inner";

                            return (
                                <motion.div
                                    key={b._id}
                                    layout
                                    className={`rounded-3xl border transition-all overflow-hidden ${cardBaseClass}`}
                                    onClick={() => toggleExpand(b._id)}
                                >
                                    <div className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`text-xl font-bold drop-shadow-md ${textPrimaryClass}`}>
                                                    {b.userId?.name || 'Walk-in Guest'}
                                                </h3>
                                                {isPast && (
                                                    <span className="px-2.5 py-0.5 bg-black/40 text-gray-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-md">Past</span>
                                                )}
                                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                                    b.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </div>

                                            <p className={`text-sm mb-4 ${textSecondaryClass}`}>{b.userId?.email || 'No email provided'}</p>

                                            <div className="flex flex-wrap gap-4 text-sm font-medium">
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 ${highlightClass}`}>
                                                    <Calendar className={`h-4 w-4 ${iconClass}`} />
                                                    {format(bookingDate, 'MMM dd, yyyy')}
                                                </span>
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 ${highlightClass}`}>
                                                    <Clock className={`h-4 w-4 ${iconClass}`} />
                                                    {b.timeSlot}
                                                </span>
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 ${highlightClass}`}>
                                                    <Users className={`h-4 w-4 ${iconClass}`} />
                                                    {b.numberOfGuests} Guests
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {(b.preOrderedItems?.length > 0 || b.specialRequest) && (
                                                <div className={`flex items-center gap-1 text-sm font-bold ${isPast ? 'text-gray-400' : 'text-blue-300'} bg-black/20 px-3 py-1.5 rounded-lg border border-white/10`}>
                                                    <Info className="h-4 w-4" /> Order Inside
                                                </div>
                                            )}

                                            {b.status === 'confirmed' && !isPast && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(b._id); }}
                                                    className="p-2.5 text-red-400 hover:text-white hover:bg-red-500 border border-red-400/30 hover:border-red-500 rounded-xl transition-colors shadow-sm bg-black/20"
                                                    title="Cancel Booking"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            )}

                                            <div className="p-2 bg-black/20 rounded-xl border border-white/5">
                                                {isExpanded ? <ChevronUp className={iconClass} /> : <ChevronDown className={iconClass} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Order Details Section */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/10"
                                            >
                                                <div className={`p-6 ${isPast ? 'bg-black/30' : 'bg-black/20 shadow-inner'}`}>
                                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isPast ? 'text-gray-400' : 'text-blue-300'}`}>
                                                        Booking Details & Pre-Orders
                                                    </h4>

                                                    {b.specialRequest ? (
                                                        <div className={`mb-6 p-4 rounded-2xl ${isPast ? 'bg-black/40 text-gray-400 border border-white/5' : 'bg-blue-900/30 text-blue-100 border border-blue-400/20 pl-4 border-l-4 border-l-blue-400'}`}>
                                                            <p className="font-semibold text-sm mb-1 uppercase tracking-wider opacity-70">Special Request</p>
                                                            <p className="italic">"{b.specialRequest}"</p>
                                                        </div>
                                                    ) : null}

                                                    {b.preOrderedItems && b.preOrderedItems.length > 0 ? (
                                                        <div className={`rounded-2xl border overflow-hidden ${isPast ? 'border-white/5 bg-black/40' : 'border-white/10 bg-black/30 shadow-sm'}`}>
                                                            <table className="w-full text-sm text-left text-white">
                                                                <thead className={`text-xs uppercase ${isPast ? 'text-gray-500 bg-black/50' : 'text-blue-200 bg-black/40'}`}>
                                                                    <tr>
                                                                        <th className="px-6 py-4 border-b border-white/5">Item Name</th>
                                                                        <th className="px-6 py-4 text-center border-b border-white/5">Quantity</th>
                                                                        <th className="px-6 py-4 text-right border-b border-white/5">Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {b.preOrderedItems.map((item, idx) => (
                                                                        <tr key={idx} className={`${isPast ? 'hover:bg-white/5' : 'hover:bg-blue-900/20'} transition-colors`}>
                                                                            <td className={`px-6 py-4 font-medium ${textPrimaryClass}`}>{item.name}</td>
                                                                            <td className={`px-6 py-4 text-center ${textSecondaryClass}`}>x{item.quantity}</td>
                                                                            <td className={`px-6 py-4 text-right ${textPrimaryClass}`}>₹{item.price}</td>
                                                                        </tr>
                                                                    ))}
                                                                    <tr className={`font-bold ${isPast ? 'bg-black/50 text-gray-400' : 'bg-blue-900/40 text-blue-100'}`}>
                                                                        <td className="px-6 py-4 border-t border-white/10" colSpan="2">Order Total Estimate</td>
                                                                        <td className="px-6 py-4 text-right border-t border-white/10">
                                                                            ₹{b.preOrderedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className={`text-sm italic ${textSecondaryClass}`}>No pre-ordered items for this booking.</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 px-4">
                        <div className="text-sm text-blue-200">
                            Showing <span className="font-medium text-white">{indexOfFirstItem + 1}</span> to <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredBookings.length)}</span> of <span className="font-medium text-white">{filteredBookings.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors backdrop-blur-md shadow-sm"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-medium transition-all ${currentPage === i + 1
                                            ? 'bg-blue-500 text-white shadow-lg border border-blue-400'
                                            : 'bg-white/10 border border-white/10 text-blue-100 hover:bg-white/20 backdrop-blur-md'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors backdrop-blur-md shadow-sm"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerBookings;
