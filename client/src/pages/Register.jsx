import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../context/useAuthStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Utensils, Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            toast.success('Account created successfully!');
            const { user } = useAuthStore.getState();
            if (user?.role === 'owner') navigate('/owner');
            else navigate('/');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative p-4 sm:p-6 lg:p-8 bg-blue-950 overflow-hidden">

            {/* Glowing Orbs for extra depth against the solid backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse pointer-events-none z-0"></div>

            {/* Centered Glass Card containing the Split Layout */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgb(0,0,0,0.6)] border border-white/20 overflow-hidden relative z-10 flex flex-col md:flex-row-reverse"
            >
                {/* Left Side (Actually Right on Desktop): Image */}
                <div className="hidden md:block w-full md:w-1/2 relative min-h-[500px]">
                    <img
                        src="/auth-bg.png"
                        alt="Restaurant interior"
                        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-950/80"></div>
                    <div className="absolute inset-0 flex flex-col text-right justify-end p-10 items-end">
                        <div className="bg-blue-950/40 p-3 w-max rounded-2xl backdrop-blur-md border border-white/10 mb-4 shadow-xl">
                            <Utensils className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
                            Join DineEase.
                        </h2>
                        <p className="text-blue-100 text-sm max-w-xs drop-shadow-sm">
                            Connect with amazing restaurants or manage your own bookings effortlessly.
                        </p>
                    </div>
                </div>

                {/* Right Side (Actually Left on Desktop): Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Create Account</h2>
                        <p className="mt-3 text-sm text-blue-200">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-white hover:text-blue-300 transition-colors underline decoration-blue-400/50 underline-offset-4">
                                Sign in instead
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Custom Animated Role Toggle */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-blue-100 mb-3 text-center">I am signing up as a...</label>
                            <div className="relative flex bg-black/20 border border-white/10 p-1.5 rounded-2xl shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect('user')}
                                    className={`relative w-1/2 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors z-10 ${formData.role === 'user' ? 'text-blue-900' : 'text-blue-200 hover:text-white'}`}
                                >
                                    <Utensils className="w-4 h-4" /> Diner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect('owner')}
                                    className={`relative w-1/2 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors z-10 ${formData.role === 'owner' ? 'text-blue-900' : 'text-blue-200 hover:text-white'}`}
                                >
                                    <Building2 className="w-4 h-4" /> Restaurateur
                                </button>

                                {/* Sliding Pill Background */}
                                <motion.div
                                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md pointer-events-none"
                                    initial={false}
                                    animate={{
                                        left: formData.role === 'user' ? '6px' : 'calc(50% + 0px)'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <AnimatePresence>
                                {formData.role === 'user' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative group overflow-hidden"
                                    >
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                        </div>
                                        <input
                                            name="phone"
                                            type="tel"
                                            required={formData.role === 'user'}
                                            className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                                            placeholder="Phone Number (for alerts)"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-white transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-blue-900 bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Create Free Account
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
