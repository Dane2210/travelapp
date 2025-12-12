import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({ styles: [], budget: 'medium' });

  const toggleStyle = (val) => {
    setPrefs((p) => ({
      ...p,
      styles: p.styles.includes(val) ? p.styles.filter(s => s !== val) : [...p.styles, val]
    }));
  };

  const finish = () => {
    localStorage.setItem('hasOnboarded', 'true');
    // Optionally save beginner role
    if (!localStorage.getItem('userRole')) localStorage.setItem('userRole', 'traveler');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Welcome to TravelApp</h1>
      <p className="text-gray-600 mb-6">Let's set some preferences to personalize your experience.</p>

      {step === 1 && (
        <div className="space-y-3">
          <p className="font-medium">Pick your travel styles</p>
          {['Adventure','Relaxation','Culture','Food'].map(opt => (
            <label key={opt} className="flex items-center space-x-2">
              <input type="checkbox" checked={prefs.styles.includes(opt)} onChange={() => toggleStyle(opt)} />
              <span>{opt}</span>
            </label>
          ))}
          <div className="flex justify-end mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)} disabled={prefs.styles.length===0}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="font-medium">Select your typical budget</p>
          <select value={prefs.budget} onChange={(e)=>setPrefs(p=>({...p,budget:e.target.value}))} className="w-full border p-3 rounded">
            <option value="budget">Budget</option>
            <option value="medium">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
          <div className="flex justify-between mt-4">
            <button className="px-3 py-2 rounded border" onClick={() => setStep(1)}>Back</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={finish}>Finish</button>
          </div>
        </div>
      )}
    </div>
  );
}
