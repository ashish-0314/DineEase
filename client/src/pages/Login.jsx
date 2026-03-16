import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../context/useAuthStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Utensils, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            toast.success('Logged in successfully!');
            const { user } = useAuthStore.getState();
            if (user?.role === 'admin') navigate('/admin');
            else if (user?.role === 'owner') navigate('/owner');
            else navigate('/');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative p-4 sm:p-6 lg:p-8 bg-blue-950 overflow-hidden">

            {/* Glowing Orbs for extra depth against the solid backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse pointer-events-none z-0"></div>

            {/* Centered Glass Card containing the Split Layout */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgb(0,0,0,0.6)] border border-white/20 overflow-hidden relative z-10 flex flex-col md:flex-row"
            >
                {/* Left Side: Image (Restaurant Interior) */}
                <div className="hidden md:block md:w-1/2 relative min-h-[500px]">
                    <img
                        src="/auth-bg.png"
                        alt="Restaurant interior"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-950/80"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-10">
                        <div className="bg-blue-950/40 p-3 w-max rounded-2xl backdrop-blur-md border border-white/10 mb-4 shadow-xl">
                            <Utensils className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-md">
                            Experience the finest dining.
                        </h2>
                        <p className="text-blue-100 text-sm max-w-xs drop-shadow-sm">
                            Join DineEase to reserve exclusive tables and pre-order your favorite dishes.
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Welcome Back</h2>
                        <p className="mt-3 text-sm text-blue-200">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-white hover:text-blue-300 transition-colors underline decoration-blue-400/50 underline-offset-4">
                                Sign up for free
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-black/20 border border-white/10 text-white placeholder-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all sm:text-sm shadow-inner"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                        Sign In to DineEase
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

export default Login;
