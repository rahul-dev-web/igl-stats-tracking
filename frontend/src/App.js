import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { Trophy, Target, Flame, Activity, Users, Award, Clock, Droplet, BarChart3, ChevronDown, Plus, Save, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function IGLCompetitionTracker() {
  const [currentPage, setCurrentPage] = useState('entry');
  const [selectedPlayer, setSelectedPlayer] = useState('IGL☆HR');
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState({});
  const [playerProfile, setPlayerProfile] = useState(null);
  const [matchCount, setMatchCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
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

  const PLAYERS = ['IGL☆HR', 'IGL☆YASH', 'IGL☆SHREYAS', 'IGL☆RJ', 'IGL☆GOD'];

  // ===== FETCH MATCH COUNT FOR PLAYER =====
  useEffect(() => {
    const fetchMatchCount = async () => {
      try {
        const res = await fetch(`${API_URL}/player/${selectedPlayer}`);
        if (res.ok) {
          const data = await res.json();
          setMatchCount(data.matchesPlayed);
        }
      } catch (err) {
        console.log('Error fetching match count');
      }
    };

    fetchMatchCount();
  }, [selectedPlayer]); // Only fetch when player changes

  // ===== FETCH DASHBOARD DATA =====
  useEffect(() => {
    if (currentPage !== 'dashboard') return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard`);
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError('Error loading dashboard: ' + err.message);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // ===== FETCH LEADERBOARD DATA =====
  useEffect(() => {
    if (currentPage !== 'leaderboard') return;

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        const data = await res.json();
        setLeaderboardData(data);
      } catch (err) {
        setError('Error loading leaderboard: ' + err.message);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // ===== FETCH CATEGORY LEADERBOARDS =====
  useEffect(() => {
    if (currentPage !== 'categories') return;

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategoryLeaderboards(data);
      } catch (err) {
        setError('Error loading categories: ' + err.message);
      }
    };

    fetchCategories();
    const interval = setInterval(fetchCategories, 5000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // ===== FETCH PLAYER PROFILE =====
  useEffect(() => {
    if (currentPage !== 'profile') return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/player/${selectedPlayer}`);
        if (!res.ok) throw new Error('Failed to fetch player profile');
        const data = await res.json();
        setPlayerProfile(data);
      } catch (err) {
        setError('Error loading player profile: ' + err.message);
      }
    };

    fetchProfile();
    const interval = setInterval(fetchProfile, 5000);
    return () => clearInterval(interval);
  }, [currentPage, selectedPlayer]);

  // ===== HANDLE FORM SUBMISSION =====
  const handleSaveMatch = async (e) => {
    e.preventDefault();
    
    // Validate required fields
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
      
      // Clear form
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

      // Update match count
      setMatchCount((matchCount || 0) + 1);
      setError(null);

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError('Error saving match: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollPositionRef = useRef(0);
  const animationFrameRef = useRef(null);
  const formRef = useRef(null);

  const handleInputChange = useCallback((field, value) => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Save scroll position BEFORE any state update
    scrollPositionRef.current = window.scrollY;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Schedule scroll restoration AFTER render
    animationFrameRef.current = requestAnimationFrame(() => {
      if (window.scrollY !== scrollPositionRef.current) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    });
  }, []);

  // Restore scroll position after render if it changed
  useLayoutEffect(() => {
    const currentScroll = window.scrollY;
    if (currentScroll !== scrollPositionRef.current) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  });

  // ===== NAVIGATION BAR =====
  const NavBar = () => (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b-2 border-cyan-500 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">IGL Competition Tracker</h1>
          </div>
          <div className="text-sm text-cyan-400 font-semibold">Week: Jun 15-21, 2026</div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'dashboard', label: '🏆 Dashboard' },
            { id: 'entry', label: '📊 Data Entry' },
            { id: 'leaderboard', label: '📈 Leaderboard' },
            { id: 'categories', label: '🎯 Categories' },
            { id: 'profile', label: '👤 Profile' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === id
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-cyan-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  // ===== DASHBOARD PAGE =====
  const Dashboard = () => {
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

  // ===== DATA ENTRY PAGE =====
  const DataEntry = () => {
    return (
      <div className="space-y-8 pb-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-8">📊 Match Data Entry</h2>

          {/* Fixed height message container - prevents layout shift */}
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

          <form onSubmit={handleSaveMatch} ref={formRef} className="space-y-6">
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

            {/* Auto Match Counter - FROM DATABASE */}
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
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Kills</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.kills}
                    onChange={(e) => handleInputChange('kills', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Knockdowns</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.knockdowns}
                    onChange={(e) => handleInputChange('knockdowns', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Deaths</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.deaths}
                    onChange={(e) => handleInputChange('deaths', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Assists</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.assists}
                    onChange={(e) => handleInputChange('assists', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Headshots</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.headshots}
                    onChange={(e) => handleInputChange('headshots', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
            </fieldset>

            {/* Damage Stats */}
            <fieldset className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <legend className="text-white font-semibold mb-4">💥 Damage Stats</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Damage</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.damage}
                    onChange={(e) => handleInputChange('damage', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Actual Damage</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.actualDamage}
                    onChange={(e) => handleInputChange('actualDamage', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
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
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Help Up</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.helpUp}
                    onChange={(e) => handleInputChange('helpUp', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Revives</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.revives}
                    onChange={(e) => handleInputChange('revives', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
            </fieldset>

            {/* Survival & Healing */}
            <fieldset className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <legend className="text-white font-semibold mb-4">⏱ Survival & Healing</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Survival Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.survivalTime}
                    onChange={(e) => handleInputChange('survivalTime', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Healing</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoComplete="off"
                    value={formData.healing}
                    onChange={(e) => handleInputChange('healing', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
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

  // ===== OVERALL LEADERBOARD =====
  const OverallLeaderboard = () => {
    if (!leaderboardData || !leaderboardData.players) {
      return <div className="text-center py-12 text-cyan-300">Loading leaderboard...</div>;
    }

    return (
      <div className="pb-8">
        <h2 className="text-2xl font-bold text-white mb-6">📈 Overall Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white text-sm">
            <thead className="bg-slate-800 border-b-2 border-cyan-500 sticky top-16">
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

  // ===== CATEGORY LEADERBOARDS =====
  const CategoryLeaderboards = () => {
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
          // For deaths (low = good), sort ascending. For others, sort descending
          const sortedPlayers = [...(categoryLeaderboards[key] || [])].sort((a, b) => {
            if (sortDesc) {
              return b[stat] - a[stat]; // Higher is better
            } else {
              return a[stat] - b[stat]; // Lower is better
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

  // ===== PLAYER PROFILE =====
  const PlayerProfile = () => {
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
            className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-cyan-500 max-w-md"
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

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-slate-900 text-white" style={{ overscrollBehavior: 'none' }}>
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'entry' && <DataEntry />}
        {currentPage === 'leaderboard' && <OverallLeaderboard />}
        {currentPage === 'categories' && <CategoryLeaderboards />}
        {currentPage === 'profile' && <PlayerProfile />}
      </main>
    </div>
  );
}
