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
 * @route GET /api/activities
 * @description Get all activities with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      destination_id, 
      type_id, 
      min_price, 
      max_price, 
      limit = 20, 
      offset = 0 
    } = req.query;
    
    let query = req.supabase
      .from('activities')
      .select(`
        *,
        activity_types(name, icon),
        destinations(id, name, country)
      `, { count: 'exact' });
    
    // Apply filters
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (type_id) {
      query = query.eq('type_id', type_id);
    }
    
    if (min_price) {
      query = query.gte('price', parseFloat(min_price));
    }
    
    if (max_price) {
      query = query.lte('price', parseFloat(max_price));
    }
    
    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    const { data: activities, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      data: activities,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * @route GET /api/activities/types
 * @description Get all activity types
 */
router.get('/types', async (req, res) => {
  try {
    const { data: types, error } = await req.supabase
      .from('activity_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(types);
  } catch (error) {
    console.error('Error fetching activity types:', error);
    res.status(500).json({ error: 'Failed to fetch activity types' });
  }
});

/**
 * @route GET /api/activities/:id
 * @description Get activity by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: activity, error } = await req.supabase
      .from('activities')
      .select(`
        *,
        activity_types(*),
        destinations(*),
        user_activities!inner(
          id,
          rating,
          review,
          users(id, name, profile_picture)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

/**
 * @route POST /api/activities
 * @description Create a new activity (protected)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      destination_id,
      type_id,
      name,
      description,
      location,
      price,
      currency,
      duration_hours,
      image_urls,
      is_public
    } = req.body;
    
    // Validate required fields
    if (!destination_id || !type_id || !name || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination_id, type_id, name, and location are required' 
      });
    }
    
    // Create activity
    const { data: activity, error } = await req.supabase
      .from('activities')
      .insert([
        { 
          destination_id,
          type_id,
          name,
          description: description || null,
          location,
          price: price ? parseFloat(price) : null,
          currency: currency || 'USD',
          duration_hours: duration_hours ? parseFloat(duration_hours) : null,
          image_urls: image_urls || [],
          is_public: is_public !== undefined ? is_public : true,
          created_by: req.user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

/**
 * @route POST /api/activities/:id/rate
 * @description Rate and review an activity (protected)
 */
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating is required and must be between 1 and 5' 
      });
    }
    
    // Check if activity exists
    const { data: activity, error: activityError } = await req.supabase
      .from('activities')
      .select('id')
      .eq('id', id)
      .single();
    
    if (activityError || !activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Check if user already rated this activity
    const { data: existingRating, error: ratingError } = await req.supabase
      .from('user_activities')
      .select('id')
      .eq('activity_id', id)
      .eq('user_id', req.user.id)
      .single();
    
    let result;
    if (existingRating) {
      // Update existing rating
      const { data, error } = await req.supabase
        .from('user_activities')
        .update({
          rating: parseFloat(rating),
          review: review || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new rating
      const { data, error } = await req.supabase
        .from('user_activities')
        .insert([
          {
            user_id: req.user.id,
            activity_id: id,
            rating: parseFloat(rating),
            review: review || null,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    // Update activity's average rating
    await updateActivityRating(req.supabase, id);
    
    res.json(result);
  } catch (error) {
    console.error('Error rating activity:', error);
    res.status(500).json({ error: 'Failed to rate activity' });
  }
});

/**
 * Helper function to update activity's average rating
 */
async function updateActivityRating(supabase, activityId) {
  try {
    // Get all ratings for this activity
    const { data: ratings, error } = await supabase
      .from('user_activities')
      .select('rating')
      .eq('activity_id', activityId);
    
    if (error) throw error;
    
    // Calculate new average rating
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    
    // Update activity
    await supabase
      .from('activities')
      .update({
        average_rating: parseFloat(averageRating.toFixed(1)),
        rating_count: totalRatings,
        updated_at: new Date().toISOString()
      })
      .eq('id', activityId);
    
  } catch (error) {
    console.error('Error updating activity rating:', error);
    throw error;
  }
}

module.exports = router;
