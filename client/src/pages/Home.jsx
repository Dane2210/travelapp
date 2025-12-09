import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaStar, FaPlane, FaHotel, FaUmbrellaBeach, FaMountain, FaCity, FaUtensils } from 'react-icons/fa';

const popularDestinations = [
  {
    id: 1,
    name: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    price: '$899',
    rating: 4.8,
    type: 'Beach',
    distance: '2,500 miles away',
    dates: 'Apr 1-8',
  },
  {
    id: 2,
    name: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1579493934830-1a3e3c7d7c3c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    price: '$1,299',
    rating: 4.9,
    type: 'Island',
    distance: '5,200 miles away',
    dates: 'May 10-17',
  },
  {
    id: 3,
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    price: '$1,199',
    rating: 4.7,
    type: 'City',
    distance: '5,800 miles away',
    dates: 'Mar 15-22',
  },
];

const travelCategories = [
  { id: 1, name: 'Flights', icon: <FaPlane className="w-6 h-6" /> },
  { id: 2, name: 'Hotels', icon: <FaHotel className="w-6 h-6" /> },
  { id: 3, name: 'Beach', icon: <FaUmbrellaBeach className="w-6 h-6" /> },
  { id: 4, name: 'Mountains', icon: <FaMountain className="w-6 h-6" /> },
  { id: 5, name: 'City', icon: <FaCity className="w-6 h-6" /> },
  { id: 6, name: 'Food', icon: <FaUtensils className="w-6 h-6" /> },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaPlane className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">TravelApp</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Stays</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Flights</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Cars</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Experiences</a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden md:block text-gray-600 hover:text-blue-600 font-medium">Sign in</button>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-16 pb-24 px-4">
        <div className="container mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Find your next adventure</h1>
          <p className="text-xl text-center mb-10 max-w-2xl mx-auto">Discover amazing destinations and book your perfect trip</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-4 border-0 focus:ring-0 focus:outline-none text-gray-800" 
                  placeholder="Where are you going?"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-4 border-0 focus:ring-0 focus:outline-none text-gray-800" 
                  placeholder="Check in - Check out"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-4 border-0 focus:ring-0 focus:outline-none text-gray-800" 
                  placeholder="Travelers"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center">
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Categories */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Browse by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {travelCategories.map((category) => (
              <div key={category.id} className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Popular Destinations</h2>
            <a href="#" className="text-blue-600 hover:underline font-medium">View all</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  {destination.rating > 0 && (
                    <div className="absolute top-0 right-0 m-4 bg-white/90 rounded-full p-1 flex items-center">
                      <FaStar className="w-6 h-6 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-800 mr-1">{destination.rating}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{destination.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{destination.distance} • {destination.dates}</p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">{destination.price}</span> per person
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to explore?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join millions of travelers and find your perfect getaway today.</p>
          <div className="space-x-4">
            <Link 
              to="/destinations" 
              className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Explore Destinations
            </Link>
            <Link 
              to="/register" 
              className="inline-block border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaPlane className="text-blue-400 text-xl" />
                <span className="text-white font-bold text-xl">TravelApp</span>
              </div>
              <p className="text-sm">Find your perfect trip, discover amazing places at exclusive deals.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Safety Information</a></li>
                <li><a href="#" className="hover:text-white transition">Cancellation Options</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Newsletter</h3>
              <p className="text-sm mb-4">Subscribe to get special offers and travel inspiration.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-900 w-full"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>© {new Date().getFullYear()} TravelApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
