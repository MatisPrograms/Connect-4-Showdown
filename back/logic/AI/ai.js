let {miniMax} = require("./miniMax");
const monteCarlo = new (require('./monteCarlo'))(1);
const {hybrid} = require("./hybrid");
const db = require('../../mongoDB.js').db;

class AI {

    static nextTurn(game) {
        this.game = game;
        return new Promise((resolve) => {
            if (game.ai === 'hybrid') resolve(this.HybridAIMove(game));
            if (game.ai === 'solver') resolve(this.SolverAIMove(game));
            if (game.ai === 'minimax') resolve(this.MiniMaxAIMove(game));
            if (game.ai === 'monte-carlo') resolve(this.MonteCarloAIMove(game));
            if (game.ai === 'random') resolve(this.RandomAIMove(game));
        });
    }


    static async HybridAIMove(game) {
        return hybrid(game);
    }

    static async SolverAIMove(game) {
        function maxIndex(array) {
            for (let i = 0; i < array.length; i++) {
                if (!game.columnsAvailable().includes(i)) array[i] = -20;
            }
            return array.reduce((maxIndex, currentValue, currentIndex) => currentValue > array[maxIndex] ? currentIndex : maxIndex, 0);
        }

        const moves = game.moves.map((move) => move[0] + 1).join('');
        const storedScore = await db.collection('AI').findOne({Moves: moves});
        if (storedScore) {
            return [maxIndex(storedScore.Score), 0];
        } else {
            const newScore = await fetch('https://connect4.gamesolver.org/solve?pos=' + moves, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            }).then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            }).then(data => {
                data.score = data.score.map((score) => score > 20 ? -20 : score);
                db.collection('AI').insertOne({Moves: moves, Score: data.score});
                return data.score;
            });
            return [maxIndex(newScore), 0];
        }
    }

    static async MiniMaxAIMove(game) {
        const minimax = miniMax(game.aiPlayer, game.aiPlayer === "1" ? "2" : "1");
        return minimax(game.board, 1, game.aiPlayer, -Infinity, Infinity).move;
    }

    static async MonteCarloAIMove(game) {
        return [monteCarlo.calculateNextMove(JSON.parse(JSON.stringify(game.board)), game.aiPlayer), 0];
    }

    static async RandomAIMove(game) {
        const availableColumns = game.columnsAvailable();
        const chosenColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        return [chosenColumn, 0];
    }
}

module.exports = {AI};