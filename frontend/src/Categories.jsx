import React from 'react';

const Categories = ({ categoryLeaderboards }) => {
  const categories = [
    { key: 'kills', title: '🎯 Kill King', stat: 'totalKills', sortDesc: true },
    { key: 'knockdowns', title: '💥 Knockdown King', stat: 'totalKnockdowns', sortDesc: true },
    { key: 'damage', title: '🔥 Damage King', stat: 'totalDamage', sortDesc: true },
    { key: 'actualDamage', title: '⚡ Actual Damage King', stat: 'totalActualDamage', sortDesc: true },
    { key: 'assists', title: '🤝 Assist King', stat: 'totalAssists', sortDesc: true },
    { key: 'headshots', title: '🎯 Headshot King', stat: 'avgHeadshotRate', sortDesc: true },
    { key: 'deaths', title: '💀 Survival Expert (Low Deaths)', stat: 'totalDeaths', sortDesc: false },
    { key: 'helpUp', title: '🛡 Help Up King', stat: 'totalHelpUp', sortDesc: true },
    { key: 'revives', title: '♻ Revive King', stat: 'totalRevives', sortDesc: true },
    { key: 'survival', title: '⏱ Survival King', stat: 'totalSurvivalTime', sortDesc: true },
    { key: 'healing', title: '💉 Healing King', stat: 'totalHealing', sortDesc: true },
  ];

  return (
    <div className="pb-8 space-y-8">
      <h2 className="text-2xl font-bold text-white">🏆 Category Leaderboards</h2>
      {categories.map(({ key, title, stat, sortDesc }) => {
        const sortedPlayers = [...(categoryLeaderboards[key] || [])].sort((a, b) => {
          if (sortDesc) {
            return b[stat] - a[stat];
          } else {
            return a[stat] - b[stat];
          }
        }).slice(0, 5);

        return (
          <div key={key} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="space-y-2">
              {sortedPlayers && sortedPlayers.length > 0 ? (
                sortedPlayers.map((player, idx) => (
                  <div key={player.playerName} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-bold text-lg">#{idx + 1}</span>
                      <span className="text-white font-semibold">{player.playerName}</span>
                      <span className="text-slate-400 text-sm">({player.matchesPlayed} matches)</span>
                    </div>
                    <span className={`font-bold text-lg ${
                      key === 'deaths' ? 'text-blue-300' : 'text-yellow-300'
                    }`}>
                      {key === 'deaths' 
                        ? `${player[stat].toFixed(0)} deaths`
                        : (typeof player[stat] === 'number' ? player[stat].toFixed(1) : player[stat])
                      }
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-4">No data available</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Categories;
