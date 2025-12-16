import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data.session;
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }
      const uid = session.user.id;
      // Load current name from profiles (if column exists)
      const { data: row } = await supabase.from('profiles').select('name').eq('id', uid).maybeSingle();
      setName(row?.name || session.user.user_metadata?.name || session.user.user_metadata?.full_name || '');
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session.user.id;

      // Update profiles.name first (ignore if column missing)
      const { error: pe } = await supabase.from('profiles').update({ name }).eq('id', uid);
      if (pe) {
        // Keep going even if profiles.name isn't present
        console.debug('profiles.name not updated (may not exist):', pe.message);
      }

      // Update auth user metadata for consistency
      const { error: ue } = await supabase.auth.updateUser({ data: { name } });
      if (ue) {
        console.debug('auth user metadata not updated:', ue.message);
      }

      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-24">
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
      {error && <div className="alert error mb-3">{error}</div>}
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="name">Display name</label>
          <input
            id="name"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button type="button" className="btn outline" onClick={() => navigate('/profile')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
