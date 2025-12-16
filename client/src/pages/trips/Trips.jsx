import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function Trips() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      const { data: sess } = await supabase.auth.getSession();
      const session = sess.session;
      if (!session) {
        setItems([]);
        setLoading(false);
        return;
      }
      const uid = session.user.id;
      const { data, error } = await supabase
        .from('trips')
        .select('id,destination,start_date,end_date,notes,created_at')
        .eq('auth_user_id', uid)
        .order('start_date', { ascending: true });
      if (error) {
        setError(error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

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
    for (const t of items.map(fmt)) {
      const isPast = t._ed ? t._ed < now : false;
      (isPast ? past : upcoming).push(t);
    }
    return { upcoming, past };
  }, [items]);

  const onDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) {
      alert('Failed to delete trip: ' + error.message);
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Trips</h1>
        <Link to="/trips/new" className="btn primary">Plan New Trip</Link>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Trips
        </button>
        <button 
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Trips
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="empty-state"><p>Loading trips...</p></div>
      ) : (
        <div className="trip-list">
          {grouped[activeTab].length > 0 ? (
            grouped[activeTab].map(trip => (
              <div key={trip.id} className="trip-card">
                <div className="trip-info">
                  <h3>{trip.destination}</h3>
                  <p>{trip.dates}</p>
                </div>
                <div className="trip-actions flex gap-2">
                  <Link to={`/trips/${trip.id}`} className="btn">View</Link>
                  <button className="btn outline" onClick={() => onDelete(trip.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No {activeTab} trips found.</p>
              {activeTab === 'upcoming' && (
                <Link to="/trips/new" className="btn">Plan Your First Trip</Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
