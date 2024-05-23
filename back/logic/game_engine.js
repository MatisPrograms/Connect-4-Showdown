const {checkDraw, checkWinnerFromCell} = require("./board_functions");
const ai = require("./AI/ai").AI;
const players = ["1", "2"];
const db = require("../mongoDB").db;

class Game_engine {
    io;
    aiPlayer;
    aiFirst;
    mmr;

    constructor() {
        this.resetGame();
        this.ai = '';
    }

    emptyBoard() {
        return [['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', '']]
    }

    newTurn(move) {
        const x = move[0];
        let y = move[1];

        if (this.board[x][y] !== '') return;
        if (y > 0 && this.board[x][y - 1] === '') return;

        for (let i = 0; i < this.board[0].length; i++) {
            if (this.board[x][i] === '') {
                y = i;
                break;
            }
        }

        this.board[x][y] = this.turnPlayer;
        this.moves.push([x, y]);
        this.turnNumber++;

        const winner = checkWinnerFromCell(this.board, x, y);
        const draw = checkDraw(this.board);
        if (winner.player !== "" && winner.cells.length > 0) {
            this.status.finished = true;
            this.status.winner = winner.player;
            this.status.cells = winner.cells;
        } else if (draw) {
            this.status.finished = true;
            this.status.winner = "draw";
        }
        if (this.status.finished) {
            this.applyMMRChanges();
        }

        this.turnPlayer = this.turnPlayer === players[0] ? players[1] : players[0];
    }

    nextTurn() {
        if (this.ai && this.aiPlayer === this.turnPlayer && !this.status.finished) {
            ai.nextTurn(this).then(move => {
                while (this.board[move[0]][move[1]] !== '' && move[1] < 6) move[1] += 1;
                this.newTurn(move);
            }).then(() => this.io.emit('updatedBoard', {
                turnNumber: this.turnNumber,
                turnPlayer: this.turnPlayer,
                status: this.status,
                board: this.board,
                player1: this.player1,
                player2: this.player2,
                mmr: this.mmr
            })).then(() => {
                this.aiFinished = true;
            });
        }

        return {
            turnNumber: this.turnNumber,
            turnPlayer: this.turnPlayer,
            status: this.status,
            board: this.board,
            player1: this.player1,
            player2: this.player2,
            mmr: this.mmr
        };
    }

    resetGame() {
        this.turnNumber = 0;
        this.turnPlayer = players[0];
        this.status = {finished: false};
        this.board = this.emptyBoard();
        this.moves = [];
        this.mmr = 0;
        this.aiFinished = true;

        this.player1 = "Player 1";
        this.player2 = "Player 2";
        if (this.aiFirst) this.aiPlayer = this.turnPlayer;
        else this.aiPlayer = this.turnPlayer === players[0] ? players[1] : players[0];

        this.clearTimer();
        this.timerCalculator();
    }

    loadGame(game) {
        this.resetGame();
        this.turnNumber = game.TurnNumber;
        this.turnPlayer = game.TurnPlayer;
        this.board = game.Board;

        this.player1 = game.Player1;
        this.player2 = game.Player2;
    }

    isColumnAvailable(number) {
        return this.board[number][this.board[number].length - 1] === "";
    }

    columnsAvailable() {
        const columns = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.isColumnAvailable(i)) columns.push(i);
        }
        return columns;
    }

    player() {
        return this.turnPlayer === players[0] ? players[0] : players[1];
    }

    opponent() {
        return this.turnPlayer === players[0] ? players[1] : players[0];
    }

    randomTurn() {
        this.turnPlayer = Math.random() < 0.5 ? players[0] : players[1];
    }

    timerCalculator() {
        const totalTime = 300;
        const turnTime = 30;

        const timeData = {
            totalTime: totalTime,
            player1: turnTime,
            player2: turnTime
        }

        this.timer = setInterval(() => {
            if (!this.timer || this.status.finished || timeData.totalTime <= 0 || timeData.player1 <= 0 || timeData.player2 <= 0) {
                this.status.finished = true;
                if (timeData.player1 <= 0) {
                    this.status.winner = "2"
                } else if (timeData.player2 <= 0) {
                    this.status.winner = "1"
                }
                if (timeData.totalTime <= 0) {
                    this.status.winner = "draw";
                }

                this.applyMMRChanges();

                this.io.emit('updatedBoard', this.nextTurn());
                clearInterval(this.timer);
            } else {
                timeData.totalTime -= 1;
                if (!this.aiFinished) {
                    if (this.turnPlayer === '1') {
                        timeData.player1 -= 1;
                        timeData.player2 = turnTime;
                    } else {
                        timeData.player1 = turnTime;
                        timeData.player2 -= 1;
                    }
                } else {
                    timeData.player1 = turnTime;
                    timeData.player2 = turnTime;
                    this.aiFinished = false;
                }
            }
            this.io.emit('timer', timeData);
        }, 1000);
    }

    applyMMRChanges() {
        if (this.status.finished && this.player1 && this.player1.Username && this.player2 && this.player2.Username) {
            const winner = this.status.winner === players[0] ? this.player1 : this.player2;
            const loser = this.status.winner === players[0] ? this.player2 : this.player1;

            db.collection("Users").updateOne({Username: winner.Username}, {$inc: {MMR: this.mmr}}).then((user) => {
                db.collection("Users").updateOne({Username: winner.Username}, {$set: {MMR: Math.max(0, winner.MMR + this.mmr)}})
            });

            db.collection("Users").updateOne({Username: loser.Username}, {$inc: {MMR: -this.mmr}}).then(() => {
                db.collection("Users").updateOne({Username: loser.Username}, {$set: {MMR: Math.max(0, loser.MMR - this.mmr)}})
            });
        }
    }

    clearTimer() {
        if (this.timer) clearInterval(this.timer);
    }
}

module.exports = {Game: Game_engine}