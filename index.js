const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let leaderboard = []; // This will store our leaderboard data

app.get('/leaderboard', (req, res) => {
    res.json(leaderboard);
});

app.post('/leaderboard', (req, res) => {
   const player = req.body.player;
   const score = req.body.score;

   leaderboard.push({ player, score });

   // Sort the leaderboard based on score in descending order
   leaderboard.sort((a, b) => b.score - a.score);

   // Update the position of each player based on their index in the sorted array
   leaderboard = leaderboard.map((item, index) => ({
       ...item,
       position: index + 1
   }));

   const newPlayer = leaderboard.find(item => item.player === player);

   res.json(newPlayer);
});

app.listen(port, () => {
    console.log(`Leaderboard app listening on port ${port}`);
});