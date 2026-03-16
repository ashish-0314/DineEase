import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalBackButton from './components/GlobalBackButton';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardOwner from './pages/DashboardOwner';
import OwnerMenuManage from './pages/OwnerMenuManage';
import OwnerBookings from './pages/OwnerBookings';
import OwnerMediaManage from './pages/OwnerMediaManage';
import ProfileUser from './pages/ProfileUser';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
        <Toaster position="top-center" richColors />
        <Navbar />
        <GlobalBackButton />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurants" element={<RestaurantList showMap={false} />} />
            <Route path="/map" element={<RestaurantList showMap={true} />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<DashboardAdmin />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="/owner" element={<DashboardOwner />} />
              <Route path="/owner/restaurant/:id/menu" element={<OwnerMenuManage />} />
              <Route path="/owner/restaurant/:id/bookings" element={<OwnerBookings />} />
              <Route path="/owner/restaurant/:id/media" element={<OwnerMediaManage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['user', 'owner', 'admin']} />}>
              <Route path="/profile/*" element={<ProfileUser />} />
              {/* Other shared protected routes like booking pages */}
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
