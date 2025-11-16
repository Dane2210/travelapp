import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiHome, FiCompass, FiMapPin, FiTag, FiUsers, FiUser } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';

// Styles
import './styles/global.css';

// Pages
import Home from './pages/Home';
import Destinations from './pages/destinations/Destinations';
import Trips from './pages/trips/Trips';
import Deals from './pages/deals/Deals';
import Community from './pages/community/Community';
import Profile from './pages/profile/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Icons
const HomeIcon = ({ active }) => <FiHome className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const ExploreIcon = ({ active }) => <FiCompass className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const TripIcon = ({ active }) => <FaPlane className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const DealIcon = ({ active }) => <FiTag className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const CommunityIcon = ({ active }) => <FiUsers className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const ProfileIcon = ({ active }) => <FiUser className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;

// Navigation Component
function Navigation() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // Don't show navigation on auth pages
  if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center max-w-md mx-auto py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <HomeIcon active={activeTab === '/'} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link 
          to="/destinations" 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/destinations') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <ExploreIcon active={activeTab.startsWith('/destinations')} />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        <Link 
          to="/trips" 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/trips') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <TripIcon active={activeTab.startsWith('/trips')} />
          <span className="text-xs mt-1">Trips</span>
        </Link>
        <Link 
          to="/deals" 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/deals') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <DealIcon active={activeTab.startsWith('/deals')} />
          <span className="text-xs mt-1">Deals</span>
        </Link>
        <Link 
          to="/community" 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/community') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <CommunityIcon active={activeTab.startsWith('/community')} />
          <span className="text-xs mt-1">Community</span>
        </Link>
        <Link 
          to="/profile" 
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <ProfileIcon active={activeTab.startsWith('/profile')} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on initial load
  useEffect(() => {
    // Replace with actual authentication check
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Add padding bottom to account for fixed navigation
  useEffect(() => {
    document.body.style.paddingBottom = '80px';
    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/trips" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Trips />
              </ProtectedRoute>
            } />
            <Route path="/deals" element={<Deals />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        
        <Navigation />
      </div>
    </Router>
  );
}
