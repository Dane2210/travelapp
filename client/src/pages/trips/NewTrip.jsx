import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function NewTrip() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session.user.id;
      const payload = {
        auth_user_id: uid,
        destination: destination.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes.trim() || null,
      };
      const { error } = await supabase.from('trips').insert(payload);
      if (error) throw error;
      navigate('/trips', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <h1 className="text-2xl font-semibold mb-4">Plan a Trip</h1>
      {error && <div className="alert error mb-3">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="destination">Destination</label>
          <input id="destination" className="w-full border rounded px-3 py-2" value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="e.g. Paris, France" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1" htmlFor="start">Start date</label>
            <input id="start" type="date" className="w-full border rounded px-3 py-2" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1" htmlFor="end">End date</label>
            <input id="end" type="date" className="w-full border rounded px-3 py-2" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block mb-1" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" className="w-full border rounded px-3 py-2" rows={4} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Add any details..." />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving...' : 'Save Trip'}</button>
          <button type="button" className="btn outline" onClick={()=>navigate('/trips')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
