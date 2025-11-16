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
 * @route GET /api/posts
 * @description Get all posts with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      destination_id, 
      user_id, 
      limit = 20, 
      offset = 0 
    } = req.query;
    
    let query = req.supabase
      .from('posts')
      .select(`
        *,
        users(id, name, profile_picture),
        destinations(id, name, country, image_url),
        post_likes(count),
        comments(count)
      `, { count: 'exact' });
    
    // Apply filters
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    const { data: posts, error, count } = await query;
    
    if (error) throw error;
    
    // Transform the data to include like and comment counts
    const transformedPosts = posts.map(post => ({
      ...post,
      like_count: post.post_likes[0]?.count || 0,
      comment_count: post.comments[0]?.count || 0
    }));
    
    res.json({
      data: transformedPosts,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * @route GET /api/posts/feed
 * @description Get personalized feed for the authenticated user (protected)
 */
router.get('/feed', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Get posts from users that the current user follows
    const { data: posts, error, count } = await req.supabase
      .from('posts')
      .select(`
        *,
        users!inner(id, name, profile_picture),
        destinations(id, name, country, image_url),
        post_likes(count),
        comments(count),
        user_follows!inner(
          follower_id
        )
      `, { count: 'exact' })
      .eq('user_follows.follower_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (error) throw error;
    
    // If no followed users, get popular posts
    if (!posts.length) {
      const { data: popularPosts, error: popularError } = await req.supabase
        .from('posts')
        .select(`
          *,
          users(id, name, profile_picture),
          destinations(id, name, country, image_url),
          post_likes(count),
          comments(count)
        `, { count: 'exact' })
        .order('post_likes', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      if (popularError) throw popularError;
      
      const transformedPosts = popularPosts.map(post => ({
        ...post,
        like_count: post.post_likes[0]?.count || 0,
        comment_count: post.comments[0]?.count || 0
      }));
      
      return res.json({
        data: transformedPosts,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    }
    
    // Transform the data to include like and comment counts
    const transformedPosts = posts.map(post => ({
      ...post,
      like_count: post.post_likes[0]?.count || 0,
      comment_count: post.comments[0]?.count || 0
    }));
    
    res.json({
      data: transformedPosts,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

/**
 * @route GET /api/posts/:id
 * @description Get a single post by ID with comments and likes
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the post with user, destination, and like/comment counts
    const { data: post, error: postError } = await req.supabase
      .from('posts')
      .select(`
        *,
        users(id, name, profile_picture),
        destinations(id, name, country, image_url),
        post_likes(count),
        comments(count)
      `)
      .eq('id', id)
      .single();
    
    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Get comments for the post
    const { data: comments, error: commentsError } = await req.supabase
      .from('comments')
      .select(`
        *,
        users(id, name, profile_picture)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });
    
    if (commentsError) throw commentsError;
    
    // Get likes for the post
    const { data: likes, error: likesError } = await req.supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', id);
    
    if (likesError) throw likesError;
    
    // Get user's like status if authenticated
    let userLiked = false;
    if (req.user) {
      userLiked = likes.some(like => like.user_id === req.user.id);
    }
    
    // Prepare response
    const response = {
      ...post,
      like_count: post.post_likes[0]?.count || 0,
      comment_count: post.comments[0]?.count || 0,
      user_liked: userLiked,
      comments: comments || [],
      likes: likes || []
    };
    
    // Remove unnecessary nested arrays
    delete response.post_likes;
    delete response.comments.count;
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

/**
 * @route POST /api/posts
 * @description Create a new post (protected)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      destination_id,
      title,
      content,
      images,
      rating,
      is_public = true
    } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and content are required' 
      });
    }
    
    // Create post
    const { data: post, error } = await req.supabase
      .from('posts')
      .insert([
        { 
          user_id: req.user.id,
          destination_id: destination_id || null,
          title,
          content,
          images: images || [],
          rating: rating ? parseFloat(rating) : null,
          is_public,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        users(id, name, profile_picture),
        destinations(id, name, country, image_url)
      `)
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      ...post,
      like_count: 0,
      comment_count: 0,
      user_liked: false,
      comments: [],
      likes: []
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * @route PUT /api/posts/:id
 * @description Update a post (protected - only post owner)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      destination_id,
      title,
      content,
      images,
      rating,
      is_public
    } = req.body;
    
    // First check if post exists and user is the owner
    const { data: existingPost, error: fetchError } = await req.supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingPost || existingPost.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Post not found or access denied' });
    }
    
    // Prepare updates
    const updates = {};
    if (destination_id !== undefined) updates.destination_id = destination_id;
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (images !== undefined) updates.images = images;
    if (rating !== undefined) updates.rating = rating ? parseFloat(rating) : null;
    if (is_public !== undefined) updates.is_public = is_public;
    
    // Update post
    const { data: post, error } = await req.supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        users(id, name, profile_picture),
        destinations(id, name, country, image_url)
      `)
      .single();
    
    if (error) throw error;
    
    // Get updated like and comment counts
    const { data: likeCount } = await req.supabase
      .from('post_likes')
      .select('count', { count: 'exact', head: true })
      .eq('post_id', id);
    
    const { data: commentCount } = await req.supabase
      .from('comments')
      .select('count', { count: 'exact', head: true })
      .eq('post_id', id);
    
    // Get user's like status
    const { data: userLike } = await req.supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', id)
      .eq('user_id', req.user.id)
      .single();
    
    // Get comments for the post
    const { data: comments } = await req.supabase
      .from('comments')
      .select(`
        *,
        users(id, name, profile_picture)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });
    
    // Get likes for the post
    const { data: likes } = await req.supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', id);
    
    res.json({
      ...post,
      like_count: likeCount ? likeCount[0].count : 0,
      comment_count: commentCount ? commentCount[0].count : 0,
      user_liked: !!userLike,
      comments: comments || [],
      likes: likes || []
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

/**
 * @route DELETE /api/posts/:id
 * @description Delete a post (protected - only post owner or admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if post exists and user is the owner or admin
    const { data: existingPost, error: fetchError } = await req.supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // In a real app, you'd check for admin role here
    if (existingPost.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete post (this will cascade to likes and comments due to foreign key constraints)
    const { error } = await req.supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/**
 * @route POST /api/posts/:id/like
 * @description Like or unlike a post (protected)
 */
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id: post_id } = req.params;
    
    // Check if post exists
    const { data: post, error: postError } = await req.supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();
    
    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user already liked the post
    const { data: existingLike, error: likeError } = await req.supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', req.user.id)
      .single();
    
    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await req.supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (unlikeError) throw unlikeError;
      
      // Get updated like count
      const { count: likeCount } = await req.supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post_id);
      
      return res.json({ 
        liked: false, 
        like_count: likeCount || 0 
      });
    } else {
      // Like the post
      const { error: likeError } = await req.supabase
        .from('post_likes')
        .insert([
          {
            post_id,
            user_id: req.user.id,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (likeError) throw likeError;
      
      // Get updated like count
      const { count: likeCount } = await req.supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post_id);
      
      return res.json({ 
        liked: true, 
        like_count: likeCount || 0 
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;
