import React from 'react';

const Leaderboard = ({ leaderboardData, error }) => {
  if (!leaderboardData || !leaderboardData.players) {
    return <div className="text-center py-12 text-cyan-300">Loading leaderboard...</div>;
  }

  return (
    <div className="pb-8">
      <h2 className="text-2xl font-bold text-white mb-6">📈 Overall Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-white text-sm">
          <thead className="bg-slate-700 border-b-2 border-cyan-500 sticky top-1">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-right">Matches</th>
              <th className="px-4 py-3 text-right">KD</th>
              <th className="px-4 py-3 text-right">Kills</th>
              <th className="px-4 py-3 text-right">Dmg</th>
              <th className="px-4 py-3 text-right">Actual Dmg</th>
              <th className="px-4 py-3 text-right">HS Rate %</th>
              <th className="px-4 py-3 text-right">Knockdowns</th>
              <th className="px-4 py-3 text-right">Help Up</th>
              <th className="px-4 py-3 text-right">Revives</th>
              <th className="px-4 py-3 text-right">Survival</th>
              <th className="px-4 py-3 text-right">Healing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {leaderboardData.players.map((player, idx) => (
              <tr key={player.playerName} className={idx % 2 === 0 ? 'bg-slate-850' : 'bg-slate-800'}>
                <td className="px-4 py-3 font-bold text-cyan-400">#{idx + 1}</td>
                <td className="px-4 py-3 font-semibold">{player.playerName}</td>
                <td className="px-4 py-3 text-right">{player.matchesPlayed}</td>
                <td className="px-4 py-3 text-right">{player.kdRatio.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-semibold text-yellow-300">{player.totalKills}</td>
                <td className="px-4 py-3 text-right">{player.totalDamage}</td>
                <td className="px-4 py-3 text-right">{player.totalActualDamage}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-300">{player.avgHeadshotRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{player.totalKnockdowns}</td>
                <td className="px-4 py-3 text-right">{player.totalHelpUp}</td>
                <td className="px-4 py-3 text-right">{player.totalRevives}</td>
                <td className="px-4 py-3 text-right">{player.totalSurvivalTime} min</td>
                <td className="px-4 py-3 text-right">{player.totalHealing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
