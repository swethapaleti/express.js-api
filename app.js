const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
app.use(express.json());

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBandServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getAllPlayers = `SELECT * from cricket_team`;
  const playersArray = await db.all(getAllPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addNewPlayer = `INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addNewPlayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `SELECT * from cricket_team WHERE player_id = ${playerId}`;
  const player = await db.get(getAllPlayers);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addNewPlayer = `UPDATE cricket_team 
  SET player_name='${playerName}',jersey_number = ${jerseyNumber},role='${role}' WHERE player_id=${playerId}`;
  const dbResponse = await db.run(addNewPlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `DELETE from cricket_team WHERE player_id = ${playerId} `;
  const playersArray = await db.run(getAllPlayers);
  response.send("Player Removed");
});

module.exports = app;
