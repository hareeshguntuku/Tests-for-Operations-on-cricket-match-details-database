const express = require("express");
const app = express();
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

app.use(express.json());

const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3006, () => {
      console.log("Server Running at http://localhost:3006/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

//api1
app.get("/players/", async (request, response) => {
  const playerListQuery = `
    SELECT player_id AS playerId, player_name AS playerName 
    FROM player_details;`;
  const dbResponse = await db.all(playerListQuery);
  response.send(dbResponse);
});

//api2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerListQuery = `
    SELECT player_id AS playerId, player_name AS playerName
     FROM player_details
    WHERE playerId = ${playerId};`;
  const dbResponse = await db.get(getPlayerListQuery);
  response.send(dbResponse);
});

//api3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetailsQuery = `
    UPDATE 
    player_details
    SET 
    player_name = '${playerName}'
    WHERE player_id = ${playerId}`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//api4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchListQuery = `
    SELECT match_id AS matchId, match , year
     FROM match_details
    WHERE matchId = ${matchId};`;
  const dbResponse = await db.get(getMatchListQuery);
  response.send(dbResponse);
});

//api5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchListQuery = `
    SELECT
     match_id AS matchId, match , year
     FROM player_match_score 
     NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const dbResponse = await db.all(playerMatchListQuery);
  response.send(dbResponse);
});

//api6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerListMatchQuery = `
    SELECT
     player_id AS playerId,
      player_name AS playerName
     FROM player_match_score 
     NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;
  const dbResponse = await db.all(playerListMatchQuery);
  response.send(dbResponse);
});

//api7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchListQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
  const dbResponse = await db.get(playerMatchListQuery);
  response.send(dbResponse);
});

initializeDBAndServer();

module.exports = app;
