const router = require('../queryManagers/routes.js');
const fs = require("fs");
const db = require('../mongoDB.js').db;
const baseFrontPath = require('../queryManagers/front.js').path;

async function getRank(mmr) {
    if (typeof mmr !== 'number') return { rank: 'Unranked', division: 'Unranked' };
    const rank = (await db.collection('Ranks').find({ "Divisions.MMR": { $lte: mmr } }).sort({ "Divisions.MMR": -1 }).limit(1).toArray((err, rank) => err ? [] : rank))[0];
    for (const division of rank.Divisions.reverse()) {
        if (division.MMR <= mmr) {
            return { Rank: rank.Rank, Division: division.Division };
        }
    }
}

async function getLeaderboard() {
    const users = await db.collection('Users').find({}, {
        projection: {
            _id: 0,
            Username: 1,
            MMR: 1,
            LastConnection: 1
        }
    }).sort({ MMR: -1 }).limit(100).toArray((err, users) => err ? [] : users);
    for (const user of users) {
        user.Rank = await getRank(user.MMR);
    }
    return users;
}

router.GET('/ranks', async (req, res) => {
    const ranks = await db.collection('Ranks').find().toArray((err, ranks) => err ? [] : ranks);
    if (ranks) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ Ranks: ranks }));
    } else {
        res.statusCode = 500;
        return res.end("Database error");
    }
});

router.POST('/rank', (req, res) => {
    router.json(req).then(async data => {
        const rank = await getRank(data.mmr);
        if (rank) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(rank));
        } else {
            res.statusCode = 500;
            return res.end("Database error");
        }
    });
});

router.GET('/leaderboard', async (req, res) => {
    const leaderboard = await getLeaderboard();
    if (leaderboard) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ Leaderboard: leaderboard }));
    } else {
        res.statusCode = 500;
        return res.end("Database error");
    }
});
router.GET('/statgame', async (req, res) => {

    let paramusername;
    // Récupérer le nom d'utilisateur depuis les paramètres de l'URL
    // Get parameters from the url
    const urlParams = req.url.split('?')[1];
    if (urlParams) {
        const params = new Map(urlParams.split('&').map(p => p.split('=')));
        data = params.get('username');

    }
    // Vérifier si l'utilisateur existe dans la base de données
    const games = await db.collection("Games").find({ $or: [{ Player1: data }, { Player2: data }] }).sort({ Timestamp: 1 }).toArray();

    if (!games) {
        // Si l'utilisateur n'existe pas, renvoyer une erreur 404
        res.statusCode = 500;
        return res.end("Database error");
    }
    res.statusCode = 200;
    // Si l'utilisateur existe, renvoie le user afin de afficher les info coté client
    res.setHeader('Content-Type', 'application/json');
    console.log(games);
    return res.end(JSON.stringify(games));

}, false);
router.POST('/save', (req, res) => {
    router.json(req).then(async data => {
        // Check if game is already saved
        const savedGame = await db.collection("SavedGames").findOne({
            $or: [
                {
                    Player1: data.player1,
                    Player2: data.player2
                },
                {
                    Player1: data.player2,
                    Player2: data.player1
                }
            ]
        }).then(savedGame => savedGame);
        if (savedGame) {
            db.collection("SavedGames").updateOne({
                $or: [
                    {
                        Player1: data.player1,
                        Player2: data.player2
                    },
                    {
                        Player1: data.player2,
                        Player2: data.player1
                    }
                ]
            }, {
                $set: {
                    Player1: data.player1,
                    Player2: data.player2,
                    TurnPlayer: data.turnPlayer,
                    Board: data.board,
                    Timestamp: new Date()
                }
            }
            ).then(() => {
                res.statusCode = 200;
                return res.end("Game saved");
            }).catch(e => {
                console.log(e);
                res.statusCode = 500;
                return res.end("Database error");
            });
        } else {
            db.collection("SavedGames").insertOne({
                Player1: data.player1,
                Player2: data.player2,
                TurnPlayer: data.turnPlayer,
                Board: data.board,
                Timestamp: new Date()
            }).then(() => {
                res.statusCode = 200;
                return res.end("Game saved");
            }).catch(e => {
                console.log(e);
                res.statusCode = 500;
                return res.end("Database error");
            });
        }
    });
}, true);

router.POST('/load', (req, res) => {
    router.json(req).then(async data => {
        const savedGame = await db.collection("SavedGames").findOne({
            $or: [
                {
                    Player1: data.player1,
                    Player2: data.player2
                },
                {
                    Player1: data.player2,
                    Player2: data.player1
                }
            ]
        }).then(savedGame => savedGame);
        if (savedGame) {
            let count = 0;
            for (const row of savedGame.Board) {
                for (const cell of row) {
                    if (cell !== '') count++;
                }
            }
            savedGame.TurnNumber = count;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ savedGame: savedGame }));
        } else {
            res.statusCode = 404;
            return res.end("No saved game found");
        }
    });
});

router.DELETE('/save', (req, res) => {
    router.json(req).then(async data => {
        db.collection("SavedGames").deleteOne({
            $or: [
                {
                    Player1: data.player1,
                    Player2: data.player2
                },
                {
                    Player1: data.player2,
                    Player2: data.player1
                }
            ]
        }).then(() => {
            res.statusCode = 200;
            return res.end("Game deleted");
        }).catch(e => {
            console.log(e);
            res.statusCode = 500;
            return res.end("Database error");
        });
    });
}, true);

router.POST('/store', (req, res) => {
    router.json(req).then(async data => {
        db.collection("Games").insertOne({
            Player1: data.player1,
            Player2: data.player2,
            Winner: data.winner,
            Board: data.board,
            TurnNumber: data.turnNumber,
            Moves: data.moves,
            Timestamp: new Date()
        }).then(() => {
            res.statusCode = 200;
            return res.end("Game stored");
        }).catch(e => {
            console.log(e);
            res.statusCode = 500;
            return res.end("Database error");
        });
    });
});

const solverCache = new Map();
db.collection('AI').find().forEach((doc) => {
    solverCache.set(doc.Moves, doc.Score);
}).then(() => console.log(`Loaded ${solverCache.size} AI moves`));

router.POST('/solve', (req, res) => {
    router.json(req).then(async data => {
        const moves = data.moves;
        if (!solverCache.has(moves)) {
            console.log('Move not found in cache, fetching from API...')
            const newScore = await fetch('https://connect4.gamesolver.org/solve?pos=' + moves, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            }).then(data => {
                data.score = data.score.map((score) => score > 20 ? -20 : score);
                db.collection('AI').insertOne({ Moves: moves, Score: data.score });
                return data.score;
            });
            solverCache.set(moves, newScore);
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({ score: solverCache.get(moves) }));
    });
});

router.GET('/playlist', async (req, res) => {
    let playlistName = '';
    const playlistPath = `.${baseFrontPath}/Assets/Music/`;

    // Get parameters from the url
    const urlParams = req.url.split('?')[1];
    if (urlParams) {
        const params = new Map(urlParams.split('&').map(p => p.split('=')));
        playlistName = params.get('name');
    }

    // If no playlist name is given, we will return the list of playlists.
    if (!playlistName) {
        // Get the list of files in the directory.
        const files = fs.readdirSync(playlistPath);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ playlists: files }));
    }

    // If it is a directory, we will return the default file.
    if (fs.statSync(playlistPath + playlistName).isDirectory()) {
        // Get the list of files in the directory.
        const files = fs.readdirSync(playlistPath + playlistName);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ songs: files }));
    } else {
        res.statusCode = 404;
        return res.end("Playlist not found");
    }
});

module.exports = getLeaderboard;