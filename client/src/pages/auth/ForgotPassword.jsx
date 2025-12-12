import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseReady } from '../../lib/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setMessage('If an account exists with this email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter your email to receive a password reset link.</p>
        {message && <div className="alert success">{message}</div>}
        {!supabaseReady && (
          <div className="alert error" style={{ marginTop: '8px' }}>
            Authentication backend is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.
          </div>
        )}
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn primary full-width" disabled={loading || !supabaseReady}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Remembered? <Link to="/login">Back to login</Link></p>
        </div>
      </div>
    </div>
  );
}
