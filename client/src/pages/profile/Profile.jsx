import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('trips');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [tripsError, setTripsError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (!data.session) {
        setLoading(false);
        return;
      }
      const uid = data.session.user.id;
      const { data: rows, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (err) {
        setError(err.message);
      } else {
        setProfile(rows || null);
      }
      // Load user's trips
      const { data: tripsRows, error: tripsErr } = await supabase
        .from('trips')
        .select('id,destination,start_date,end_date,notes,created_at')
        .eq('auth_user_id', uid)
        .order('start_date', { ascending: true });
      if (tripsErr) {
        setTripsError(tripsErr.message);
      } else {
        setTrips(tripsRows || []);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Compute a user view model every render to avoid conditional hooks
  const user = (() => {
    const u = session?.user;
    if (!u) return null;
    return {
      name: profile?.name || u.user_metadata?.name || u.user_metadata?.full_name || (u.email?.split('@')[0] || ''),
      username: profile?.username || u.user_metadata?.username || (u.user_metadata?.name ? u.user_metadata.name.replace(/\s+/g, '').toLowerCase() : (u.email?.split('@')[0] || '')),
      email: u.email,
      bio: profile?.bio || '',
      location: profile?.location || '',
      joinDate: new Date(u.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      avatar: profile?.avatar_url || 'profile-avatar.jpg',
      coverPhoto: profile?.cover_url || 'profile-cover.jpg',
      stats: { trips: 0, followers: 0, following: 0, posts: 0 },
      upcomingTrips: [],
      pastTrips: [],
    };
  })();

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page">
      {/* Cover Photo */}
      <div 
        className="profile-cover"
        style={{ backgroundImage: `url(${user.coverPhoto})` }}
      >
        <div className="profile-avatar-container">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="profile-avatar"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        {error && <div className="alert error">{error}</div>}
        <div className="profile-header">
          <div>
            <h1>{user.name}</h1>
            <p className="username">@{user.username}</p>
          </div>
          <button className="btn outline" onClick={() => navigate('/profile/edit')}>Edit Profile</button>
        </div>
        
        <p className="bio">{user.bio}</p>
        
        <div className="profile-meta">
          <span className="location">📍 {user.location}</span>
          <span className="join-date">Joined {user.joinDate}</span>
        </div>
        
        <div className="profile-stats">
          <div className="stat">
            <strong>{user.stats.trips}</strong>
            <span>Trips</span>
          </div>
          <div className="stat">
            <strong>{user.stats.followers}</strong>
            <span>Followers</span>
          </div>
          <div className="stat">
            <strong>{user.stats.following}</strong>
            <span>Following</span>
          </div>
          <div className="stat">
            <strong>{user.stats.posts}</strong>
            <span>Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('trips')}
        >
          My Trips
        </button>
        <button 
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button 
          className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          Photos
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'trips' && (
          <div className="trips-tab">
            {tripsError && <div className="alert error">{tripsError}</div>}
            <TripsSection trips={trips} onDelete={(id)=>{
              // delete trip then update local state
              (async () => {
                const { error } = await supabase.from('trips').delete().eq('id', id);
                if (error) {
                  alert('Failed to delete trip: ' + error.message);
                  return;
                }
                setTrips(prev => prev.filter(t => t.id !== id));
              })();
            }} />
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div className="saved-tab">
            <div className="empty-state">
              <p>You haven't saved any items yet.</p>
              <p>Save destinations, activities, and more to see them here.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            <div className="empty-state">
              <p>You haven't written any reviews yet.</p>
              <p>Share your experiences to help other travelers!</p>
            </div>
          </div>
        )}
        
        {activeTab === 'photos' && (
          <div className="photos-tab">
            <div className="empty-state">
              <p>You haven't uploaded any photos yet.</p>
              <p>Share your travel photos with the community!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TripsSection({ trips, onDelete }) {
  const grouped = useMemo(() => {
    const now = new Date();
    const fmt = (trip) => {
      const sd = trip.start_date ? new Date(trip.start_date) : null;
      const ed = trip.end_date ? new Date(trip.end_date) : null;
      const dates = sd && ed
        ? `${sd.toLocaleDateString()} - ${ed.toLocaleDateString()}`
        : sd ? `${sd.toLocaleDateString()}` : '';
      return { ...trip, _sd: sd, _ed: ed, dates };
    };
    const upcoming = [];
    const past = [];
    for (const t of (trips || []).map(fmt)) {
      const isPast = t._ed ? t._ed < now : false;
      (isPast ? past : upcoming).push(t);
    }
    return { upcoming, past };
  }, [trips]);

  return (
    <>
      <h2>Upcoming Trips</h2>
      {grouped.upcoming.length > 0 ? (
        <div className="trip-list">
          {grouped.upcoming.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-info">
                <h3>{trip.destination}</h3>
                <p>{trip.dates}</p>
              </div>
              <div className="trip-actions flex gap-2">
                <Link to={`/trips/${trip.id}`} className="btn">View Details</Link>
                <button className="btn outline" onClick={() => onDelete && onDelete(trip.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No upcoming trips planned.</p>
          <Link to="/trips/new" className="btn">Plan a Trip</Link>
        </div>
      )}

      <h2>Past Trips</h2>
      {grouped.past.length > 0 ? (
        <div className="trip-list">
          {grouped.past.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-info">
                <h3>{trip.destination}</h3>
                <p>{trip.dates}</p>
              </div>
              <div className="trip-actions flex gap-2">
                <Link to={`/trips/${trip.id}`} className="btn outline">View Details</Link>
                <button className="btn outline" onClick={() => onDelete && onDelete(trip.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No past trips found.</p>
        </div>
      )}
    </>
  );
}
