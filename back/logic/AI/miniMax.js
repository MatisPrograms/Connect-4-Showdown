const {checkDraw, checkWinner, neighbors} = require("../board_functions");

let aiPlayer;
let aiOpponent;
const transpositionTable = new Map();
const transpositionTableScores = new Map();

function evaluateBoard(board) {
    const evaluateStreak = (streak) => streak >= 4 ? Infinity : streak === 3 ? 10000 : streak === 2 ? 100 : streak === 1 ? 1 : 0;
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    const max_pieces = 21;

    const pieces = {player1: 0, player2: 0};
    const streaks = {player1: [], player2: []};

    for (let y = 0; y < board[0].length; y++) {
        for (let x = 0; x < board.length; x++) {
            if (board[x][y] === "") continue;

            if (board[x][y] === "1") pieces.player1++;
            else pieces.player2++;

            for (let i = 0; i < directions.length; i++) {
                const [dx, dy] = directions[i];
                let streak = 1;

                for (let j = 1; j < 4; j++) {
                    const nx = x + j * dx;
                    const ny = y + j * dy;

                    if (j === 1 && (nx < 0 || nx >= board.length || ny < 0 || ny >= board[0].length)) {
                        streak = 0;
                        break;
                    }

                    if (nx < 0 || nx >= board.length || ny < 0 || ny >= board[0].length || board[nx][ny] === "") continue;

                    if (board[nx][ny] !== board[x][y]) {
                        streak = 0;
                        break;
                    }

                    streak++;
                }

                if (board[x][y] === "1") streaks.player1.push(evaluateStreak(streak));
                else streaks.player2.push(evaluateStreak(streak));
            }
        }
    }

    const horizontalPlacement = {
        0: 0, 1: 1, 2: 2, 3: 3
    }

    const verticalPlacement = {
        0: 0, 1: 1, 2: 2
    }

    const placementScore = {player1: 0, player2: 0};
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
            if (board[row][col] === "") continue;
            if (board[row][col] === "1") placementScore.player1 += horizontalPlacement[row < 4 ? row : 6 - row] + verticalPlacement[col < 3 ? col : 5 - col];
            if (board[row][col] === "2") placementScore.player2 += horizontalPlacement[row < 4 ? row : 6 - row] + verticalPlacement[col < 3 ? col : 5 - col];
        }
    }

    const piecesScore = {player1: 0, player2: 0};
    piecesScore.player1 = (max_pieces - pieces.player1) * 10;
    piecesScore.player2 = (max_pieces - pieces.player2) * 10;

    return {
        player1: streaks.player1.reduce((acc, val) => acc + val, placementScore.player1 + piecesScore.player1),
        player2: streaks.player2.reduce((acc, val) => acc + val, placementScore.player2 + piecesScore.player2)
    };
}

function evaluateRecursive(board, player) {
    // Check if the game is over
    if (isGameOver(board)) {
        if (isWinner(board, player)) {
            // Current player wins
            return 22 - countStones(board, player);
        } else if (isWinner(board, getOpponent(player))) {
            // Opponent wins
            return countStones(board, getOpponent(player)) - 22;
        } else {
            // Draw game
            return 0;
        }
    }

    // The game is not over yet, so we need to evaluate the board position
    let score = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === '') {
                // Try playing a stone in this position
                board[i][j] = player;

                const key = JSON.stringify(board);
                if (!transpositionTableScores.has(key)) transpositionTableScores.set(key, evaluateRecursive(board, getOpponent(player)));
                const result = transpositionTableScores.get(key);
                console.log(result)

                // Update the score based on the result
                if (result > 0) {
                    score = Math.max(score, result - 1);
                } else if (result < 0) {
                    score = Math.min(score, result + 1);
                }

                // Undo the move
                board[i][j] = '';
            }
        }
    }

    return score;
}

// Helper function to count the number of stones played by a player
function countStones(board, player) {
    let count = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === player) {
                count++;
            }
        }
    }
    return count;
}

// Helper function to get the opponent of a player
function getOpponent(player) {
    return player === '1' ? '2' : '1';
}

// Helper function to check if the game is over
function isGameOver(board) {
    return isWinner(board, '1') || isWinner(board, '2') || isBoardFull(board);
}

// Helper function to check if the board is full
function isBoardFull(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === '') {
                return false;
            }
        }
    }
    return true;
}

// Helper function to check if a player has won the game
function isWinner(board, player) {
    // Check rows
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j <= board[i].length - 4; j++) {
            if (board[i][j] === player &&
                board[i][j + 1] === player &&
                board[i][j + 2] === player &&
                board[i][j + 3] === player) {
                return true;
            }
        }
    }

    // Check columns
    for (let i = 0; i <= board.length - 4; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === player &&
                board[i + 1][j] === player &&
                board[i + 2][j] === player &&
                board[i + 3][j] === player) {
                return true;
            }
        }
    }

    // Check diagonals
    for (let i = 0; i <= board.length - 4; i++) {
        for (let j = 0; j <= board[i].length - 4; j++) {
            if (board[i][j] === player &&
                board[i + 1][j + 1] === player &&
                board[i + 2][j + 2] === player &&
                board[i + 3][j + 3] === player) {
                return true;
            }
        }
    }

    // Check anti-diagonals
    for (let i = 0; i <= board.length - 4; i++) {
        for (let j = 3; j < board[i].length; j++) {
            if (board[i][j] === player &&
                board[i + 1][j - 1] === player &&
                board[i + 2][j - 2] === player &&
                board[i + 3][j - 3] === player) {
                return true;
            }
        }
    }

    return false;
}


function minimax(board, depth, player, alpha, beta) {
    const key = JSON.stringify(board);
    if (transpositionTable.has(key)) return transpositionTable.get(key);

    if (checkWinner(board)) {
        // const score = (isWinner(board, player) ? 1 : -1) * (22 - countStones(board, player));
        const score = -(42 - countStones(board, player) - countStones(board, getOpponent(player))) / 2;
        transpositionTable.set(key, score);
        return score;
    }
    if (checkDraw(board)) {
        transpositionTable.set(key, 0);
        return 0;
    }

    let bestMove;
    let bestScore = player === aiPlayer ? -Infinity : Infinity;

    for (const neighbor of neighbors(board)) {
        let newBoard = JSON.parse(JSON.stringify(board));
        newBoard[neighbor.x][neighbor.y] = player;

        const score = minimax(newBoard, depth - 1, player === aiPlayer ? aiOpponent : aiPlayer, alpha, beta);

        if (player === aiPlayer ? (score > bestScore) : (score < bestScore)) {
            bestScore = score;
            bestMove = [neighbor.x, neighbor.y];
        }
        player === aiPlayer ? alpha = Math.max(alpha, score) : beta = Math.min(beta, score);
        if (beta <= alpha) break;
    }
    const result = bestMove ? {move: bestMove, score: bestScore} : bestScore;
    transpositionTable.set(key, result);
    return result;
}

miniMax = (player1, player2) => {
    aiPlayer = player1;
    aiOpponent = player2;
    // setInterval(() => {
    //     const {heapUsed, heapTotal} = process.memoryUsage();
    //     console.log(`Heap used: ${(heapUsed / heapTotal * 100).toFixed(1)}%`, (heapTotal / 1024 / 1024).toFixed(1), "MB");
    // }, 1000);
    return minimax;
}

module.exports = {miniMax};