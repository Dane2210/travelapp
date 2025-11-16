import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Trips() {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Sample trip data - replace with real data from your API
  const trips = {
    upcoming: [
      { id: 1, destination: 'Paris, France', dates: 'Jun 15 - Jun 30, 2024', status: 'Planned' },
      { id: 2, destination: 'Tokyo, Japan', dates: 'Dec 1 - Dec 15, 2024', status: 'Confirmed' },
    ],
    past: [
      { id: 3, destination: 'New York, USA', dates: 'Mar 10 - Mar 17, 2023', status: 'Completed' },
    ]
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

      <div className="trip-list">
        {trips[activeTab].length > 0 ? (
          trips[activeTab].map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-info">
                <h3>{trip.destination}</h3>
                <p>{trip.dates}</p>
                <span className={`status-badge ${trip.status.toLowerCase()}`}>
                  {trip.status}
                </span>
              </div>
              <div className="trip-actions">
                <Link to={`/trips/${trip.id}`} className="btn">View Details</Link>
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
    </div>
  );
}
