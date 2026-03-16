import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Upload, Camera, Save, RefreshCw, ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const OwnerMenuManage = () => {
    const { id } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRestaurant();
    }, [id]);

    const fetchRestaurant = async () => {
        try {
            const res = await api.get(`/restaurants/${id}`);
            setMenuItems(res.data.menu || []);
        } catch (error) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleAIParse = async () => {
        if (!imageFile) return toast.error('Please select an image first');

        const formData = new FormData();
        formData.append('menuImage', imageFile);

        try {
            setIsParsing(true);
            const res = await api.post('/restaurants/menu/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Append parsed items to current
            setMenuItems([...menuItems, ...res.data.items]);
            toast.success('Menu parsed successfully. Please review and save.');
            setImageFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to parse image. Try manual entry.');
        } finally {
            setIsParsing(false);
        }
    };

    const saveMenu = async () => {
        try {
            setIsSaving(true);
            await api.put(`/restaurants/${id}/menu`, { menuItems });
            toast.success('Menu saved successfully!');
        } catch (error) {
            toast.error('Failed to save menu');
        } finally {
            setIsSaving(false);
        }
    };

    const addManualItem = () => {
        setMenuItems([...menuItems, { name: '', price: '' }]);
    };

    const updateItem = (index, field, value) => {
        const updated = [...menuItems];
        updated[index][field] = value;
        setMenuItems(updated);
    };

    const removeItem = (index) => {
        const updated = [...menuItems];
        updated.splice(index, 1);
        setMenuItems(updated);
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

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link to="/owner" className="flex items-center gap-2 text-blue-300 hover:text-white mb-2 transition-colors w-fit">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Smart Menu Management</h1>
                        <p className="text-blue-200 mt-1">Upload a picture of your physical menu, or add items manually.</p>
                    </div>
                </div>

                {/* AI AI Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl mb-8"
                >
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Camera className="text-blue-400" /> AI Menu Scanner</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-300
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-xl file:border-0
                                file:text-sm file:font-semibold
                                file:bg-white/10 file:text-white
                                hover:file:bg-white/20 transition-all
                                border border-white/10 rounded-xl p-2 bg-black/20"
                        />
                        <button
                            onClick={handleAIParse}
                            disabled={isParsing || !imageFile}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap flex items-center gap-2 font-bold shadow-lg transition-all"
                        >
                            {isParsing ? <><RefreshCw className="h-5 w-5 animate-spin" /> Scanning...</> : <><Upload className="h-5 w-5" /> Scan Menu</>}
                        </button>
                    </div>
                </motion.div>

                {/* Manual / Editor Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-blue-400" /> Menu Items List</h2>
                        <button onClick={addManualItem} className="text-blue-300 hover:text-white font-medium hover:underline text-sm transition-colors">+ Add Item Manually</button>
                    </div>

                    {menuItems.length === 0 ? (
                        <p className="text-blue-200/60 text-center py-8 italic">No items yet. Scan an image or add manually!</p>
                    ) : (
                        <div className="space-y-4 mb-6">
                            {menuItems.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-black/40 p-2 rounded-xl border border-white/5">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                        placeholder="Item Name"
                                        className="flex-grow bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                                            placeholder="0.00"
                                            className="w-full bg-transparent border border-white/10 rounded-lg p-3 pl-7 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </div>
                                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-3 rounded-lg font-bold text-xl transition-colors">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end border-t border-white/10 pt-6 mt-6">
                        <button
                            onClick={saveMenu}
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2 font-bold shadow-lg transition-all"
                        >
                            {isSaving ? (
                                <><div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                            ) : (
                                <><Save className="h-5 w-5" /> Save Final Menu</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OwnerMenuManage;
