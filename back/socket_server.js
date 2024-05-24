require('dotenv').config();
const httpServer = require('./http_server').server;

const io = require('socket.io')(httpServer, {
    cors: {
        origin: true
    }
});

console.log("Socket server running at " + httpServer.address().address + ":" + httpServer.address().port);

require('./sockets/gameSocket')(io);
require('./sockets/leaderboardSocket')(io);
require('./sockets/socialSocket')(io);