import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiHome, FiSearch, FiMapPin, FiUsers, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';

// Styles
import './styles/global.css';

// Pages
import Home from './pages/Home';
import Trips from './pages/trips/Trips';
import Community from './pages/community/Community';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Search from './pages/search/Search';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import ModeratorPanel from './pages/moderator/ModeratorPanel';
import { supabase } from './lib/supabaseClient';

// Icons
const HomeIcon = ({ active }) => <FiHome className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const SearchIcon = ({ active }) => <FiSearch className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const TripIcon = ({ active }) => <FaPlane className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const CommunityIcon = ({ active }) => <FiUsers className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;
const ProfileIcon = ({ active }) => <FiUser className={`icon ${active ? 'text-blue-600' : 'text-gray-500'}`} />;

// Drawer
function Drawer({ open, onClose, children }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><FiX className="w-5 h-5"/></button>
        </div>
        <div className="p-2 overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );
}

// Navigation Component
function Navigation() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // Hide on auth and onboarding pages
  if (['/login', '/register', '/forgot-password', '/onboarding'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Top bar with menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-md mx-auto flex items-center justify-end p-2">
          <button onClick={() => setDrawerOpen(true)} className="p-2 rounded hover:bg-gray-100">
            <FiMenu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
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
            to="/search" 
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/search') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
          >
            <SearchIcon active={activeTab.startsWith('/search')} />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link 
            to="/trips" 
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${activeTab.startsWith('/trips') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
          >
            <TripIcon active={activeTab.startsWith('/trips')} />
            <span className="text-xs mt-1">Trips</span>
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

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="space-y-1">
          <Link to="/community" className="block px-4 py-3 rounded hover:bg-gray-100" onClick={()=>setDrawerOpen(false)}>Community</Link>
          {/* Role-based Moderator link */}
          {['moderator','admin'].includes(localStorage.getItem('userRole')) && (
            <Link to="/moderator" className="block px-4 py-3 rounded hover:bg-gray-100" onClick={()=>setDrawerOpen(false)}>Moderator Panel</Link>
          )}
          <Link to="/settings" className="block px-4 py-3 rounded hover:bg-gray-100" onClick={()=>setDrawerOpen(false)}>Settings</Link>
          <button
            className="block w-full text-left px-4 py-3 rounded hover:bg-gray-100 text-red-600"
            onClick={() => {
              supabase.auth.signOut().finally(() => {
                // preserve onboarding flag; clear role
                localStorage.removeItem('userRole');
                setDrawerOpen(false);
                window.location.href = '/login';
              });
            }}
          >
            Logout
          </button>
        </div>
      </Drawer>
    </>
  );
}

// Protected Route Component with optional roles
function ProtectedRoute({ children, isAuthenticated, roles }) {
  const role = localStorage.getItem('userRole');
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (roles && Array.isArray(roles) && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
}

// Onboarding redirect wrapper
function OnboardingGate({ children }) {
  const navigate = useLocation(); // placeholder to allow hook usage below
  const loc = useLocation();
  useEffect(() => {
    const needsOnboarding = localStorage.getItem('hasOnboarded') !== 'true';
    if (needsOnboarding && loc.pathname !== '/onboarding') {
      // Navigate to onboarding
      window.history.replaceState({}, '', '/onboarding');
    }
  }, [loc.pathname]);
  return children;
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on initial load
  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthenticated(!!data.session);
    }
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user?.user_metadata?.role) {
        localStorage.setItem('userRole', session.user.user_metadata.role);
      } else if (!session) {
        localStorage.removeItem('userRole');
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
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
        <main className="container mx-auto px-4 pt-14 pb-24">
          <OnboardingGate>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/trips" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Trips />
                </ProtectedRoute>
              } />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/edit" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <EditProfile />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />
              <Route path="/moderator" element={
                <ProtectedRoute isAuthenticated={isAuthenticated} roles={['moderator','admin']}>
                  <ModeratorPanel />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </OnboardingGate>
        </main>
        
        <Navigation />
      </div>
    </Router>
  );
}
