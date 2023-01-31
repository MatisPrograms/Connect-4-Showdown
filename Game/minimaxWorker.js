self.addEventListener('message', (event) => {
    aiPlayer = event.data.player;
    aiOpponent = event.data.aiOpponent;
    self.postMessage(minimax(event.data.board, 7, event.data.player, -Infinity, Infinity));
});

let aiPlayer;
let aiOpponent;

function checkDraw(board) {
    for (let i = 0; i < 7; i++) {
        if (board[i][5] === '') return false;
    }
    return true;
}

function checkWinner(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const winner = checkWinnerFromCell(board, i, j);
            if (winner.player !== "" && winner.cells.length > 0) return true
        }
    }
    return false;
}

function checkWinnerFromCell(board, row, col) {
    let winner = {
        player: '',
        cells: [],
    };
    let directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let count = 0;
    let currPlayer = board[row][col];

    for (let i = 0; i < directions.length; i++) {
        count = 1;
        let r = row + directions[i][0];
        let c = col + directions[i][1];
        let cells = [[row, col]];

        while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === currPlayer) {
            count++;
            cells.push([r, c]);
            r += directions[i][0];
            c += directions[i][1];
        }

        r = row - directions[i][0];
        c = col - directions[i][1];
        while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === currPlayer) {
            count++;
            cells.push([r, c]);
            r -= directions[i][0];
            c -= directions[i][1];
        }
        if (count >= 4) {
            winner.player = currPlayer;
            winner.cells = cells;
            return winner;
        }
    }
    return winner;
}

function evaluateBoard(board) {
    let score = {aiPlayer: 0, aiOpponent: 0};

    let streaks = {aiPlayer: [], aiOpponent: []};
    for (let row = 0; row < board.length; row++) {
        let verticalStreak = {aiPlayer: 0, aiOpponent: 0};
        let maxVerticalStreak = {aiPlayer: 0, aiOpponent: 0};
        for (let cell = 0; cell < board[0].length; cell++) {
            if (board[row][cell] === aiPlayer) {
                verticalStreak.aiPlayer++;
                maxVerticalStreak.aiPlayer = Math.max(maxVerticalStreak.aiPlayer, verticalStreak.aiPlayer);
                verticalStreak.aiOpponent = 0;
                maxVerticalStreak.aiOpponent = 0;
            }
            if (board[row][cell] === aiOpponent) {
                verticalStreak.aiOpponent++;
                maxVerticalStreak.aiOpponent = Math.max(maxVerticalStreak.aiOpponent, verticalStreak.aiOpponent);
                verticalStreak.aiPlayer = 0;
                maxVerticalStreak.aiPlayer = 0;
            }
        }
        if (board[row][board[0].length - 1] !== "") {
            maxVerticalStreak.aiPlayer = 0;
            maxVerticalStreak.aiOpponent = 0;
        }
        streaks.aiPlayer.push(maxVerticalStreak.aiPlayer);
        streaks.aiOpponent.push(maxVerticalStreak.aiOpponent);
    }

    for (let col = 0; col < board[0].length; col++) {

        // Left to right
        let horizontalStreakLeft = {aiPlayer: 0, aiOpponent: 0};
        let maxHorizontalStreakLeft = {aiPlayer: 0, aiOpponent: 0};
        for (let cell = 0; cell < board.length; cell++) {
            if (board[cell][col] === aiPlayer) {
                horizontalStreakLeft.aiPlayer++;
                maxHorizontalStreakLeft.aiPlayer = Math.max(maxHorizontalStreakLeft.aiPlayer, horizontalStreakLeft.aiPlayer);
                horizontalStreakLeft.aiOpponent = 0;
                maxHorizontalStreakLeft.aiOpponent = 0;
            }
            if (board[cell][col] === aiOpponent) {
                horizontalStreakLeft.aiOpponent++;
                maxHorizontalStreakLeft.aiOpponent = Math.max(maxHorizontalStreakLeft.aiOpponent, horizontalStreakLeft.aiOpponent);
                horizontalStreakLeft.aiPlayer = 0;
                maxHorizontalStreakLeft.aiPlayer = 0;
            }
        }
        if (board[board.length - 1][col] !== "") {
            maxHorizontalStreakLeft.aiPlayer = 0;
            maxHorizontalStreakLeft.aiOpponent = 0;
        }

        // Right to left
        let horizontalStreakRight = {aiPlayer: 0, aiOpponent: 0};
        let maxHorizontalStreakRight = {aiPlayer: 0, aiOpponent: 0};
        for (let cell = board.length - 1; cell >= 0; cell--) {
            if (board[cell][col] === aiPlayer) {
                horizontalStreakRight.aiPlayer++;
                maxHorizontalStreakRight.aiPlayer = Math.max(maxHorizontalStreakRight.aiPlayer, horizontalStreakRight.aiPlayer);
                horizontalStreakRight.aiOpponent = 0;
                maxHorizontalStreakRight.aiOpponent = 0;
            }
            if (board[cell][col] === aiOpponent) {
                horizontalStreakRight.aiOpponent++;
                maxHorizontalStreakRight.aiOpponent = Math.max(maxHorizontalStreakRight.aiOpponent, horizontalStreakRight.aiOpponent);
                horizontalStreakRight.aiPlayer = 0;
                maxHorizontalStreakRight.aiPlayer = 0;
            }
        }
        if (board[0][col] !== "") {
            maxHorizontalStreakRight.aiPlayer = 0;
            maxHorizontalStreakRight.aiOpponent = 0;
        }

        streaks.aiPlayer.push(maxHorizontalStreakLeft.aiPlayer, maxHorizontalStreakRight.aiPlayer);
        streaks.aiOpponent.push(maxHorizontalStreakLeft.aiOpponent, maxHorizontalStreakRight.aiOpponent);
    }

    score.aiPlayer = streaks.aiPlayer.map(s => evaluateStreak(s, aiPlayer)).reduce((a, b) => a + b, 0);
    score.aiOpponent = streaks.aiOpponent.map(s => evaluateStreak(s, aiOpponent)).reduce((a, b) => a + b, 0);


    // console.log(verticalScore);
    // console.log(horizontalScore);
    // console.log(score);
    return score;
}

function evaluateStreak(streak, colour) {
    return (colour === aiPlayer ? 1 : -1) * (streak >= 4 ? Infinity : streak === 3 ? 10000 : streak === 2 ? 100 : streak === 1 ? 1 : 0);
}


function neighbors(board) {
    const columnsUsed = [];
    for (let j = 0; j < board[0].length; j++) {
        for (let i = 0; i < board.length; i++) {
            if (columnsUsed.length < board.length && !columnsUsed.map(e => e.x).includes(i) && board[i][j] === "") {
                columnsUsed.push({x: i, y: j});
            }
        }
    }
    return columnsUsed;
}
function minimax(board, depth, player, alpha, beta) {
    if (depth === 0 || checkWinner(board) || checkDraw(board)) return player === aiPlayer ? evaluateBoard(board).aiPlayer : evaluateBoard(board).aiOpponent;
    let bestMove;
    let bestScore = player === aiPlayer ? -Infinity : Infinity;

    for (const neighbor of neighbors(board)) {
        let newBoard = JSON.parse(JSON.stringify(board));
        newBoard[neighbor.x][neighbor.y] = player;

        let score = minimax(newBoard, depth - 1, player === aiPlayer ? aiOpponent : aiPlayer, alpha, beta);
        if (isNaN(score)) score = score.score;
        if (player === aiPlayer ? (score > bestScore) : (score < bestScore)) {
            bestScore = score;
            bestMove = [neighbor.x, neighbor.y];
        }

        if (player === aiPlayer) {
            alpha = Math.max(alpha, score);
            if (beta <= alpha) {
                break;
            }
        } else {
            beta = Math.min(beta, score);
            if (beta <= alpha) {
                break;
            }
        }
    }
    return bestMove ? {move: bestMove, score: bestScore} : bestScore;
}