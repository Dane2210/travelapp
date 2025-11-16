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
 * @route POST /api/trips
 * @description Create a new trip (protected)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      destination_id, 
      start_date, 
      end_date, 
      budget, 
      notes, 
      is_public 
    } = req.body;

    // Validate required fields
    if (!destination_id || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination_id, start_date, and end_date are required' 
      });
    }

    // Create trip
    const { data: trip, error } = await req.supabase
      .from('trips')
      .insert([
        { 
          user_id: req.user.id,
          destination_id,
          start_date: new Date(start_date).toISOString(),
          end_date: new Date(end_date).toISOString(),
          budget: budget || 0,
          notes: notes || '',
          is_public: is_public !== undefined ? is_public : false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

/**
 * @route GET /api/trips
 * @description Get all trips (public trips or user's private trips)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: trips, error } = await req.supabase
      .from('trips')
      .select(`
        *,
        destinations (id, name, country, image_url),
        users (id, name, profile_picture)
      `)
      .or(`user_id.eq.${req.user.id},is_public.eq.true`)
      .order('start_date', { ascending: true });

    if (error) throw error;
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

/**
 * @route GET /api/trips/:id
 * @description Get trip by ID (public or user's private trip)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: trip, error } = await req.supabase
      .from('trips')
      .select(`
        *,
        destinations (*),
        users (id, name, profile_picture),
        activities (*, activity_types(name, icon)),
        bookings (*, booking_types(name, icon))
      `)
      .eq('id', id)
      .or(`user_id.eq.${req.user.id},is_public.eq.true`)
      .single();

    if (error) throw error;
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

/**
 * @route PUT /api/trips/:id
 * @description Update a trip (protected - only trip owner)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      destination_id, 
      start_date, 
      end_date, 
      budget, 
      notes, 
      is_public 
    } = req.body;

    // First check if trip exists and user is the owner
    const { data: existingTrip, error: fetchError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // Prepare updates
    const updates = {};
    if (destination_id) updates.destination_id = destination_id;
    if (start_date) updates.start_date = new Date(start_date).toISOString();
    if (end_date) updates.end_date = new Date(end_date).toISOString();
    if (budget !== undefined) updates.budget = budget;
    if (notes !== undefined) updates.notes = notes;
    if (is_public !== undefined) updates.is_public = is_public;

    // Update trip
    const { data: trip, error } = await req.supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

/**
 * @route DELETE /api/trips/:id
 * @description Delete a trip (protected - only trip owner)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if trip exists and user is the owner
    const { data: existingTrip, error: fetchError } = await req.supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingTrip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // Delete trip
    const { error } = await req.supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

module.exports = router;
