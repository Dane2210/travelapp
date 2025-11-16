import { useState } from 'react';

export default function Deals() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Sample deals data - replace with real data from your API
  const deals = [
    {
      id: 1,
      title: 'Summer in Europe',
      description: 'Up to 30% off flights to top European destinations',
      type: 'flight',
      discount: 30,
      expiry: '2024-05-31',
      code: 'EUROPE30'
    },
    {
      id: 2,
      title: 'Beach Getaway',
      description: '40% off hotel stays at beach destinations',
      type: 'hotel',
      discount: 40,
      expiry: '2024-06-15',
      code: 'BEACH40'
    },
    {
      id: 3,
      title: 'Weekend Special',
      description: 'Last-minute hotel deals for the weekend',
      type: 'hotel',
      discount: 25,
      expiry: '2024-05-20',
      code: 'WEEKEND25'
    }
  ];

  const filteredDeals = activeFilter === 'all' 
    ? deals 
    : deals.filter(deal => deal.type === activeFilter);

  const formatExpiry = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="page">
      <h1>Exclusive Travel Deals</h1>
      <p className="subtitle">Find the best offers for your next adventure</p>
      
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Deals
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'flight' ? 'active' : ''}`}
          onClick={() => setActiveFilter('flight')}
        >
          Flights
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'hotel' ? 'active' : ''}`}
          onClick={() => setActiveFilter('hotel')}
        >
          Hotels
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'package' ? 'active' : ''}`}
          onClick={() => setActiveFilter('package')}
        >
          Packages
        </button>
      </div>

      <div className="deals-grid">
        {filteredDeals.length > 0 ? (
          filteredDeals.map(deal => (
            <div key={deal.id} className="deal-card">
              <div className="deal-badge">-{deal.discount}%</div>
              <div className="deal-content">
                <h3>{deal.title}</h3>
                <p>{deal.description}</p>
                <div className="deal-meta">
                  <span className="expiry">Expires: {formatExpiry(deal.expiry)}</span>
                  {deal.code && (
                    <div className="promo-code">
                      <span>Use code: </span>
                      <strong>{deal.code}</strong>
                    </div>
                  )}
                </div>
                <button className="btn primary">View Deal</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No {activeFilter === 'all' ? '' : activeFilter} deals available at the moment.</p>
            <p>Check back later for new offers!</p>
          </div>
        )}
      </div>
    </div>
  );
}
