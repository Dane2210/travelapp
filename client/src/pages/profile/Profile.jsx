import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('trips');
  
  // Sample user data - replace with real data from your API
  const user = {
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@example.com',
    bio: 'Travel enthusiast | Photographer | Foodie',
    location: 'San Francisco, CA',
    joinDate: 'January 2023',
    avatar: 'profile-avatar.jpg',
    coverPhoto: 'profile-cover.jpg',
    stats: {
      trips: 12,
      followers: 245,
      following: 189,
      posts: 56
    },
    upcomingTrips: [
      { id: 1, destination: 'Paris, France', dates: 'Jun 15 - Jun 30, 2024' },
      { id: 2, destination: 'Tokyo, Japan', dates: 'Dec 1 - Dec 15, 2024' },
    ],
    pastTrips: [
      { id: 3, destination: 'New York, USA', dates: 'Mar 10 - Mar 17, 2023', rating: 5 },
      { id: 4, destination: 'Barcelona, Spain', dates: 'Sep 5 - Sep 12, 2023', rating: 4 },
    ]
  };

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
        <div className="profile-header">
          <div>
            <h1>{user.name}</h1>
            <p className="username">@{user.username}</p>
          </div>
          <button className="btn outline">Edit Profile</button>
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
            <h2>Upcoming Trips</h2>
            {user.upcomingTrips.length > 0 ? (
              <div className="trip-list">
                {user.upcomingTrips.map(trip => (
                  <div key={trip.id} className="trip-card">
                    <div className="trip-info">
                      <h3>{trip.destination}</h3>
                      <p>{trip.dates}</p>
                    </div>
                    <div className="trip-actions">
                      <Link to={`/trips/${trip.id}`} className="btn">View Details</Link>
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
            {user.pastTrips.length > 0 ? (
              <div className="trip-list">
                {user.pastTrips.map(trip => (
                  <div key={trip.id} className="trip-card">
                    <div className="trip-info">
                      <h3>{trip.destination}</h3>
                      <p>{trip.dates}</p>
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < trip.rating ? 'filled' : ''}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="trip-actions">
                      <Link to={`/trips/${trip.id}`} className="btn outline">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No past trips found.</p>
              </div>
            )}
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
