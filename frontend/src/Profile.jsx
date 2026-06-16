const Profile = ({ playerProfile, selectedPlayer, setSelectedPlayer, PLAYERS }) => {
  if (!playerProfile) {
    return (
      <div>
        <label className="block text-white font-semibold mb-3">Select Player</label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 max-w-md mb-6"
        >
          {PLAYERS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="text-center py-12 text-cyan-300">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="pb-8 space-y-8">
      <div>
        <label className="block text-white font-semibold mb-3">Select Player</label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 max-w-md"
        >
          {PLAYERS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="bg-gradient-to-r from-purple-900 to-purple-800 border-2 border-purple-500 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-6">{playerProfile.playerName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-purple-300 text-sm font-semibold">Matches</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.matchesPlayed}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">KD Ratio</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.kdRatio.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Total Kills</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalKills}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Knockdowns</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalKnockdowns}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Deaths</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalDeaths}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Assists</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalAssists}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Headshots</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalHeadshots}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">HS Rate %</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.avgHeadshotRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Damage</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalDamage}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Actual Damage</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalActualDamage}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Help Up</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalHelpUp}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Revives</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalRevives}</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Survival Time</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalSurvivalTime} min</p>
          </div>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Healing</p>
            <p className="text-white text-2xl font-bold mt-1">{playerProfile.totalHealing}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
