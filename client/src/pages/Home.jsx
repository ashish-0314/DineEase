import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, MapPin, Star, Compass, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const Home = () => {
    const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, verified, denied

    useEffect(() => {
        const fetchRestaurants = async (lat, lng) => {
            try {
                let url = '/restaurants';
                if (lat && lng) {
                    url += `?lat=${lat}&lng=${lng}&maxDistance=25000`; // 25km radius
                }
                const response = await api.get(url);
                // Get top 6 restaurants
                setNearbyRestaurants(response.data.slice(0, 6));
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationStatus('verified');
                    fetchRestaurants(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Geolocation denied or error:", error);
                    setLocationStatus('denied');
                    fetchRestaurants(); // Fetch default without location
                }
            );
        } else {
            setLocationStatus('denied');
            fetchRestaurants();
        }
    }, []);

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] font-sans bg-blue-50">
            {/* Premium Hero Section */}
            <section className="relative text-white overflow-hidden bg-blue-950 pt-16 pb-24 lg:pt-20 lg:pb-32">
                {/* Decorative background elements & Image Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-950/40 to-blue-950/90"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-100 mb-6 md:mb-8 backdrop-blur-md shadow-lg">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs md:text-sm font-semibold tracking-wide uppercase">The #1 Premium Dining Experience</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight drop-shadow-2xl">
                        Discover & Book the <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">Best Restaurants</span>
                    </h1>

                    <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl lg:max-w-3xl mb-8 md:mb-10 drop-shadow-md">
                        Your exclusive passport to local culinary gems. View AI-scanned menus, browse authentic reviews, and instantly secure your table.
                    </p>

                    {/* Integrated Search Bar Component within a glass card */}
                    <div className="w-full max-w-3xl lg:max-w-4xl bg-white/10 backdrop-blur-xl p-3 md:p-5 rounded-3xl border border-white/20 shadow-[0_0_40px_-5px_rgba(59,130,246,0.4)]">
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Nearby Restaurants Section */}
            <section className="py-20 bg-blue-50 relative -mt-8 rounded-t-[3rem] z-20 shadow-[-0_10px_40px_rgba(0,0,0,0.1)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-4 flex items-center gap-3">
                                {locationStatus === 'verified' ? (
                                    <><MapPin className="h-8 w-8 text-blue-600" /> Discover Near You</>
                                ) : (
                                    <><Compass className="h-8 w-8 text-blue-600" /> Top Rated Restaurants</>
                                )}
                            </h2>
                            <p className="text-blue-900/70 text-lg max-w-2xl">
                                {locationStatus === 'verified' ?
                                    "We've pinpointed the most highly-rated culinary experiences just around the corner from your current location." :
                                    "Explore our handpicked selection of the most exquisite dining destinations on the platform."}
                            </p>
                        </div>
                        <Link to="/restaurants" className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-xl">
                            View All <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="h-80 bg-white rounded-3xl animate-pulse shadow-xl border border-blue-100"></div>
                            ))}
                        </div>
                    ) : nearbyRestaurants.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-blue-100">
                            <Utensils className="h-16 w-16 text-blue-200 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-blue-900 mb-2">No restaurants found yet</h3>
                            <p className="text-blue-600">Check back later or expand your search area.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {nearbyRestaurants.map((restaurant) => (
                                <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100/50 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group flex flex-col h-full">
                                    <div className="h-56 bg-blue-100 overflow-hidden relative">
                                        {restaurant.images?.length > 0 ? (
                                            <img src={restaurant.images[0]} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                <Utensils className="h-12 w-12 text-blue-200" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg backdrop-blur-md">
                                                {restaurant.cuisine}
                                            </span>
                                            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-lg text-blue-950">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {restaurant.rating?.toFixed(1) || 'New'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-2xl font-black text-blue-950 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                                        <div className="flex items-center text-blue-700/70 text-sm mb-4 gap-4 font-medium">
                                            {restaurant.location?.address && <span className="flex items-center gap-1.5 truncate"><MapPin className="h-4 w-4 text-blue-400" /> {restaurant.location.address.split(',')[0]}</span>}
                                            <span className="flex items-center text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">{restaurant.priceRange}</span>
                                        </div>
                                        <p className="text-blue-900/60 text-sm line-clamp-2 leading-relaxed mt-auto">{restaurant.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Highlights Redesigned */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-4">Why Choose DineEase?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">Experience dining like never before with our cutting-edge platform tailored for food enthusiasts.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gradient-to-br from-blue-50/50 to-white p-8 md:p-10 rounded-[2.5rem] border border-blue-100/60 shadow-xl shadow-blue-900/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
                                <Utensils className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3 text-blue-950 relative z-10">AI Menu Intelligence</h3>
                            <p className="text-blue-900/70 leading-relaxed font-medium relative z-10">Instantly browse digital menus seamlessly extracted from physical formats using our powerful smart-scan AI technology.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gradient-to-br from-blue-50/50 to-white p-8 md:p-10 rounded-[2.5rem] border border-blue-100/60 shadow-xl shadow-blue-900/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10">
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3 text-blue-950 relative z-10">Hyper-Local Discovery</h3>
                            <p className="text-blue-900/70 leading-relaxed font-medium relative z-10">Uncover hidden culinary gems right in your neighborhood with our precise geographic mapping and intuitive tracking.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gradient-to-br from-blue-50/50 to-white p-8 md:p-10 rounded-[2.5rem] border border-blue-100/60 shadow-xl shadow-blue-900/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
                                <Star className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3 text-blue-950 relative z-10">Instant Reservations</h3>
                            <p className="text-blue-900/70 leading-relaxed font-medium relative z-10">Bypass lines forever. Check real-time table availability and guarantee your spot instantly with our robust booking engine.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
