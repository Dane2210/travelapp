const express = require('express');
const router = express.Router();

/**
 * @route GET /api/destinations
 * @description Get all destinations with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { country, min_rating, limit = 20, offset = 0 } = req.query;
    
    let query = req.supabase
      .from('destinations')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (country) {
      query = query.ilike('country', `%${country}%`);
    }
    
    if (min_rating) {
      query = query.gte('average_rating', parseFloat(min_rating));
    }
    
    // Add pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    const { data: destinations, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      data: destinations,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

/**
 * @route GET /api/destinations/popular
 * @description Get popular destinations (based on number of trips)
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data: popularDestinations, error } = await req.supabase
      .from('destinations')
      .select('*')
      .order('trip_count', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json(popularDestinations);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    res.status(500).json({ error: 'Failed to fetch popular destinations' });
  }
});

/**
 * @route GET /api/destinations/:id
 * @description Get destination by ID with details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: destination, error } = await req.supabase
      .from('destinations')
      .select(`
        *,
        activities:activities!inner(
          *,
          activity_types(name, icon)
        ),
        trips:trips!inner(
          id,
          start_date,
          end_date,
          users(id, name, profile_picture)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!destination) return res.status(404).json({ error: 'Destination not found' });
    
    res.json(destination);
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

/**
 * @route GET /api/destinations/search
 * @description Search destinations by name or country
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const { data: destinations, error } = await req.supabase
      .from('destinations')
      .select('*')
      .or(`name.ilike.%${q}%,country.ilike.%${q}%`)
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json(destinations);
  } catch (error) {
    console.error('Error searching destinations:', error);
    res.status(500).json({ error: 'Failed to search destinations' });
  }
});

/**
 * @route POST /api/destinations
 * @description Create a new destination (admin only)
 */
router.post('/', async (req, res) => {
  try {
    // In a real app, you'd check for admin role here
    // For now, we'll allow any authenticated user to add destinations
    const { data: { user }, error: authError } = await req.supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const {
      name,
      country,
      description,
      image_url,
      best_time_to_visit,
      average_cost_per_day,
      currency,
      timezone,
      language,
      visa_requirements,
      safety_rating
    } = req.body;
    
    // Validate required fields
    if (!name || !country) {
      return res.status(400).json({ 
        error: 'Missing required fields: name and country are required' 
      });
    }
    
    // Create destination
    const { data: destination, error } = await req.supabase
      .from('destinations')
      .insert([
        { 
          name,
          country,
          description: description || null,
          image_url: image_url || null,
          best_time_to_visit: best_time_to_visit || null,
          average_cost_per_day: average_cost_per_day || null,
          currency: currency || 'USD',
          timezone: timezone || null,
          language: language || null,
          visa_requirements: visa_requirements || null,
          safety_rating: safety_rating || null,
          created_by: user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(destination);
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ error: 'Failed to create destination' });
  }
});

module.exports = router;
