import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../context/useAuthStore';
import { toast } from 'sonner';
import { Star, MapPin, Clock, Calendar, Users, MessageSquare, Utensils, Phone, Map as MapIcon, ChevronRight, Search, Info } from 'lucide-react';
import { format } from 'date-fns';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    const [restaurant, setRestaurant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Booking State
    const [bookingDate, setBookingDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [guests, setGuests] = useState(2);
    const [specialRequest, setSpecialRequest] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [orderAtRestaurant, setOrderAtRestaurant] = useState(false);

    // Review State
    const [canReview, setCanReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Pre-order State
    const [preOrder, setPreOrder] = useState({});

    const incrementItem = (item) => {
        setPreOrder(prev => {
            const current = prev[item.name] || { name: item.name, price: item.price, quantity: 0 };
            return {
                ...prev,
                [item.name]: { ...current, quantity: current.quantity + 1 }
            };
        });
    };

    const decrementItem = (item) => {
        setPreOrder(prev => {
            const current = prev[item.name];
            if (!current) return prev;
            if (current.quantity <= 1) {
                const updated = { ...prev };
                delete updated[item.name];
                return updated;
            }
            return {
                ...prev,
                [item.name]: { ...current, quantity: current.quantity - 1 }
            };
        });
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        fetchRestaurantData();
    }, [id]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            const [resData, reviewsData] = await Promise.all([
                api.get(`/restaurants/${id}`),
                api.get(`/reviews/restaurant/${id}`)
            ]);
            setRestaurant(resData.data);
            setReviews(reviewsData.data);

            if (isAuthenticated && user?.role !== 'owner') {
                try {
                    const eligibilityRes = await api.get(`/reviews/eligibility/${id}`);
                    setCanReview(eligibilityRes.data.eligible);
                } catch (error) {
                    console.error("Eligibility check fail", error);
                }
            }
        } catch (error) {
            toast.error('Failed to load restaurant details');
            navigate('/restaurants');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewRating || !reviewComment.trim()) {
            return toast.error("Please provide a rating and a comment.");
        }

        try {
            setIsSubmittingReview(true);
            const res = await api.post('/reviews', {
                restaurantId: id,
                rating: reviewRating,
                comment: reviewComment
            });
            // Update reviews list and hide form since they can only review once
            setReviews([res.data, ...reviews]);
            setCanReview(false);
            setReviewComment('');
            toast.success("Review submitted successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleCall = () => {
        // Fallback number if restaurant doesn't have one in schema yet,
        // using standard tel: protocol.
        const phoneNumber = restaurant.phone || "+1234567890";
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleGoogleMaps = () => {
        if (restaurant.location?.coordinates?.length === 2) {
            const [lng, lat] = restaurant.location.coordinates;
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        } else if (restaurant.location?.address) {
            const encodedAddress = encodeURIComponent(restaurant.location.address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
        } else {
            toast.error("Location not available for this restaurant.");
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.info('Please login to book a table');
            navigate('/login');
            return;
        }

        if (user?.role === 'admin' || user?.role === 'owner') {
            toast.error('Only Diners can book tables');
            return;
        }

        try {
            setIsBooking(true);

            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error("Failed to load Razorpay SDK. Check your connection.");
                setIsBooking(false);
                return;
            }

            const orderRes = await api.post('/bookings/create-order');
            const { id: order_id, amount, currency } = orderRes.data;

            const preOrderedItems = Object.values(preOrder);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'your_razorpay_key_id',
                amount: amount.toString(),
                currency: currency,
                name: "DineEase Table Booking",
                description: `Booking Confirmation Fee for ${restaurant.name}`,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        await api.post('/bookings', {
                            restaurantId: id,
                            date: bookingDate,
                            timeSlot,
                            numberOfGuests: guests,
                            specialRequest,
                            preOrderedItems,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        toast.success('Table booked & payment successful!');
                        navigate('/profile');
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Booking confirmation failed');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: { color: "#2563eb" }, // Blue-600
                modal: {
                    ondismiss: function () {
                        setIsBooking(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                toast.error(response.error.description || 'Payment Failed');
                setIsBooking(false);
            });

            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.error('Failed to initiate payment. Please check your connection.');
            setIsBooking(false);
        }
    };

    const generateTimeSlots = () => {
        if (!restaurant) return [];
        const slots = [];
        let current = parseInt(restaurant.openingTime.split(':')[0]);
        const end = parseInt(restaurant.closingTime.split(':')[0]);

        while (current < end) {
            slots.push(`${current.toString().padStart(2, '0')}:00`);
            current++;
        }
        return slots;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-blue-50/50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );
    if (!restaurant) return null;

    return (
        <div className="bg-blue-50/30 min-h-[calc(100vh-64px)] pb-20">
            {/* Hero Image Section Strip */}
            <div className="w-full h-[40vh] md:h-[50vh] bg-blue-950 relative overflow-hidden">
                {restaurant.images?.[0] ? (
                    <img src={restaurant.images[0]} alt={restaurant.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-40">
                        <Utensils className="h-32 w-32 text-blue-200" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/40 to-transparent"></div>

                {/* Overlay Header Content */}
                <div className="absolute bottom-0 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-md">
                                        {restaurant.cuisine}
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 text-yellow-400 border border-white/20">
                                        <Star className="h-4 w-4 fill-yellow-400" /> {restaurant.rating?.toFixed(1) || 'New'} ({reviews.length} Reviews)
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-blue-100 border border-white/20">
                                        {restaurant.priceRange}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight drop-shadow-xl">{restaurant.name}</h1>
                                <p className="text-blue-200 flex items-center gap-2 text-lg font-medium drop-shadow-md">
                                    <MapPin className="h-5 w-5" /> {restaurant.location?.address || 'Location unavailable'}
                                </p>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={handleCall}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl font-bold"
                                >
                                    <Phone className="h-5 w-5 text-blue-300" />
                                    <span className="hidden sm:inline">Call Now</span>
                                </button>
                                <button
                                    onClick={handleGoogleMaps}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 text-white backdrop-blur-md border border-blue-400/50 transition-all shadow-blue-900/50 shadow-xl font-bold"
                                >
                                    <MapIcon className="h-5 w-5 text-blue-100" />
                                    <span className="hidden sm:inline">View Map</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Details & Menu */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* CSS Grid Gallery Restructured */}
                        {restaurant.images && restaurant.images.length > 1 && (
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100">
                                <h2 className="text-2xl font-bold text-blue-950 mb-4 flex items-center gap-2">Photo Gallery</h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-[200px]">
                                    {restaurant.images.slice(1, 5).map((img, idx) => (
                                        <div key={idx} className="h-full rounded-2xl overflow-hidden group">
                                            <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ))}
                                    {/* Fill empty slots if less than 5 total images */}
                                    {Array.from({ length: 4 - (restaurant.images.length - 1) }).map((_, idx) => (
                                        <div key={`empty-${idx}`} className="h-full rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-center">
                                            <Utensils className="h-8 w-8 text-blue-200/50" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <h2 className="text-2xl font-bold text-blue-950 mb-4 relative z-10">About {restaurant.name}</h2>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 font-medium text-blue-800 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 relative z-10">
                                <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-600" /> {restaurant.openingTime} - {restaurant.closingTime}</span>
                                <span className="flex items-center gap-2"><Utensils className="h-5 w-5 text-blue-600" /> {restaurant.cuisine} Cuisine</span>
                                <span className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" /> Accommodates large groups</span>
                            </div>
                            <p className="text-blue-900/70 leading-relaxed text-lg relative z-10">{restaurant.description || "Come and experience our delightful menu and wonderful dining atmosphere!"}</p>
                        </section>

                        <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-blue-950 flex items-center gap-2"><Utensils className="text-blue-600" /> Menu Highlights</h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search dishes..."
                                        value={menuSearchTerm}
                                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 w-full bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm text-blue-900 placeholder-blue-300"
                                    />
                                </div>
                            </div>

                            {restaurant.menu && restaurant.menu.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {restaurant.menu
                                        .filter(item => item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()))
                                        .map((item, idx) => {
                                            const qty = preOrder[item.name]?.quantity || 0;
                                            return (
                                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-blue-50/30 border border-blue-100 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all gap-4">
                                                    <div>
                                                        <span className="text-blue-950 font-medium block text-lg">{item.name}</span>
                                                        <span className="font-semibold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-md inline-block mt-1">₹{item.price.toFixed(2)}</span>
                                                    </div>
                                                    {!orderAtRestaurant && (
                                                        <div className="flex items-center gap-3 bg-white rounded-xl p-1.5 border border-blue-100 shadow-sm shrink-0">
                                                            <button onClick={() => decrementItem(item)} className="h-8 w-8 flex items-center justify-center bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-bold active:scale-95 transition-all">-</button>
                                                            <span className="font-bold text-blue-950 inline-block w-4 text-center">{qty}</span>
                                                            <button onClick={() => incrementItem(item)} className="h-8 w-8 flex items-center justify-center bg-blue-600 rounded-lg text-white hover:bg-blue-700 font-bold active:scale-95 transition-all shadow-md shadow-blue-600/20">+</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
                                    <p className="text-blue-800/60 font-medium">Digital menu not uploaded yet. Ordering available at the table.</p>
                                </div>
                            )}
                        </section>

                        <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-blue-950 flex items-center gap-2"><MessageSquare className="text-blue-600" /> Customer Reviews</h2>
                                <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm">{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</span>
                            </div>

                            {/* Write Review Form */}
                            {canReview && (
                                <div className="mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-200">
                                    <h3 className="text-lg font-bold text-blue-950 mb-4">Write a Review</h3>
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-blue-900 mb-2">Rating</label>
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewRating(star)}
                                                        className={`p-1 transition-all focus:outline-none ${reviewRating >= star ? 'text-yellow-500 scale-110' : 'text-blue-200 hover:text-yellow-300'}`}
                                                    >
                                                        <Star className="h-8 w-8 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-blue-900 mb-2">Your Experience</label>
                                            <textarea
                                                rows="3"
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Share your dining experience..."
                                                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-blue-950 placeholder-blue-300"
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReview}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {reviews.length > 0 ? (
                                <div className="space-y-5">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="p-6 bg-blue-50/40 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold overflow-hidden border-2 border-white shadow-sm">
                                                        {review.userId?.avatar ? <img src={review.userId.avatar} className="h-full w-full object-cover" /> : review.userId?.name?.charAt(0) || 'A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-blue-950 block leading-tight">{review.userId?.name || 'Anonymous Diner'}</span>
                                                        <span className="text-xs text-blue-800/50 block font-medium mt-0.5">{format(new Date(review.createdAt), 'MMMM dd, yyyy')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center bg-white px-2.5 py-1 rounded-lg shadow-sm border border-blue-100">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                                                    <span className="ml-1.5 text-sm font-bold text-blue-950">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-blue-900/80 leading-relaxed font-medium mt-4">{review.comment}</p>
                                            {review.image && <div className="mt-4"><img src={review.image} alt="Review" className="h-28 w-28 object-cover rounded-xl shadow-md border-2 border-white" /></div>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
                                    <p className="text-blue-800/60 font-medium">No reviews yet. Be the first to review after dining!</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-b from-blue-950 to-blue-900 border text-blue-100 border-blue-800 rounded-[2rem] shadow-2xl p-6 md:p-8 sticky top-24 overflow-hidden relative">
                            {/* Decorative blur blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                            <h3 className="text-2xl font-extrabold mb-6 text-white flex items-center gap-2">Reserve a Table <ChevronRight className="h-5 w-5 text-blue-400" /></h3>
                            <form onSubmit={handleBooking} className="space-y-5 relative z-10">

                                <div>
                                    <label className="block text-sm font-bold text-blue-200 mb-1.5">Select Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-400/80 h-5 w-5 group-hover:text-blue-300 transition-colors" />
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]} // Cannot book past dates
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            className="pl-11 w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-300 py-3.5 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-md font-medium outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-blue-200 mb-1.5">Select Time</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-400/80 h-5 w-5 group-hover:text-blue-300 transition-colors pointer-events-none" />
                                        <select
                                            required
                                            value={timeSlot}
                                            onChange={(e) => setTimeSlot(e.target.value)}
                                            className="pl-11 w-full rounded-xl bg-blue-900/50 border border-white/10 text-white placeholder-blue-300 py-3.5 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-md font-medium outline-none appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark' }} // Attempt to style the dropdown options menu in some browsers
                                        >
                                            <option value="" disabled className="text-gray-500 bg-white">Select a time</option>
                                            {generateTimeSlots().map(slot => (
                                                <option key={slot} value={slot} className="bg-blue-900 text-white">{slot}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-blue-200 mb-1.5">Number of Guests</label>
                                    <div className="relative group">
                                        <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-400/80 h-5 w-5 group-hover:text-blue-300 transition-colors" />
                                        <input
                                            type="number"
                                            required min="1" max="20"
                                            value={guests}
                                            onChange={(e) => setGuests(parseInt(e.target.value))}
                                            className="pl-11 w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-300 py-3.5 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-md font-medium outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-blue-200 mb-1.5">Special Request (Optional)</label>
                                    <textarea
                                        rows="2"
                                        value={specialRequest}
                                        onChange={(e) => setSpecialRequest(e.target.value)}
                                        placeholder="Anniversary, Window seat..."
                                        className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-blue-300/50 py-3.5 px-4 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-md font-medium outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex items-center mt-2 group cursor-pointer" onClick={() => {
                                    setOrderAtRestaurant(!orderAtRestaurant);
                                    if (!orderAtRestaurant) setPreOrder({}); // Clear pre-order if choosing to order later
                                }}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${orderAtRestaurant ? 'bg-blue-500 border-blue-500' : 'border-blue-400/50 bg-white/5'}`}>
                                        {orderAtRestaurant && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className="text-sm font-medium text-blue-100 select-none group-hover:text-white transition-colors">I will order at the restaurant</span>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-4 px-1">
                                        <div className="flex items-center gap-1.5 group/info relative">
                                            <span className="text-sm font-medium text-blue-300">Confirmation Fee</span>
                                            <Info className="h-4 w-4 text-blue-400 cursor-help" />
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white text-blue-950 text-xs font-medium p-2 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 text-center pointer-events-none before:content-[''] before:absolute before:top-full before:left-6 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-white">
                                                This ₹100 fee secures your reservation and will be deducted from your final bill at the restaurant.
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-white">₹100.00</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isBooking}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.7)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.9)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2 border border-blue-400/30"
                                    >
                                        {isBooking ? 'Processing Payment...' : `Confirm Reservation`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;
