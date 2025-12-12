import { useState } from 'react';
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';

export default function Search() {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 800);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <h1 className="text-xl font-bold mb-4">Search Trips</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to?"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="Dates (e.g. Mar 2 - Mar 9)"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUsers className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value))}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {[1,2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n} {n===1?'Traveler':'Travelers'}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition ${isSearching ? 'opacity-75' : ''}`}
        >
          {isSearching ? 'Searching...' : (
            <span className="inline-flex items-center justify-center"><FiSearch className="mr-2"/>Search</span>
          )}
        </button>
      </form>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Popular Destinations</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Paris','Tokyo','Bali','New York'].map((city) => (
            <div key={city} className="bg-white rounded-lg p-4 shadow-sm text-center">
              <p className="font-medium">{city}</p>
              <button className="text-blue-600 text-sm mt-2" onClick={() => setDestination(city)}>Search</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
