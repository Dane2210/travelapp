import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
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
    
    if (step === 1) {
      // Basic validation for step 1
      if (!formData.name || !formData.email) {
        setError('Please fill in all fields');
        return;
      }
      setStep(2);
      return;
    }
    
    // Step 2: Password and confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name, role: 'traveler' },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      if (error) throw error;

      // If email confirmation is enabled, no session yet
      if (!data.session) {
        navigate('/login', { replace: true });
        return;
      }

      // If auto-confirmed, ensure profile row exists, then take the user to onboarding
      localStorage.setItem('userRole', data.session.user.user_metadata?.role || 'traveler');
      const uid = data.session.user.id;
      const { error: upsertError } = await supabase.from('profiles').upsert({ id: uid });
      if (upsertError) {
        console.warn('Unable to upsert profile on register:', upsertError.message);
      }
      // Best-effort set name on profiles from registration input
      if (formData.name) {
        const { error: nameErr } = await supabase
          .from('profiles')
          .update({ name: formData.name })
          .eq('id', uid);
        if (nameErr) {
          console.debug('profiles.name not updated (may not exist):', nameErr.message);
        }
      }
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create an account. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <p className="subtitle">Join our community of travelers</p>
        
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Account Info</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Password</span>
          </div>
        </div>
        
        {error && <div className="alert error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
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
              
              <button 
                type="submit" 
                className="btn primary full-width"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="password">Create Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  minLength="6"
                />
                <p className="hint">Use at least 6 characters</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  minLength="6"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="terms" 
                  required 
                />
                <label htmlFor="terms">
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn primary full-width"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <button 
                type="button" 
                className="btn text"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
        
        {step === 1 && (
          <div className="social-login">
            <p className="divider">or sign up with</p>
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
        )}
      </div>
    </div>
  );
}
