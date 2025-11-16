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
 * @route GET /api/bookings
 * @description Get all bookings for the authenticated user (protected)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type_id, limit = 20, offset = 0 } = req.query;
    
    let query = req.supabase
      .from('bookings')
      .select(`
        *,
        booking_types(*),
        trips(*, destinations(id, name, country)),
        activities(*, activity_types(name, icon))
      `, { count: 'exact' })
      .eq('user_id', req.user.id);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (type_id) {
      query = query.eq('type_id', type_id);
    }
    
    // Add pagination and ordering
    query = query
      .order('booking_date', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    const { data: bookings, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      data: bookings,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * @route GET /api/bookings/types
 * @description Get all booking types
 */
router.get('/types', async (req, res) => {
  try {
    const { data: types, error } = await req.supabase
      .from('booking_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(types);
  } catch (error) {
    console.error('Error fetching booking types:', error);
    res.status(500).json({ error: 'Failed to fetch booking types' });
  }
});

/**
 * @route GET /api/bookings/:id
 * @description Get booking by ID (protected - only booking owner)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: booking, error } = await req.supabase
      .from('bookings')
      .select(`
        *,
        booking_types(*),
        trips(*, destinations(id, name, country)),
        activities(*, activity_types(name, icon))
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) throw error;
    if (!booking) return res.status(404).json({ error: 'Booking not found or access denied' });
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

/**
 * @route POST /api/bookings
 * @description Create a new booking (protected)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      trip_id,
      type_id,
      activity_id,
      provider_name,
      booking_reference,
      booking_date,
      start_date,
      end_date,
      amount,
      currency,
      status,
      notes
    } = req.body;
    
    // Validate required fields
    if (!trip_id || !type_id || !booking_date || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: trip_id, type_id, booking_date, and amount are required' 
      });
    }
    
    // Check if trip exists and user is the owner
    const { data: trip, error: tripError } = await req.supabase
      .from('trips')
      .select('id, user_id')
      .eq('id', trip_id)
      .single();
    
    if (tripError || !trip || trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }
    
    // Create booking
    const { data: booking, error } = await req.supabase
      .from('bookings')
      .insert([
        { 
          user_id: req.user.id,
          trip_id,
          type_id,
          activity_id: activity_id || null,
          provider_name: provider_name || null,
          booking_reference: booking_reference || null,
          booking_date: new Date(booking_date).toISOString(),
          start_date: start_date ? new Date(start_date).toISOString() : null,
          end_date: end_date ? new Date(end_date).toISOString() : null,
          amount: parseFloat(amount),
          currency: currency || 'USD',
          status: status || 'confirmed',
          notes: notes || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * @route PUT /api/bookings/:id
 * @description Update a booking (protected - only booking owner)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trip_id,
      type_id,
      activity_id,
      provider_name,
      booking_reference,
      booking_date,
      start_date,
      end_date,
      amount,
      currency,
      status,
      notes
    } = req.body;
    
    // First check if booking exists and user is the owner
    const { data: existingBooking, error: fetchError } = await req.supabase
      .from('bookings')
      .select('id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingBooking || existingBooking.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }
    
    // Prepare updates
    const updates = {};
    if (trip_id) updates.trip_id = trip_id;
    if (type_id) updates.type_id = type_id;
    if (activity_id !== undefined) updates.activity_id = activity_id;
    if (provider_name !== undefined) updates.provider_name = provider_name;
    if (booking_reference !== undefined) updates.booking_reference = booking_reference;
    if (booking_date) updates.booking_date = new Date(booking_date).toISOString();
    if (start_date !== undefined) updates.start_date = start_date ? new Date(start_date).toISOString() : null;
    if (end_date !== undefined) updates.end_date = end_date ? new Date(end_date).toISOString() : null;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (currency) updates.currency = currency;
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    
    // Update booking
    const { data: booking, error } = await req.supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

/**
 * @route DELETE /api/bookings/:id
 * @description Delete a booking (protected - only booking owner)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if booking exists and user is the owner
    const { data: existingBooking, error: fetchError } = await req.supabase
      .from('bookings')
      .select('id, user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingBooking || existingBooking.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    // Delete booking
    const { error } = await req.supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
