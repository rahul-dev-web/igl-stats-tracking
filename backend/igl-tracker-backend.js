import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
// Update CORS to allow Vercel domain
app.use(cors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://igl-stats-tracking.vercel.app/'  // Will add after deployment
  ],
  credentials: true
}));
app.use(express.json());

// Fixed Players
const PLAYERS = ['IGL☆HR', 'IGL☆YASH', 'IGL☆SHREYAS', 'IGL☆RJ', 'IGL☆GOD'];

// ===== HELPER FUNCTIONS =====

/**
 * Calculate KD Ratio
 * KD = Total Kills / Total Deaths (min 1 death to avoid division by zero)
 */
function calculateKD(totalKills, totalDeaths) {
  if (totalDeaths === 0) return totalKills;
  return totalKills / totalDeaths;
}

/**
 * Get player's current match number
 * Example: If player has 49 saved matches, next entry is Match #50
 */
async function getPlayerMatchNumber(playerName) {
  const { data, error } = await supabase
    .from('MatchStats')
    .select('PlayerMatchNo')
    .eq('PlayerName', playerName)
    .order('PlayerMatchNo', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error getting match number:', error);
    return 1;
  }

  if (!data || data.length === 0) return 1;
  return data[0].PlayerMatchNo + 1;
}

/**
 * Aggregate stats for a player
 */
async function getPlayerAggregates(playerName) {
  const { data, error } = await supabase
    .from('MatchStats')
    .select('*')
    .eq('PlayerName', playerName);

  if (error || !data || data.length === 0) {
    return {
      playerName,
      matchesPlayed: 0,
      totalKills: 0,
      totalKnockdowns: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalHeadshots: 0,
      totalDamage: 0,
      totalActualDamage: 0,
      totalHelpUp: 0,
      totalRevives: 0,
      totalSurvivalTime: 0,
      totalHealing: 0,
      avgHeadshotRate: 0,
      kdRatio: 0,
    };
  }

  const stats = {
    playerName,
    matchesPlayed: data.length,
    totalKills: data.reduce((sum, d) => sum + (d.Kills || 0), 0),
    totalKnockdowns: data.reduce((sum, d) => sum + (d.Knockdowns || 0), 0),
    totalDeaths: data.reduce((sum, d) => sum + (d.Deaths || 0), 0),
    totalAssists: data.reduce((sum, d) => sum + (d.Assists || 0), 0),
    totalHeadshots: data.reduce((sum, d) => sum + (d.Headshots || 0), 0),
    totalDamage: data.reduce((sum, d) => sum + (d.Damage || 0), 0),
    totalActualDamage: data.reduce((sum, d) => sum + (d.ActualDamage || 0), 0),
    totalHelpUp: data.reduce((sum, d) => sum + (d.HelpUp || 0), 0),
    totalRevives: data.reduce((sum, d) => sum + (d.Revives || 0), 0),
    totalSurvivalTime: data.reduce((sum, d) => sum + (d.SurvivalTime || 0), 0),
    totalHealing: data.reduce((sum, d) => sum + (d.Healing || 0), 0),
  };

  // Calculate average headshot rate
  stats.avgHeadshotRate = data.length > 0
    ? (data.reduce((sum, d) => sum + (d.HeadshotRate || 0), 0) / data.length)
    : 0;

  // Calculate KD ratio
  stats.kdRatio = calculateKD(stats.totalKills, stats.totalDeaths);

  return stats;
}

/**
 * Get all players' aggregates
 */
async function getAllPlayersAggregates() {
  const promises = PLAYERS.map(player => getPlayerAggregates(player));
  const results = await Promise.all(promises);
  // Don't filter! Return all players even if they have 0 stats
  return results;
}

// ===== API ENDPOINTS =====

/**
 * POST /api/match
 * Save a match entry
 * Body: { playerName, kills, knockdowns, deaths, assists, headshots, headshotRate, damage, actualDamage, helpUp, revives, survivalTime, healing }
 */
app.post('/api/match', async (req, res) => {
  try {
    const {
      playerName,
      kills,
      knockdowns,
      deaths,
      assists,
      headshots,
      damage,
      actualDamage,
      helpUp,
      revives,
      survivalTime,
      healing,
    } = req.body;

    // Validate player
    if (!PLAYERS.includes(playerName)) {
      return res.status(400).json({ error: 'Invalid player name' });
    }

    // Get next match number for this player
    const playerMatchNo = await getPlayerMatchNumber(playerName);

    // Calculate headshot rate
    const headshotRate = kills > 0 ? (headshots / kills) * 100 : 0;

    // Insert match record
    const { data, error } = await supabase
      .from('MatchStats')
      .insert([
        {
          DateTime: new Date().toISOString(),
          PlayerName: playerName,
          PlayerMatchNo: playerMatchNo,
          Kills: kills || 0,
          Knockdowns: knockdowns || 0,
          Deaths: deaths || 0,
          Assists: assists || 0,
          Headshots: headshots || 0,
          HeadshotRate: headshotRate,
          Damage: damage || 0,
          ActualDamage: actualDamage || 0,
          HelpUp: helpUp || 0,
          Revives: revives || 0,
          SurvivalTime: survivalTime || 0,
          Healing: healing || 0,
        },
      ]);

    if (error) {
      console.error('Error saving match:', error);
      return res.status(500).json({ error: 'Failed to save match' });
    }

    res.json({
      success: true,
      message: `Match #${playerMatchNo} saved for ${playerName}`,
      data,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/dashboard
 * Get dashboard data with champions
 */
app.get('/api/dashboard', async (req, res) => {
  try {
    const allPlayers = await getAllPlayersAggregates();

    // Count total matches
    const { count } = await supabase
      .from('MatchStats')
      .select('*', { count: 'exact', head: true });

    // Find category winners
    const champions = {
      killKing: allPlayers.reduce((max, p) => 
        p.totalKills > max.totalKills ? p : max
      )?.playerName || 'N/A',
      damageKing: allPlayers.reduce((max, p) => 
        p.totalDamage > max.totalDamage ? p : max
      )?.playerName || 'N/A',
      actualDamageKing: allPlayers.reduce((max, p) => 
        p.totalActualDamage > max.totalActualDamage ? p : max
      )?.playerName || 'N/A',
      headshotKing: allPlayers.reduce((max, p) => 
        p.avgHeadshotRate > max.avgHeadshotRate ? p : max
      )?.playerName || 'N/A',
      assistKing: allPlayers.reduce((max, p) => 
        p.totalAssists > max.totalAssists ? p : max
      )?.playerName || 'N/A',
      survivalExpert: allPlayers.reduce((min, p) => 
        p.totalDeaths < min.totalDeaths ? p : min
      )?.playerName || 'N/A',
      helpUpKing: allPlayers.reduce((max, p) => 
        p.totalHelpUp > max.totalHelpUp ? p : max
      )?.playerName || 'N/A',
      reviveKing: allPlayers.reduce((max, p) => 
        p.totalRevives > max.totalRevives ? p : max
      )?.playerName || 'N/A',
      survivalKing: allPlayers.reduce((max, p) => 
        p.totalSurvivalTime > max.totalSurvivalTime ? p : max
      )?.playerName || 'N/A',
      healingKing: allPlayers.reduce((max, p) => 
        p.totalHealing > max.totalHealing ? p : max
      )?.playerName || 'N/A',
    };

    // Find overall leader (sorted by kills DESC)
    const overallLeader = allPlayers.reduce((max, p) => 
      p.totalKills > max.totalKills ? p : max
    );

    res.json({
      totalMatches: count || 0,
      champions,
      overallLeader,
      competitionPeriod: {
        start: '2026-06-15',
        end: '2026-06-21',
      },
    });
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/leaderboard
 * Get overall leaderboard sorted by total kills DESC, then actual damage DESC, etc.
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    let players = await getAllPlayersAggregates();

    // Sort by: Total Kills DESC -> Actual Damage DESC -> Knockdowns DESC -> Survival Time DESC
    players.sort((a, b) => {
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      if (b.totalActualDamage !== a.totalActualDamage) return b.totalActualDamage - a.totalActualDamage;
      if (b.totalKnockdowns !== a.totalKnockdowns) return b.totalKnockdowns - a.totalKnockdowns;
      return b.totalSurvivalTime - a.totalSurvivalTime;
    });

    res.json({ players });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/categories
 * Get category-wise leaderboards
 */
app.get('/api/categories', async (req, res) => {
  try {
    let players = await getAllPlayersAggregates();

    // Ensure all players have all stats
    players = players.map(p => ({
      ...p,
      totalDeaths: p.totalDeaths || 0,
      avgHeadshotRate: p.avgHeadshotRate || 0,
    }));

    // Create category leaderboards
    const categories = {
      kills: [...players].sort((a, b) => b.totalKills - a.totalKills),
      knockdowns: [...players].sort((a, b) => b.totalKnockdowns - a.totalKnockdowns),
      damage: [...players].sort((a, b) => b.totalDamage - a.totalDamage),
      actualDamage: [...players].sort((a, b) => b.totalActualDamage - a.totalActualDamage),
      assists: [...players].sort((a, b) => b.totalAssists - a.totalAssists),
      headshots: [...players].sort((a, b) => b.avgHeadshotRate - a.avgHeadshotRate),
      deaths: [...players].sort((a, b) => {
        // Handle cases where deaths might be 0
        const aDeaths = a.totalDeaths || 0;
        const bDeaths = b.totalDeaths || 0;
        return aDeaths - bDeaths; // LOW deaths = HIGH rank
      }),
      helpUp: [...players].sort((a, b) => b.totalHelpUp - a.totalHelpUp),
      revives: [...players].sort((a, b) => b.totalRevives - a.totalRevives),
      survival: [...players].sort((a, b) => b.totalSurvivalTime - a.totalSurvivalTime),
      healing: [...players].sort((a, b) => b.totalHealing - a.totalHealing),
    };

    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/player/:playerName
 * Get individual player profile
 */
app.get('/api/player/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params;

    // Validate player
    if (!PLAYERS.includes(playerName)) {
      return res.status(400).json({ error: 'Invalid player name' });
    }

    const playerStats = await getPlayerAggregates(playerName);

    if (!playerStats) {
      return res.json({
        playerName,
        matchesPlayed: 0,
        totalKills: 0,
        totalKnockdowns: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalHeadshots: 0,
        avgHeadshotRate: 0,
        totalDamage: 0,
        totalActualDamage: 0,
        totalHelpUp: 0,
        totalRevives: 0,
        totalSurvivalTime: 0,
        totalHealing: 0,
        kdRatio: 0,
      });
    }

    res.json(playerStats);
  } catch (err) {
    console.error('Error fetching player profile:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/players
 * Get all players list
 */
app.get('/api/players', (req, res) => {
  res.json({ players: PLAYERS });
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IGL Tracker API running on http://localhost:${PORT}`);
  console.log(`✅ Connected to Supabase`);
});