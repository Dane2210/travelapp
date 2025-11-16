const express = require('express');
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await req.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) throw authError;

    // Create user profile in database
    const { data: profileData, error: profileError } = await req.supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email,
          name,
          created_at: new Date().toISOString()
        }
      ]);

    if (profileError) throw profileError;

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/auth/login
 * @description Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await req.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

/**
 * @route POST /api/auth/logout
 * @description Logout user
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await req.supabase.auth.signOut();
    if (error) throw error;
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    const { data: { user }, error } = await req.supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    res.json({
      id: user.id,
      email: user.email,
      ...profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
