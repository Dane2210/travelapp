import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, supabaseReady } from '../../lib/supabaseClient';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      const user = data.session?.user;
      const role = user?.user_metadata?.role || 'traveler';
      localStorage.setItem('userRole', role);

      // Ensure a profile row exists for this user (schema-agnostic: only id)
      const { error: upsertError } = await supabase.from('profiles').upsert({ id: user.id });
      if (upsertError) {
        console.warn('Unable to upsert profile:', upsertError.message);
      }

      // Best-effort: update name if column exists
      const displayName = user.user_metadata?.name || user.user_metadata?.full_name;
      if (displayName) {
        const { error: nameError } = await supabase
          .from('profiles')
          .update({ name: displayName })
          .eq('id', user.id);
        if (nameError) {
          // Ignore if column doesn't exist
          console.debug('profiles.name not updated (may not exist):', nameError.message);
        }
      }

      if (role === 'moderator' || role === 'admin') {
        navigate('/moderator', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Welcome Back</h1>
        <p className="subtitle">Log in to continue your travel journey</p>

        {!supabaseReady && (
          <div className="alert error" style={{ marginTop: '8px' }}>
            Authentication backend is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.
          </div>
        )}
        
        {error && <div className="alert error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <div className="form-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn primary full-width"
            disabled={loading || !supabaseReady}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
        
        <div className="social-login">
          <p className="divider">or continue with</p>
          <div className="social-buttons">
            <button type="button" className="btn outline full-width">
              <img src="/icons/google.svg" alt="Google" className="social-icon" />
              Google
            </button>
            <button type="button" className="btn outline full-width">
              <img src="/icons/facebook.svg" alt="Facebook" className="social-icon" />
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
