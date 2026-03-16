import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show the back button on the Home page
    if (location.pathname === '/') {
        return null;
    }

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGoBack}
                className="fixed bottom-6 left-6 z-[60] bg-blue-600/80 backdrop-blur-md text-white p-4 rounded-full shadow-2xl border border-white/20 hover:bg-blue-500 group flex items-center justify-center transition-colors"
                title="Go Back"
                aria-label="Go Back"
            >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </motion.button>
        </AnimatePresence>
    );
};

export default GlobalBackButton;
