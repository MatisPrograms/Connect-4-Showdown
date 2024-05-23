require('dotenv').config();

const io = require('socket.io')(3000, {
    cors: {
        origin: true
    }
});

console.log("Socket server running at http://localhost:3000/");

require('./sockets/gameSocket')(io);
require('./sockets/leaderboardSocket')(io);
require('./sockets/socialSocket')(io);