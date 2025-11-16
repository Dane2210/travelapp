const express = require('express');
const router = express.Router();

// Middleware to protect routes
const authenticate = async (req, res, next) => {
  try {
    const { data: { user }, error } = await req.supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * @route GET /api/users/me
 * @description Get current user's profile (protected)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove sensitive data
    const { password, ...userData } = user;
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * @route PUT /api/users/me
 * @description Update current user's profile (protected)
 */
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, bio, profile_picture, preferences } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (profile_picture) updates.profile_picture = profile_picture;
    if (preferences) updates.preferences = preferences;

    const { data: user, error } = await req.supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Remove sensitive data
    const { password, ...userData } = user;
    
    res.json(userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

/**
 * @route GET /api/users/:id
 * @description Get user profile by ID (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await req.supabase
      .from('users')
      .select('id, name, bio, profile_picture, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * @route GET /api/users/me/trips
 * @description Get current user's trips (protected)
 */
router.get('/me/trips', authenticate, async (req, res) => {
  try {
    const { data: trips, error } = await req.supabase
      .from('trips')
      .select('*')
      .eq('user_id', req.user.id)
      .order('start_date', { ascending: true });

    if (error) throw error;
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch user trips' });
  }
});

/**
 * @route GET /api/users/me/posts
 * @description Get current user's posts (protected)
 */
router.get('/me/posts', authenticate, async (req, res) => {
  try {
    const { data: posts, error } = await req.supabase
      .from('posts')
      .select('*, destinations(name, image_url)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

module.exports = router;
