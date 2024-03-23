//necessary initialization
const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketTeam.db')

const app = express()

app.use(express.json())

let database = null

//initialize DB and server

const initDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server running at http://localhost:3000'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initDbAndServer()

//convert db obj to response obj

const dbObjToRespObj = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  }
}

//get request

app.get('/players/', async (request, response) => {
  const query = `SELECT * FROM cricket_team;`
  const playerArray = await database.all(query)

  response.send(playerArray.map(eachPlayer => dbObjToRespObj(eachPlayer)))
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId}`
  const player = await database.get(getPlayerQuery)
  response.send(dbObjToRespObj(player))
})

//post

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES 
  ('${playerName}', '${jerseyNumber}','${role}');`
  const player = await database.run(postPlayerQuery)
  response.send('Player Added to Team')
})

//put

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
     UPDATE cricket_team SET 
     player_name = '${playerName}', 
     jersey_number= '${jerseyNumber}', 
     role = '${role}' 
    WHERE player_id = '${playerId};`
  await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//delete

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = '${playerId}';`
  await database.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
