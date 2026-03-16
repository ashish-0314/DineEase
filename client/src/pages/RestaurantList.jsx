import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { MapPin, Search, Star, Utensils, Compass } from 'lucide-react';

// Fix for default Leaflet icon not showing correctly in React/Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically set map view dynamically
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
};

const RestaurantList = ({ showMap = false }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cuisineFilter, setCuisineFilter] = useState('');
    const [userLocation, setUserLocation] = useState(null); // [lat, lng]

    // Default to a central location if geolocation fails or is denied
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);

    const location = useLocation();

    useEffect(() => {
        // Parse Query Params
        const params = new URLSearchParams(location.search);
        const urlCuisine = params.get('cuisine');
        const urlSearch = params.get('search'); // Note: Global search not fully supported backend yet
        const urlLocation = params.get('location');
        if (urlCuisine) setCuisineFilter(urlCuisine);

        // Try to get user location
        if (showMap && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);
                    setMapCenter([lat, lng]);
                    fetchRestaurants(lat, lng);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    fetchRestaurants();
                }
            );
        } else {
            fetchRestaurants(null, null, urlCuisine, urlSearch, urlLocation);
        }
    }, [showMap, location.search]);

    const fetchRestaurants = async (lat, lng, urlCuisine, urlSearch, urlLocation) => {
        try {
            setLoading(true);
            let url = '/restaurants';
            const params = new URLSearchParams();

            if (lat && lng) {
                params.append('lat', lat);
                params.append('lng', lng);
                params.append('maxDistance', '25000'); // 25km radius
            }

            // Priority to urlCuisine if passed directly during mount, otherwise use state
            const activeCuisine = urlCuisine || cuisineFilter;
            if (activeCuisine) {
                params.append('cuisine', activeCuisine);
            }
            if (urlSearch) {
                params.append('search', urlSearch);
            }
            if (urlLocation && urlLocation !== 'Current Location') {
                params.append('location', urlLocation);
            }

            const response = await api.get(`${url}?${params.toString()}`);
            setRestaurants(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (userLocation) {
            fetchRestaurants(userLocation[0], userLocation[1]);
        } else {
            fetchRestaurants();
        }
    };

    return (
        <div className={`bg-slate-50 min-h-[calc(100vh-64px)] ${showMap ? '' : 'py-8'}`}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${showMap ? 'flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden gap-0' : ''}`}>

                {/* Sidebar / List View */}
                <div className={`${showMap ? 'w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-white shadow-[10px_0_30px_-5px_rgba(30,58,138,0.1)] border-r border-blue-100 z-10 p-6 md:p-8 overflow-y-auto' : 'w-full'}`}>
                    <div className="mb-8 shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 mb-4">
                            <Compass className="h-4 w-4" />
                            <span className="text-xs font-bold tracking-wider uppercase">Explore the City</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-blue-950 mb-6 drop-shadow-sm">
                            {showMap ? 'Discover Nearby' : 'All Restaurants'}
                        </h1>

                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Filter by Cuisine (e.g., Italian)"
                                    value={cuisineFilter}
                                    onChange={(e) => setCuisineFilter(e.target.value)}
                                    className="pl-12 pr-4 py-3.5 w-full bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder-blue-400 font-medium text-blue-950"
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 whitespace-nowrap">
                                Search
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="flex-grow flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-blue-50 rounded-3xl border border-blue-100">
                            <Utensils className="h-16 w-16 text-blue-300 mb-4" />
                            <h3 className="text-xl font-bold text-blue-950 mb-2">No restaurants found</h3>
                            <p className="text-blue-600/70 text-sm">We couldn't find any spots matching your criteria. Try adjusting your search.</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 flex-grow ${showMap ? 'grid-cols-1 pb-24 md:pb-8' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {restaurants.map((restaurant) => (
                                <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} className="bg-white rounded-3xl shadow-md shadow-blue-900/5 border border-blue-100 overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-300 transition-all duration-300 group flex flex-col">
                                    <div className="h-48 sm:h-56 overflow-hidden relative">
                                        {restaurant.images?.length > 0 ? (
                                            <img src={restaurant.images[0]} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
                                                <Utensils className="h-12 w-12 text-blue-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60"></div>
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm text-blue-950 border border-blue-100">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {restaurant.rating?.toFixed(1) || 'New'}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <h3 className="text-xl font-black text-blue-950 group-hover:text-blue-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                                            <span className="shrink-0 bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-sm border border-blue-200">{restaurant.priceRange}</span>
                                        </div>
                                        <div className="flex items-center text-blue-600/80 text-sm mb-3">
                                            <MapPin className="h-4 w-4 mr-1.5 text-blue-500 shrink-0" />
                                            <span className="line-clamp-1 font-medium">{restaurant.cuisine} • {restaurant.location?.address?.split(',')[0] || 'Unknown location'}</span>
                                        </div>
                                        <p className="text-blue-900/60 text-sm line-clamp-2 leading-relaxed mt-auto font-medium">{restaurant.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map View */}
                {showMap && (
                    <div className="hidden md:block md:w-[55%] lg:w-[60%] h-full relative z-0 bg-slate-100">
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            {/* Adding ZoomControl manually to position it bottom right usually looks better */}
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                className=""
                            />
                            <MapUpdater center={mapCenter} />

                            {/* User Location Marker */}
                            {userLocation && (
                                <Marker position={userLocation}>
                                    <Popup className="custom-popup">
                                        <div className="text-center p-1">
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                                                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                                                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                                            </div>
                                            <div className="font-bold text-blue-950">You are here</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Restaurant Markers */}
                            {restaurants.map((restaurant) => {
                                const hasLocation = restaurant.location?.coordinates?.length === 2;
                                if (!hasLocation) return null;

                                const position = [restaurant.location.coordinates[1], restaurant.location.coordinates[0]];

                                return (
                                    <Marker key={restaurant._id} position={position}>
                                        <Popup className="custom-popup">
                                            <div className="w-48 overflow-hidden rounded-xl border-none">
                                                {restaurant.images?.[0] && (
                                                    <div className="h-24 w-full -mx-5 -mt-4 mb-3 relative rounded-t-xl overflow-hidden">
                                                        <img src={restaurant.images[0]} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-blue-950 text-base mb-1 line-clamp-1">{restaurant.name}</h3>
                                                <div className="flex items-center gap-1 text-sm font-medium text-blue-700/80 mb-3">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {restaurant.rating?.toFixed(1) || 'New'} • {restaurant.cuisine}
                                                </div>
                                                <Link
                                                    to={`/restaurant/${restaurant._id}`}
                                                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                                                >
                                                    View Table
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>

                        {/* Map Overlay Gradient (Optional for depth) */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-[400]"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantList;
