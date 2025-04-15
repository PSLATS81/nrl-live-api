const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
 const matchListRes = await fetch("https://mc.nrl.com/v1/matches", {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://matchcentre.nrl.com/",
    "Accept": "application/json",
    "Origin": "https://matchcentre.nrl.com"
  }
});

    const matches = await matchListRes.json();

    const matchData = await Promise.all(matches.map(async (match) => {
      const matchId = match.matchId;
      const detailsUrl = `https://matchcentre.nrl.com/match/${matchId}/periods`;

      try {
        const detailsRes = await fetch(detailsUrl, {
          headers: {
            "Referer": "https://matchcentre.nrl.com/",
            "Origin": "https://matchcentre.nrl.com"
          }
        });

        const details = await detailsRes.json();

        return {
          matchId,
          homeTeam: match.homeTeam?.nickname,
          awayTeam: match.awayTeam?.nickname,
          scheduledKickoff: match.kickoffTime,
          score: details.periods?.[0]?.score || {},
          status: details.periods?.[0]?.status || match.status
        };
      } catch (err) {
        return { matchId, error: "Failed to fetch match details" };
      }
    }));

    res.json(matchData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches." });
  }
});

app.listen(PORT, () => console.log(`NRL API listening on port ${PORT}`));
