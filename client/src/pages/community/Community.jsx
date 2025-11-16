import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Community() {
  const [activeTab, setActiveTab] = useState('trending');
  
  // Sample posts data - replace with real data from your API
  const posts = [
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
      tags: ['japan', 'kyoto', 'traveltips']
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
      tags: ['paris', 'eiffeltower', 'europe']
    }
  ];

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
