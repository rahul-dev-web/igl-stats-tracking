import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import Dashboard from './Dashboard';
import DataEntry from './DataEntry';
import Leaderboard from './Leaderboard';
import Categories from './Categories';
import Profile from './Profile';

const API_URL = process.env.REACT_APP_API_URL || 'https://igl-stats-tracking.onrender.com/api';

export default function IGLCompetitionTracker() {
  const [currentPage, setCurrentPage] = useState('entry');
  const [selectedPlayer, setSelectedPlayer] = useState('IGL☆HR');
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState({});
  const [playerProfile, setPlayerProfile] = useState(null);
  const [matchCount, setMatchCount] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
  }, [selectedPlayer]);

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
  }, [currentPage, selectedPlayer]);

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

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-slate-900 text-white" style={{ overscrollBehavior: 'none' }}>
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'dashboard' && <Dashboard dashboardData={dashboardData} />}
        {currentPage === 'entry' && (
          <DataEntry 
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            matchCount={matchCount}
            setMatchCount={setMatchCount}
            error={error}
            setError={setError}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            API_URL={API_URL}
            PLAYERS={PLAYERS}
          />
        )}
        {currentPage === 'leaderboard' && <Leaderboard leaderboardData={leaderboardData} />}
        {currentPage === 'categories' && <Categories categoryLeaderboards={categoryLeaderboards} />}
        {currentPage === 'profile' && (
          <Profile 
            playerProfile={playerProfile}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            PLAYERS={PLAYERS}
          />
        )}
      </main>
    </div>
  );
}
