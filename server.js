const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);
const port = 8000;
// const { Game } = require("./lib/game");
// const { startLoop } = require("./lib/loop");

// const game = new Game();

app.use(express.static('public'));
var cors = require('cors')
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
// io.on('connection', (socket) => {

//   game.addPlayer(socket.id);
//   io.emit("playerCount", Object.keys(game.players).length);

//   socket.on('add_action', (obj) => {
//     game.addAction(socket.id, obj);
//   });

// });

server.listen(port, () => {
//   console.log(`App listening on port ${port}`);

//   startLoop(game, io);

//   game.startGame();
});