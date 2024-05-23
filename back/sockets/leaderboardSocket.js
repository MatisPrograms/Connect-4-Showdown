const leaderboard = require("../api/game");

const leaderboardSocket = (io) => {

    const leaderboardSocket = io.of('api/leaderboard');
    leaderboardSocket.on('connection', async (socket) => {
        socket.emit('leaderboard', await leaderboard());

        socket.on('leaderboard', async () => {
            socket.emit('leaderboard', await leaderboard());
        });
    });

    let oldLeaderboardData;
    setInterval(async () => {
        let leaderboardData = await leaderboard();

        if (JSON.stringify(leaderboardData) !== JSON.stringify(oldLeaderboardData)) {
            oldLeaderboardData = leaderboardData;
            leaderboardSocket.emit('leaderboard', leaderboardData);
        }
    }, 5000);
};

module.exports = leaderboardSocket;