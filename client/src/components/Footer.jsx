import { Github, Linkedin, Mail, Heart, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-blue-950 border-t border-white/10 pt-16 pb-8 text-blue-200 font-sans mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
                            <Utensils className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-2xl text-white tracking-tight">DineEase</span>
                        </Link>
                        <p className="text-sm text-blue-300/80 mb-6 leading-relaxed">
                            Your one-stop platform to discover local culinary gems, view AI-scanned menus, and instantly book tables at the best restaurants in town.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase text-sm">Explore</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="hover:text-white transition-colors flex items-center gap-2 text-sm"><span className="h-1 w-1 bg-blue-500 rounded-full"></span> Home</Link></li>
                            <li><Link to="/map" className="hover:text-white transition-colors flex items-center gap-2 text-sm"><span className="h-1 w-1 bg-blue-500 rounded-full"></span> Map Search</Link></li>
                            <li><Link to="/restaurants" className="hover:text-white transition-colors flex items-center gap-2 text-sm"><span className="h-1 w-1 bg-blue-500 rounded-full"></span> All Restaurants</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg tracking-wide uppercase text-sm">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 text-sm"><span className="h-1 w-1 bg-blue-500 rounded-full"></span> Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 text-sm"><span className="h-1 w-1 bg-blue-500 rounded-full"></span> Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 text-sm"><span className="h-1 w-1 bg-blue-500 rounded-full"></span> Cookie Guidelines</a></li>
                        </ul>
                    </div>

                    {/* Developer Info */}
                    <div>
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                Developer Info
                            </h4>
                            <p className="text-xl font-extrabold text-white tracking-tight mb-4">Riya</p>
                            <div className="flex gap-4">
                                <a
                                    href="https://github.com/r-iya"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/10 p-2 rounded-xl hover:bg-white hover:text-black transition-all group"
                                    title="GitHub"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/riya9454/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/10 p-2 rounded-xl hover:bg-[#0A66C2] hover:text-white transition-all group"
                                    title="LinkedIn"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a
                                    href="mailto:riyaaa9454@gmail.com"
                                    className="bg-white/10 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
                                    title="Email"
                                >
                                    <Mail className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-300/60">
                    <p>&copy; {new Date().getFullYear()} DineEase. All rights reserved.</p>
                    <p className="flex items-center gap-1">Crafted for a seamless dining experience.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
