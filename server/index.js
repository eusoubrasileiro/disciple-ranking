import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const PUBLIC_LEADERBOARD_FILE = path.join(PUBLIC_DATA_DIR, 'leaderboard.json');

// Config source - changes here are git-tracked and persist across dev restarts
const CONFIG_DIR = path.join(__dirname, '..', 'configs', 'royal-ambassadors', 'data');
const CONFIG_LEADERBOARD_FILE = path.join(CONFIG_DIR, 'leaderboard.json');

// Determine which file to use based on existence
// In development, we write to both the config source AND public/data
const LEADERBOARD_FILE = PUBLIC_LEADERBOARD_FILE;

const app = express();
app.use(cors());
app.use(express.json());

// Helper to read leaderboard data
async function readLeaderboard() {
  const content = await fs.readFile(LEADERBOARD_FILE, 'utf-8');
  return JSON.parse(content);
}

// Helper to write leaderboard data
// Writes to both public/data (for immediate frontend access) and config source (for git tracking)
async function writeLeaderboard(data) {
  data.updatedAt = new Date().toISOString();
  const content = JSON.stringify(data, null, 2);

  // Write to public/data for immediate frontend access
  await fs.writeFile(PUBLIC_LEADERBOARD_FILE, content);

  // Also write to config source so changes persist across dev restarts and are git-tracked
  try {
    await fs.writeFile(CONFIG_LEADERBOARD_FILE, content);
  } catch (err) {
    console.warn('Could not write to config source file:', err.message);
  }

  return data;
}

// Helper to find participant by ID
function findParticipant(data, id) {
  return data.participants.find(p => p.id === parseInt(id));
}

// GET /api/leaderboard - Read leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = await readLeaderboard();
    res.json(data);
  } catch (err) {
    console.error('Error reading leaderboard:', err);
    res.status(500).json({ error: 'Failed to read leaderboard data' });
  }
});

// POST /api/participants/:id/attendance - Add attendance record
app.post('/api/participants/:id/attendance', async (req, res) => {
  try {
    const { date, type } = req.body;
    if (!date || !type) {
      return res.status(400).json({ error: 'date and type are required' });
    }

    const data = await readLeaderboard();
    const participant = findParticipant(data, req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    if (!participant.attendance) {
      participant.attendance = [];
    }

    participant.attendance.push({
      date,
      type,
      addedAt: new Date().toISOString()
    });

    await writeLeaderboard(data);
    res.json({ success: true, participant });
  } catch (err) {
    console.error('Error adding attendance:', err);
    res.status(500).json({ error: 'Failed to add attendance' });
  }
});

// POST /api/participants/bulk/attendance - Add attendance to multiple participants
app.post('/api/participants/bulk/attendance', async (req, res) => {
  try {
    const { participantIds, date, type } = req.body;
    if (!participantIds || !Array.isArray(participantIds) || !date || !type) {
      return res.status(400).json({ error: 'participantIds (array), date, and type are required' });
    }

    const data = await readLeaderboard();
    const addedAt = new Date().toISOString();
    const updated = [];

    for (const id of participantIds) {
      const participant = findParticipant(data, id);
      if (participant) {
        if (!participant.attendance) {
          participant.attendance = [];
        }
        participant.attendance.push({ date, type, addedAt });
        updated.push(participant.id);
      }
    }

    await writeLeaderboard(data);
    res.json({ success: true, updatedIds: updated });
  } catch (err) {
    console.error('Error adding bulk attendance:', err);
    res.status(500).json({ error: 'Failed to add bulk attendance' });
  }
});

// DELETE /api/participants/:id/attendance/:index - Remove attendance record
app.delete('/api/participants/:id/attendance/:index', async (req, res) => {
  try {
    const data = await readLeaderboard();
    const participant = findParticipant(data, req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const index = parseInt(req.params.index);
    if (!participant.attendance || index < 0 || index >= participant.attendance.length) {
      return res.status(400).json({ error: 'Invalid attendance index' });
    }

    participant.attendance.splice(index, 1);
    await writeLeaderboard(data);
    res.json({ success: true, participant });
  } catch (err) {
    console.error('Error removing attendance:', err);
    res.status(500).json({ error: 'Failed to remove attendance' });
  }
});

// POST /api/participants/:id/verse - Add verse
app.post('/api/participants/:id/verse', async (req, res) => {
  try {
    const { ref } = req.body;
    if (!ref) {
      return res.status(400).json({ error: 'ref is required' });
    }

    const data = await readLeaderboard();
    const participant = findParticipant(data, req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    if (!participant.memorizedVerses) {
      participant.memorizedVerses = [];
    }

    // Check if verse already exists (as string or object)
    const exists = participant.memorizedVerses.some(v =>
      (typeof v === 'string' ? v : v.ref) === ref
    );
    if (exists) {
      return res.status(400).json({ error: 'Verse already memorized' });
    }

    // Add as object with timestamp
    participant.memorizedVerses.push({
      ref,
      addedAt: new Date().toISOString()
    });

    await writeLeaderboard(data);
    res.json({ success: true, participant });
  } catch (err) {
    console.error('Error adding verse:', err);
    res.status(500).json({ error: 'Failed to add verse' });
  }
});

// DELETE /api/participants/:id/verse/:index - Remove verse
app.delete('/api/participants/:id/verse/:index', async (req, res) => {
  try {
    const data = await readLeaderboard();
    const participant = findParticipant(data, req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const index = parseInt(req.params.index);
    if (!participant.memorizedVerses || index < 0 || index >= participant.memorizedVerses.length) {
      return res.status(400).json({ error: 'Invalid verse index' });
    }

    participant.memorizedVerses.splice(index, 1);
    await writeLeaderboard(data);
    res.json({ success: true, participant });
  } catch (err) {
    console.error('Error removing verse:', err);
    res.status(500).json({ error: 'Failed to remove verse' });
  }
});

// POST /api/participants/:id/visitor - Add visitor
app.post('/api/participants/:id/visitor', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const data = await readLeaderboard();
    const participant = findParticipant(data, req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    if (!participant.visitors) {
      participant.visitors = [];
    }

    // Add as object with timestamp
    participant.visitors.push({
      name,
      addedAt: new Date().toISOString()
    });

    await writeLeaderboard(data);
    res.json({ success: true, participant });
  } catch (err) {
    console.error('Error adding visitor:', err);
    res.status(500).json({ error: 'Failed to add visitor' });
  }
});

// DELETE /api/participants/:id/visitor/:index - Remove visitor
app.delete('/api/participants/:id/visitor/:index', async (req, res) => {
  try {
    const data = await readLeaderboard();
    const participant = findParticipant(data, req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const index = parseInt(req.params.index);
    if (!participant.visitors || index < 0 || index >= participant.visitors.length) {
      return res.status(400).json({ error: 'Invalid visitor index' });
    }

    participant.visitors.splice(index, 1);
    await writeLeaderboard(data);
    res.json({ success: true, participant });
  } catch (err) {
    console.error('Error removing visitor:', err);
    res.status(500).json({ error: 'Failed to remove visitor' });
  }
});

// PUT /api/points-as-of - Update the comparison date
app.put('/api/points-as-of', async (req, res) => {
  try {
    const { pointsAsOf } = req.body;
    if (!pointsAsOf) {
      return res.status(400).json({ error: 'pointsAsOf is required' });
    }

    const data = await readLeaderboard();
    data.pointsAsOf = pointsAsOf;
    await writeLeaderboard(data);
    res.json({ success: true, pointsAsOf: data.pointsAsOf });
  } catch (err) {
    console.error('Error updating pointsAsOf:', err);
    res.status(500).json({ error: 'Failed to update pointsAsOf' });
  }
});

// GET /api/activity-history - Get recent activity across all participants
app.get('/api/activity-history', async (req, res) => {
  try {
    const data = await readLeaderboard();
    const activities = [];

    for (const participant of data.participants) {
      // Attendance activities
      participant.attendance?.forEach((a, index) => {
        activities.push({
          type: 'attendance',
          participantId: participant.id,
          participantName: participant.name,
          index,
          data: a,
          addedAt: a.addedAt || a.date // fallback to date if no addedAt
        });
      });

      // Verse activities
      participant.memorizedVerses?.forEach((v, index) => {
        const verse = typeof v === 'string' ? { ref: v } : v;
        activities.push({
          type: 'verse',
          participantId: participant.id,
          participantName: participant.name,
          index,
          data: verse,
          addedAt: verse.addedAt || '1970-01-01T00:00:00Z'
        });
      });

      // Visitor activities
      participant.visitors?.forEach((v, index) => {
        const visitor = typeof v === 'string' ? { name: v } : v;
        activities.push({
          type: 'visitor',
          participantId: participant.id,
          participantName: participant.name,
          index,
          data: visitor,
          addedAt: visitor.addedAt || '1970-01-01T00:00:00Z'
        });
      });
    }

    // Sort by addedAt descending (most recent first)
    activities.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    // Return only the most recent 50 activities
    res.json({ activities: activities.slice(0, 50) });
  } catch (err) {
    console.error('Error getting activity history:', err);
    res.status(500).json({ error: 'Failed to get activity history' });
  }
});

// POST /api/participants - Add new participant
app.post('/api/participants', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const data = await readLeaderboard();

    // Generate new ID
    const maxId = Math.max(0, ...data.participants.map(p => p.id));
    const newParticipant = {
      id: maxId + 1,
      name,
      attendance: [],
      memorizedVerses: [],
      visitors: []
    };

    data.participants.push(newParticipant);
    await writeLeaderboard(data);
    res.json({ success: true, participant: newParticipant });
  } catch (err) {
    console.error('Error adding participant:', err);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Admin API server running on http://localhost:${PORT}`);
});
