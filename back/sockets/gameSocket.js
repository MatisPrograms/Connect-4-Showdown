const {Game} = require("../logic/game_engine");
const jwt = require("jsonwebtoken");
const {db} = require("../mongoDB");

const randomAILevel = 100;
const hybridAILevel = 250;
const monteCarloAILevel = 750;
const minimaxAILevel = 1500;
const solverAILevel = 2500;
const rankedWinMMR = 5;

const gameSocket = (io) => {
    const gameSocket = io.of('api/game');
    let rankedQueue = [];
    let casualQueue = new Map();

    function getKeyFromValue(map, value) {
        try {
            return [...map.entries()].find(([key, val]) => val === value)[0];
        } catch (e) {
            return null;
        }
    }

    gameSocket.on('connection', (socket) => {
        socket.emitter = socket;
        socket.game = new Game();
        socket.game.io = socket.emitter;

        socket.emitter.on('gameMode', async (gameMode) => {
            socket.game.mode = gameMode.mode;
            switch (socket.game.mode) {
                case '1v1':
                    socket.emitter.emit('newGame', socket.game.nextTurn());
                    break;
                case 'AI':
                    socket.emitter.emit('AI-Setup');
                    break;
                case 'Ranked':
                    const token = socket.handshake.auth.token;
                    if (!token) return;

                    const decoded = jwt.verify(token.replaceAll('\"', ''), process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
                        if (err) return false
                        return decoded
                    });
                    if (!decoded) return;
                    socket.user = await db.collection("Users").findOne({Email: decoded.email}, {
                        projection: {
                            Password: 0,
                            Tokens: 0,
                            _id: 0
                        }
                    });

                    rankedQueue.push(socket);
                    socket.game.clearTimer();
                    if (rankedQueue.length >= 2) {
                        // Player 1 and 2
                        const socket1 = rankedQueue.pop();
                        const socket2 = rankedQueue.pop();

                        // Add players to room
                        const room = socket1.id + ":" + socket2.id;
                        socket1.join(room);
                        socket2.join(room);

                        socket.game.resetGame();
                        socket.game.player1 = socket1.user
                        socket.game.player2 = socket2.user
                        socket.game.mmr = rankedWinMMR;

                        // Update emitter and game for each player
                        socket1.emitter = gameSocket.to(room);
                        socket2.emitter = gameSocket.to(room);
                        socket1.game = socket.game;
                        socket2.game = socket.game;
                        socket.game.io = socket.emitter;

                        // Emit events to players in the room
                        socket.game.randomTurn();
                        socket.emitter.emit('newGame', socket.game.nextTurn());
                    } else {
                        socket.emitter.emit('Waiting');
                    }
                    break;
                case 'Casual':
                    socket.emitter.emit('Casual-Setup');
                    break;
                default:
                    return;
            }
        });

        socket.emitter.on('newMove', (move) => {
            if (socket.game.status.finished) return;
            socket.game.newTurn(move);

            if (socket.game.status.finished) {
                if (socket.game.mode === 'AI') {
                    if (socket.game.status.winner === '1' && !socket.game.aiFirst || socket.game.status.winner === '2' && socket.game.aiFirst) {
                        const model = socket.game.ai.toLowerCase();
                        const level = model === 'Random'.toLowerCase() ? randomAILevel :
                            model === 'Hybrid'.toLowerCase() ? hybridAILevel :
                                model === 'MonteCarlo'.toLowerCase() ? monteCarloAILevel :
                                    model === 'Minimax'.toLowerCase() ? minimaxAILevel : solverAILevel;

                        const token = socket.handshake.auth.token;
                        if (token) {
                            jwt.verify(token.replaceAll('\"', ''), process.env.JWT_ACCESS_TOKEN, async (err, decoded) => {
                                if (!err && decoded) {
                                    const user = await db.collection("Users").findOne({Email: decoded.email}, {
                                        projection: {
                                            Password: 0,
                                            Tokens: 0,
                                            _id: 0
                                        }
                                    });

                                    if (user.MMR < level) {
                                        await db.collection("Users").updateOne({Email: decoded.email}, {$set: {MMR: level}});
                                    }
                                }
                            });
                        }
                    }
                }
                if (socket.game.mode === 'Ranked' || socket.game.mode === 'Casual') {
                    const player1 = socket.game.player1.Username;
                    const player2 = socket.game.player2.Username;
                    db.collection("Games").insertOne({
                        Player1: player1,
                        Player2: player2,
                        Winner: socket.game.status.winner === '1' ? player1 : player2,
                        Board: socket.game.board,
                        Moves: socket.game.moves.map(move => move[0]).join(''),
                        Mode: socket.game.mode,
                        Timestamp: new Date()
                    })
                }
            }
            socket.emitter.emit('updatedBoard', socket.game.nextTurn());
        });

        socket.emitter.on('resetGame', () => {
            socket.game.resetGame();
            socket.emitter.emit('updatedBoard', socket.game.nextTurn());
        });

        socket.emitter.on('loadGame', (data) => {
            socket.game.loadGame(data);
            socket.emitter.emit('updatedBoard', socket.game.nextTurn());
        });

        socket.emitter.on('AI', (setup) => {
            socket.game.resetGame();
            socket.game.aiFirst = setup.AIplays === '1';
            socket.game.ai = setup.AImodel;

            socket.game.player1 = socket.game.aiFirst ? 'AI' : 'Human'
            socket.game.player2 = socket.game.player1 === 'AI' ? 'Human' : 'AI'

            socket.emitter.emit('newGame', socket.game.nextTurn());
            if (socket.game.aiFirst && socket.game.turnNumber === 0) {
                socket.emitter.emit('updatedBoard', socket.game.nextTurn());
            }
        });

        socket.emitter.on('Casual', async (setup) => {
            const token = socket.handshake.auth.token;
            if (!token) return;

            const decoded = jwt.verify(token.replaceAll('\"', ''), process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
                if (err) return false
                return decoded
            });
            if (!decoded) return;
            socket.user = await db.collection("Users").findOne({Email: decoded.email}, {
                projection: {
                    Password: 0,
                    Tokens: 0,
                    _id: 0
                }
            });

            casualQueue.set(socket, setup);
            socket.game.clearTimer();

            // Count number of players in queue with the same setup
            if (Array.from(casualQueue.values()).filter(value => value === setup).length >= 2) {
                // Player 1 and 2
                const socket1 = getKeyFromValue(casualQueue, setup);
                casualQueue.delete(socket1);

                const socket2 = getKeyFromValue(casualQueue, setup);
                casualQueue.delete(socket2);

                // Add players to room
                socket1.join(setup);
                socket2.join(setup);

                socket.game.resetGame();
                socket.game.player1 = socket1.user
                socket.game.player2 = socket2.user

                // Update emitter and game for each player
                socket1.emitter = gameSocket.to(setup);
                socket2.emitter = gameSocket.to(setup);
                socket1.game = socket.game;
                socket2.game = socket.game;
                socket.game.io = socket.emitter;

                // Emit events to players in the room
                socket.game.randomTurn();
                socket.emitter.emit('newGame', socket.game.nextTurn());
            } else {
                socket.emitter.emit('Waiting');
            }
        });

        socket.emitter.on('disconnect', () => {
            rankedQueue = rankedQueue.filter(player => player.id !== socket.id);
            casualQueue.delete(socket);
        });

        socket.emitter.on('sendMessage', (username, message) => {
            socket.emitter.emit('receiveMessage', {
                Username: username,
                Message: message
            });
        });
    });
};

module.exports = gameSocket;