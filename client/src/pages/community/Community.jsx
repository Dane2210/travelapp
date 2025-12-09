import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';

export default function Community() {
  const [activeTab, setActiveTab] = useState('trending');
  
  // Handle rating a post
  const handleRatePost = (postId, newRating) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        // In a real app, you would make an API call here to update the rating
        const newTotalRatings = post.userRating ? post.totalRatings : post.totalRatings + 1;
        const newAvgRating = post.userRating 
          ? (post.rating * post.totalRatings - post.userRating + newRating) / post.totalRatings
          : (post.rating * post.totalRatings + newRating) / newTotalRatings;
        
        return {
          ...post,
          rating: newAvgRating,
          userRating: newRating,
          totalRatings: newTotalRatings
        };
      }
      return post;
    }));
  };
  
  // Star rating component
  const StarRating = ({ rating, onRate, interactive = false }) => {
    const [hover, setHover] = useState(null);
    
    return (
      <div className="star-rating">
        {[...Array(10)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <span
              key={index}
              className="star"
              style={{
                color: ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
                cursor: interactive ? 'pointer' : 'default',
                fontSize: '1.2rem',
                marginRight: '2px',
              }}
              onMouseEnter={() => interactive && setHover(ratingValue)}
              onMouseLeave={() => interactive && setHover(null)}
              onClick={() => interactive && onRate(ratingValue)}
            >
              {ratingValue <= (hover || rating) ? <FaStar /> : <FaRegStar />}
            </span>
          );
        })}
        <span className="rating-text">{rating.toFixed(1)}/10</span>
      </div>
    );
  };

  // Sample posts data - replace with real data from your API
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'TravelEnthusiast',
        avatar: 'user1.jpg',
        location: 'San Francisco, CA'
      },
      content: 'Just booked my trip to Japan! Any must-visit places in Kyoto?',
      image: 'kyoto.jpg',
      likes: 42,
      comments: 8,
      timeAgo: '2h ago',
      tags: ['japan', 'kyoto', 'traveltips'],
      rating: 8.5,
      userRating: 0,
      totalRatings: 24
    },
    {
      id: 2,
      user: {
        name: 'WanderlustAdventures',
        avatar: 'user2.jpg',
        location: 'New York, NY'
      },
      content: 'The view from the top of the Eiffel Tower was absolutely breathtaking!',
      image: 'eiffel.jpg',
      likes: 128,
      comments: 24,
      timeAgo: '1d ago',
      tags: ['paris', 'eiffeltower', 'europe'],
      rating: 9.2,
      userRating: 0,
      totalRatings: 42
    }
  ]);

  return (
    <div className="page">
      <div className="community-header">
        <h1>Travel Community</h1>
        <Link to="/community/new" className="btn primary">Create Post</Link>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button 
          className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent
        </button>
        <button 
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      <div className="post-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="user-info">
                  <img 
                    src={post.user.avatar} 
                    alt={post.user.name} 
                    className="user-avatar"
                  />
                  <div>
                    <h3>{post.user.name}</h3>
                    <p className="user-location">{post.user.location}</p>
                  </div>
                </div>
                <span className="time-ago">{post.timeAgo}</span>
              </div>
              
              <div className="post-content">
                <p>{post.content}</p>
                {post.image && (
                  <div 
                    className="post-image"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                )}
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="post-actions">
                <button className="action-btn">
                  ♥ {post.likes}
                </button>
                <button className="action-btn">
                  💬 {post.comments}
                </button>
                <button className="action-btn">
                  ↪️ Share
                </button>
              </div>
              
              <div className="post-rating">
                <div className="rating-header">
                  <span className="rating-average">{post.rating.toFixed(1)}</span>
                  <span className="rating-count">({post.totalRatings} ratings)</span>
                </div>
                <StarRating 
                  rating={post.userRating || post.rating} 
                  onRate={(rating) => handleRatePost(post.id, rating)}
                  interactive={true}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No posts found.</p>
            <Link to="/community/new" className="btn">Be the first to post!</Link>
          </div>
        )}
      </div>
    </div>
  );
}
