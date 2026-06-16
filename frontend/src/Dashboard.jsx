import React from 'react';

const Dashboard = ({ dashboardData }) => {
  if (!dashboardData) return <div className="text-center py-12 text-xl text-cyan-300">Loading dashboard...</div>;

  const champions = dashboardData.champions || {};

  return (
    <div className="space-y-8 pb-8">
      {/* Competition Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 p-6 rounded-lg border border-cyan-500">
          <p className="text-cyan-300 text-sm font-semibold">COMPETITION PERIOD</p>
          <p className="text-white text-lg mt-2">June 15 - June 21, 2026</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg border border-purple-500">
          <p className="text-purple-300 text-sm font-semibold">TOTAL MATCHES</p>
          <p className="text-white text-3xl font-bold mt-2">{dashboardData.totalMatches || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-lg border border-orange-500">
          <p className="text-orange-300 text-sm font-semibold">LAST UPDATE</p>
          <p className="text-white text-sm mt-2">Now</p>
        </div>
      </div>

      {/* Category Winners */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Category Winners 👑</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: '🎯', title: 'Kill King', key: 'killKing' },
            { emoji: '💥', title: 'Damage King', key: 'damageKing' },
            { emoji: '⚡', title: 'Actual Damage King', key: 'actualDamageKing' },
            { emoji: '🎯', title: 'Headshot King', key: 'headshotKing' },
            { emoji: '🤝', title: 'Assist King', key: 'assistKing' },
            { emoji: '💀', title: 'Survival Expert', key: 'survivalExpert' },
            { emoji: '🛡', title: 'Help Up King', key: 'helpUpKing' },
            { emoji: '♻', title: 'Revive King', key: 'reviveKing' },
            { emoji: '⏱', title: 'Survival King', key: 'survivalKing' },
            { emoji: '💉', title: 'Healing King', key: 'healingKing' },
          ].map(({ emoji, title, key }) => (
            <div key={key} className="bg-slate-800 border-l-4 border-cyan-500 p-4 rounded">
              <p className="text-cyan-400 text-sm font-semibold">{emoji} {title}</p>
              <p className="text-white text-lg font-bold mt-2">{champions[key] || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Leader */}
      {dashboardData.overallLeader && (
        <div className="bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-900 border-2 border-yellow-400 rounded-lg p-8">
          <h3 className="text-yellow-300 text-lg font-semibold mb-4">👑 OVERALL LEADER</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <p className="text-yellow-300 text-sm">Player</p>
              <p className="text-white text-xl font-bold">{dashboardData.overallLeader.playerName}</p>
            </div>
            <div>
              <p className="text-yellow-300 text-sm">Matches</p>
              <p className="text-white text-xl font-bold">{dashboardData.overallLeader.matchesPlayed}</p>
            </div>
            <div>
              <p className="text-yellow-300 text-sm">Kills</p>
              <p className="text-white text-xl font-bold">{dashboardData.overallLeader.totalKills}</p>
            </div>
            <div>
              <p className="text-yellow-300 text-sm">KD Ratio</p>
              <p className="text-white text-xl font-bold">{dashboardData.overallLeader.kdRatio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-yellow-300 text-sm">Damage</p>
              <p className="text-white text-xl font-bold">{dashboardData.overallLeader.totalDamage}</p>
            </div>
            <div>
              <p className="text-yellow-300 text-sm">Actual DMG</p>
              <p className="text-white text-xl font-bold">{dashboardData.overallLeader.totalActualDamage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
