import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Upload, Trash2, ArrowLeft, ImageIcon, Film, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerMediaManage = () => {
    const { id } = useParams();
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null); // { type: 'image' | 'video', url: string }

    useEffect(() => {
        fetchRestaurant();
    }, [id]);

    const fetchRestaurant = async () => {
        try {
            const res = await api.get(`/restaurants/${id}`);
            setRestaurant(res.data);
        } catch (error) {
            toast.error('Failed to load restaurant details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) return toast.error('Please select images/videos');

        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));

        try {
            setIsUploading(true);
            const res = await api.post(`/restaurants/${id}/media`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Media uploaded successfully!');
            setRestaurant(res.data.restaurant);
            setFiles([]);
            // Clear file input
            document.getElementById('file-upload').value = '';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (url) => {
        if (!window.confirm("Are you sure you want to delete this media?")) return;
        try {
            const res = await api.put(`/restaurants/${id}/media/delete`, { url });
            toast.success('Media deleted successfully');
            setRestaurant(res.data.restaurant);
            if (selectedMedia?.url === url) {
                setSelectedMedia(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete media');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-blue-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );

    return (
        <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 bg-blue-950 font-sans">
            {/* Glowing Orbs for extra depth */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse pointer-events-none z-0"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link to="/owner" className="flex items-center gap-2 text-blue-300 hover:text-white mb-2 transition-colors w-fit">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Media Management</h1>
                        <p className="text-blue-200 mt-1">Manage high-quality photos and videos for {restaurant?.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Upload Form */}
                    <div className="lg:col-span-1 border-t-4 border-blue-400">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/20 backdrop-blur-xl p-6 rounded-b-2xl border border-white/10 shadow-xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Upload className="h-5 w-5 text-blue-400" /> Upload New Media
                            </h2>
                            <form onSubmit={handleUpload}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-blue-200 mb-2">Select Files (Images/Videos)</label>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={(e) => setFiles(e.target.files)}
                                        className="block w-full text-sm text-gray-300
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-xl file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-white/10 file:text-white
                                            hover:file:bg-white/20 transition-all
                                            border border-white/10 rounded-xl p-2 bg-black/20"
                                    />
                                    {files.length > 0 && (
                                        <p className="mt-2 text-sm text-blue-300">{files.length} file(s) selected.</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading || files.length === 0}
                                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 font-bold shadow-lg transition-all"
                                >
                                    {isUploading ? (
                                        <><div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Uploading...</>
                                    ) : (
                                        <><Upload className="h-5 w-5" /> Upload to Gallery</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column: Display Grid */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-blue-400" /> Current Gallery
                            </h2>

                            {/* Images */}
                            <div className="mb-8">
                                <h3 className="text-blue-200 font-semibold mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                    <ImageIcon className="h-4 w-4" /> Photos ({restaurant?.images?.length || 0})
                                </h3>
                                {restaurant?.images?.length === 0 ? (
                                    <p className="text-gray-400 text-sm italic">No photos uploaded yet.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {restaurant?.images?.map((url, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-white/10 bg-black/40">
                                                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-4">
                                                    <button
                                                        onClick={() => setSelectedMedia({ type: 'image', url })}
                                                        className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transform hover:scale-110 transition-all shadow-lg"
                                                        title="View Fullscreen"
                                                    >
                                                        <Maximize2 className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(url)}
                                                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg"
                                                        title="Delete Photo"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Videos */}
                            <div>
                                <h3 className="text-blue-200 font-semibold mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                                    <Film className="h-4 w-4" /> Videos ({restaurant?.videos?.length || 0})
                                </h3>
                                {restaurant?.videos?.length === 0 ? (
                                    <p className="text-gray-400 text-sm italic">No videos uploaded yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {restaurant?.videos?.map((url, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-white/10 bg-black/40">
                                                <video src={url} className="w-full h-full object-cover" controls preload="metadata"></video>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2">
                                                    <button
                                                        onClick={() => setSelectedMedia({ type: 'video', url })}
                                                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transform hover:scale-110 transition-all shadow-lg"
                                                        title="View Fullscreen"
                                                    >
                                                        <Maximize2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(url)}
                                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg"
                                                        title="Delete Video"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Full Screen Modal View */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setSelectedMedia(null)} // Close when clicking background
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedia(null);
                            }}
                            className="absolute top-6 right-6 bg-white/10 hover:bg-red-500/80 text-white p-3 rounded-full transition-colors z-50 border border-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-7xl max-h-full aspect-auto w-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()} // Prevent close when clicking the media itself
                        >
                            {selectedMedia.type === 'image' ? (
                                <img
                                    src={selectedMedia.url}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                                    alt="Fullscreen"
                                />
                            ) : (
                                <video
                                    src={selectedMedia.url}
                                    className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10"
                                    controls
                                    autoPlay
                                // Try to mute to allow autoplay in some browsers, but user wants to watch the video
                                ></video>
                            )}

                            {/* Optional: Add a subtle text label below or overlay */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white/50 text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                                Full Screen Mode
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OwnerMediaManage;
