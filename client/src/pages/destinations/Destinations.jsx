import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Destinations() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // This would be replaced with actual data from your API
  const destinations = [
    { id: 1, name: 'Paris', country: 'France', image: 'paris.jpg' },
    { id: 2, name: 'Tokyo', country: 'Japan', image: 'tokyo.jpg' },
    { id: 3, name: 'New York', country: 'USA', image: 'nyc.jpg' },
    { id: 4, name: 'Rome', country: 'Italy', image: 'rome.jpg' },
  ];

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <h1>Explore Destinations</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="destination-grid">
        {filteredDestinations.map(destination => (
          <div key={destination.id} className="destination-card">
            <div className="destination-image" style={{ backgroundImage: `url(${destination.image})` }}></div>
            <div className="destination-info">
              <h3>{destination.name}</h3>
              <p>{destination.country}</p>
              <Link to={`/destinations/${destination.id}`} className="btn">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
