import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ChevronDown, X, Navigation, Mic, Utensils, Building2 } from 'lucide-react';
import api from '../services/api';

const popularCities = [
    { name: 'Delhi NCR', icon: '🏛️' },
    { name: 'Mumbai', icon: '🏙️' },
    { name: 'Bengaluru', icon: '🌳' },
    { name: 'Chennai', icon: '🏖️' },
    { name: 'Pune', icon: '⛰️' },
    { name: 'Kolkata', icon: '🌉' },
    { name: 'Dubai', icon: '🗼' },
    { name: 'Goa', icon: '🌴' },
    { name: 'Ahmedabad', icon: '🕍' },
    { name: 'Jaipur', icon: '🏰' },
    { name: 'Agra', icon: '🕌' },
    { name: 'Hyderabad', icon: '⛩️' }
];

const SearchBar = () => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('Delhi NCR');

    // Autocomplete Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Location Search State
    const [locationSearchQuery, setLocationSearchQuery] = useState('');

    useEffect(() => {
        // Fetch all restaurants for local searching
        const fetchRestaurants = async () => {
            try {
                const res = await api.get('/restaurants');
                setRestaurants(res.data);
            } catch (e) {
                console.error("Failed to fetch restaurants for search", e);
            }
        };
        fetchRestaurants();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle typing in main search
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length > 0) {
            const q = query.toLowerCase();
            const newSuggestions = [];
            const seenCuisines = new Set();

            restaurants.forEach(r => {
                // 1. Match Restaurant Name
                if (r.name.toLowerCase().includes(q)) {
                    newSuggestions.push({ type: 'restaurant', text: r.name, subtext: r.cuisine, id: r._id, icon: <Building2 className="w-5 h-5" /> });
                }
                // 2. Match Cuisine
                if (r.cuisine.toLowerCase().includes(q) && !seenCuisines.has(r.cuisine)) {
                    seenCuisines.add(r.cuisine);
                    newSuggestions.push({ type: 'cuisine', text: r.cuisine, subtext: 'Cuisine', icon: <Utensils className="w-5 h-5" /> });
                }
                // 3. Match Menu Items
                if (r.menu) {
                    r.menu.forEach(m => {
                        if (m.name.toLowerCase().includes(q)) {
                            if (!newSuggestions.some(s => s.id === r._id && s.subtext?.includes('Dish'))) {
                                newSuggestions.push({ type: 'restaurant', text: r.name, subtext: `Matches Dish: ${m.name}`, id: r._id, icon: <Utensils className="w-5 h-5" /> });
                            }
                        }
                    });
                }
            });

            // Limit to top 8 suggestions
            setSuggestions(newSuggestions.slice(0, 8));
            setIsDropdownOpen(true);
        } else {
            setSuggestions([]);
            setIsDropdownOpen(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'restaurant' || suggestion.type === 'dish') {
            navigate(`/restaurant/${suggestion.id}`);
        } else if (suggestion.type === 'cuisine') {
            navigate(`/restaurants?cuisine=${encodeURIComponent(suggestion.text)}`);
        }
        setIsDropdownOpen(false);
    };

    const handleCitySelect = (city) => {
        setSelectedLocation(city);
        setIsLocationModalOpen(false);
        setLocationSearchQuery('');
    };

    const handleLocationSearchSubmit = (e) => {
        if (e.key === 'Enter' && locationSearchQuery.trim()) {
            handleCitySelect(locationSearchQuery.trim());
        }
    };

    // Combine popular cities with locations from the DB
    const dbLocations = restaurants.map(r => {
        if (!r.location?.address) return null;
        const parts = r.location.address.split(',');
        return parts.length > 1 ? parts[parts.length - 2].trim() : parts[0].trim();
    }).filter(Boolean);

    const allLocationsMap = new Map();
    popularCities.forEach(c => allLocationsMap.set(c.name.toLowerCase(), c));
    dbLocations.forEach(loc => {
        if (!allLocationsMap.has(loc.toLowerCase())) {
            allLocationsMap.set(loc.toLowerCase(), { name: loc, icon: '📍' });
        }
    });

    const allLocations = Array.from(allLocationsMap.values());
    const filteredCities = allLocations.filter(c => c.name.toLowerCase().includes(locationSearchQuery.toLowerCase()));

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 relative z-40">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 flex flex-col md:flex-row items-center border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]">

                {/* Location Selector */}
                <div
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex-shrink-0 flex text-gray-700 items-center justify-between gap-3 px-4 py-3 md:border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded-xl w-full md:w-64 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-primary-500" />
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Your Location</span>
                            <span className="font-semibold text-gray-800 truncate max-w-[120px]">{selectedLocation}</span>
                        </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>

                <div className="hidden md:block w-px h-10 bg-gray-200 mx-2"></div>

                {/* Search Input */}
                <div className="flex-grow flex items-center w-full px-4 py-3 group relative" ref={dropdownRef}>
                    <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search restaurants, cuisines, or dishes..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery.trim() && setIsDropdownOpen(true)}
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 px-4 py-1 text-lg outline-none"
                    />

                    {/* Autocomplete Dropdown */}
                    {isDropdownOpen && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            {suggestions.map((s, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                                >
                                    <div className="text-gray-400 bg-gray-100 p-2 rounded-lg">
                                        {s.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{s.text}</span>
                                        <span className="text-sm text-gray-500">{s.subtext}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Button */}
                <button
                    onClick={() => {
                        const params = new URLSearchParams();
                        if (searchQuery) params.append('search', searchQuery);
                        if (selectedLocation && selectedLocation !== 'Current Location') params.append('location', selectedLocation);
                        navigate(`/restaurants?${params.toString()}`);
                    }}
                    className="hidden md:flex bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-transform transform hover:scale-105 ml-2"
                >
                    Search
                </button>
            </div>

            {/* Location Modal Backdrop */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    {/* Modal Content */}
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Search Location</h2>
                            <button
                                onClick={() => setIsLocationModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {/* Inner Search Input */}
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for locality, area, city"
                                    value={locationSearchQuery}
                                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                                    onKeyDown={handleLocationSearchSubmit}
                                    className="w-full border border-gray-200 rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-lg shadow-sm"
                                />
                                {/* Removed manual Add button; now users tap auto-populated cities */}
                            </div>

                            {/* Current Location Button */}
                            <button
                                onClick={() => handleCitySelect('Current Location')}
                                className="flex items-center gap-3 text-red-500 font-bold hover:bg-red-50 px-4 py-3 rounded-xl transition-colors w-full mb-8 border border-red-100"
                            >
                                <Navigation className="h-5 w-5" />
                                <span>Use Current Location</span>
                            </button>

                            {/* Popular Cities */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    {locationSearchQuery ? 'Search Results' : 'Popular Cities'}
                                </h3>

                                {filteredCities.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {filteredCities.map((city) => (
                                            <button
                                                key={city.name}
                                                onClick={() => handleCitySelect(city.name)}
                                                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-md transition-all bg-white hover:bg-primary-50 group"
                                            >
                                                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{city.icon}</span>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{city.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 mb-2">No popular cities matched your search.</p>
                                        <p className="text-sm font-medium text-primary-600 cursor-pointer" onClick={() => handleCitySelect(locationSearchQuery.trim())}>
                                            Click here to select "{locationSearchQuery}" anyway
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
