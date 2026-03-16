import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../context/useAuthStore';
import { Utensils, LogOut, User as UserIcon, Settings, Calendar, Store, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if on auth pages to potentially make navbar blend better
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`sticky top-0 z-50 transition-colors duration-300 ${isAuthPage ? 'bg-blue-950 border-b border-white/10 shadow-none' : 'bg-blue-900 shadow-lg border-b border-blue-800'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-shrink-0 items-center gap-2 group">
                            <Utensils className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-2xl text-white tracking-tight">DineEase</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Map Search - Always Visible */}
                        <Link to="/map" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium text-sm">
                            <MapPin className="h-4 w-4 text-blue-300" />
                            <span className="hidden sm:inline">Map Search</span>
                        </Link>

                        {!isAuthenticated ? (
                            <div className="relative flex items-center bg-white/10 p-1 rounded-xl border border-white/10 shadow-inner">
                                <Link
                                    to="/login"
                                    className={`relative z-10 w-24 flex justify-center py-2 text-sm font-bold transition-colors ${location.pathname === '/login' ? 'text-blue-900' : 'text-blue-100 hover:text-white'}`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className={`relative z-10 w-24 flex justify-center py-2 text-sm font-bold transition-colors ${location.pathname !== '/login' ? 'text-blue-900' : 'text-blue-100 hover:text-white'}`}
                                >
                                    Sign Up
                                </Link>

                                <motion.div
                                    className="absolute top-1 bottom-1 w-24 bg-white rounded-lg shadow-md pointer-events-none"
                                    initial={false}
                                    animate={{
                                        x: location.pathname === '/login' ? 0 : 96
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium text-sm">
                                        <Settings className="h-4 w-4 text-blue-300" />
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </Link>
                                )}

                                {user?.role === 'owner' && (
                                    <Link to="/owner" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium text-sm">
                                        <Store className="h-4 w-4 text-blue-300" />
                                        <span className="hidden sm:inline">My Restaurant</span>
                                    </Link>
                                )}

                                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-white rounded-xl border border-blue-500/30 transition-colors shadow-sm font-medium text-sm group">
                                    <div className="h-6 w-6 rounded-full bg-blue-500 overflow-hidden border border-white/20 flex items-center justify-center">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <span className="hidden sm:inline font-bold">{user?.name}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white rounded-xl border border-red-500/20 transition-all font-bold text-sm ml-2 shadow-sm hover:shadow-md"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
