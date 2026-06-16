import React, { useCallback, useState } from 'react';
import { Activity, Save, AlertCircle } from 'lucide-react';

const DataEntry = ({ 
  selectedPlayer, 
  setSelectedPlayer, 
  matchCount, 
  setMatchCount,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  API_URL,
  PLAYERS
}) => {
  const [formData, setFormData] = useState({
    kills: '',
    knockdowns: '',
    deaths: '',
    assists: '',
    headshots: '',
    damage: '',
    actualDamage: '',
    helpUp: '',
    revives: '',
    survivalTime: '',
    healing: '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSaveMatch = async (e) => {
    e.preventDefault();
    
    if (!formData.kills || !formData.deaths) {
      setError('Please fill in Kills and Deaths at minimum');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: selectedPlayer,
          kills: parseInt(formData.kills) || 0,
          knockdowns: parseInt(formData.knockdowns) || 0,
          deaths: parseInt(formData.deaths) || 0,
          assists: parseInt(formData.assists) || 0,
          headshots: parseInt(formData.headshots) || 0,
          damage: parseInt(formData.damage) || 0,
          actualDamage: parseInt(formData.actualDamage) || 0,
          helpUp: parseInt(formData.helpUp) || 0,
          revives: parseInt(formData.revives) || 0,
          survivalTime: parseInt(formData.survivalTime) || 0,
          healing: parseInt(formData.healing) || 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save match');
      }

      const nextMatchNo = (matchCount || 0) + 1;
      setSuccessMessage(`✅ Match #${nextMatchNo} saved successfully for ${selectedPlayer}!`);
      
      setFormData({
        kills: '',
        knockdowns: '',
        deaths: '',
        assists: '',
        headshots: '',
        damage: '',
        actualDamage: '',
        helpUp: '',
        revives: '',
        survivalTime: '',
        healing: '',
      });

      setMatchCount((matchCount || 0) + 1);
      setError(null);

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError('Error saving match: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-8">📊 Match Data Entry</h2>

        <div className="min-h-16 mb-6">
          {successMessage && (
            <div className="bg-green-900 border-l-4 border-green-400 text-green-300 p-4 rounded flex gap-3 animate-in">
              <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border-l-4 border-red-400 text-red-300 p-4 rounded flex gap-3 animate-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveMatch} className="space-y-6">
          {/* Player Selection */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <label className="block text-white font-semibold mb-3">Select Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-cyan-500"
            >
              {PLAYERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Auto Match Counter */}
          <div className="bg-gradient-to-r from-cyan-900 to-cyan-800 p-6 rounded-lg border border-cyan-500">
            <p className="text-cyan-300 text-sm font-semibold">PLAYER MATCH STATUS</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-cyan-400 text-sm">Matches Played</p>
                <p className="text-white text-2xl font-bold">{matchCount !== null ? matchCount : 'Loading...'}</p>
              </div>
              <div>
                <p className="text-cyan-400 text-sm">Current Entry</p>
                <p className="text-white text-2xl font-bold text-yellow-300">
                  {matchCount !== null ? `Match #${matchCount + 1}` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {/* Combat Stats */}
          <fieldset className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <legend className="text-white font-semibold mb-4">🎯 Combat Stats</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'kills', label: 'Kills' },
                { field: 'knockdowns', label: 'Knockdowns' },
                { field: 'deaths', label: 'Deaths' },
                { field: 'assists', label: 'Assists' },
                { field: 'headshots', label: 'Headshots' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Damage Stats */}
          <fieldset className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <legend className="text-white font-semibold mb-4">💥 Damage Stats</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'damage', label: 'Damage' },
                { field: 'actualDamage', label: 'Actual Damage' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Support Stats */}
          <fieldset className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <legend className="text-white font-semibold mb-4">🤝 Support Stats</legend>
            <div className="space-y-3 mb-4 text-sm text-slate-400">
              <p>• <strong>Help Up:</strong> Manually revive knocked teammate</p>
              <p>• <strong>Revive:</strong> Revive teammate via vending machine</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'helpUp', label: 'Help Up' },
                { field: 'revives', label: 'Revives' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Survival & Healing */}
          <fieldset className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <legend className="text-white font-semibold mb-4">⏱ Survival & Healing</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'survivalTime', label: 'Survival Time (minutes)' },
                { field: 'healing', label: 'Healing' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Match Stats'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataEntry;
