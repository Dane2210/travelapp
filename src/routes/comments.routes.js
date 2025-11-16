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
 * @route GET /api/comments
 * @description Get all comments for a post
 */
router.get('/', async (req, res) => {
  try {
    const { 
      post_id, 
      user_id, 
      limit = 20, 
      offset = 0 
    } = req.query;
    
    if (!post_id && !user_id) {
      return res.status(400).json({ 
        error: 'Missing query parameter: post_id or user_id is required' 
      });
    }
    
    let query = req.supabase
      .from('comments')
      .select(`
        *,
        users(id, name, profile_picture)
      `, { count: 'exact' });
    
    // Apply filters
    if (post_id) {
      query = query.eq('post_id', post_id);
    }
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    const { data: comments, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      data: comments || [],
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * @route GET /api/comments/:id
 * @description Get a single comment by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: comment, error } = await req.supabase
      .from('comments')
      .select(`
        *,
        users(id, name, profile_picture)
      `)
      .eq('id', id)
      .single();
    
    if (error || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

/**
 * @route POST /api/comments
 * @description Create a new comment (protected)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      post_id,
      content,
      parent_comment_id = null
    } = req.body;
    
    // Validate required fields
    if (!post_id || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: post_id and content are required' 
      });
    }
    
    // Check if post exists
    const { data: post, error: postError } = await req.supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();
    
    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await req.supabase
        .from('comments')
        .select('id')
        .eq('id', parent_comment_id)
        .single();
      
      if (parentError || !parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }
    
    // Create comment
    const { data: comment, error } = await req.supabase
      .from('comments')
      .insert([
        { 
          user_id: req.user.id,
          post_id,
          parent_comment_id,
          content,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        users(id, name, profile_picture)
      `)
      .single();
    
    if (error) throw error;
    
    // Update comment count on the post
    await updateCommentCount(req.supabase, post_id);
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * @route PUT /api/comments/:id
 * @description Update a comment (protected - only comment owner)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ 
        error: 'Missing required field: content is required' 
      });
    }
    
    // First check if comment exists and user is the owner
    const { data: existingComment, error: fetchError } = await req.supabase
      .from('comments')
      .select('id, user_id, post_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (existingComment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }
    
    // Update comment
    const { data: comment, error } = await req.supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        users(id, name, profile_picture)
      `)
      .single();
    
    if (error) throw error;
    
    // Update comment count on the post (in case of soft delete/restore)
    await updateCommentCount(req.supabase, existingComment.post_id);
    
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

/**
 * @route DELETE /api/comments/:id
 * @description Delete a comment (protected - only comment owner or admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if comment exists and get post_id for updating comment count
    const { data: existingComment, error: fetchError } = await req.supabase
      .from('comments')
      .select('id, user_id, post_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // In a real app, you'd check for admin role here
    if (existingComment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete comment (this will cascade to any replies due to foreign key constraints)
    const { error } = await req.supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Update comment count on the post
    await updateCommentCount(req.supabase, existingComment.post_id);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/**
 * Helper function to update comment count on a post
 */
async function updateCommentCount(supabase, postId) {
  try {
    // Get comment count for the post
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (countError) throw countError;
    
    // Update the post's comment count
    await supabase
      .from('posts')
      .update({ 
        comment_count: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
    
  } catch (error) {
    console.error('Error updating comment count:', error);
    throw error;
  }
}

module.exports = router;
