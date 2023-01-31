let aiPlayer;
let aiOpponent;

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

    console.log(`Evaluating depth: ${depth} for player: ${player}`);

    for (const neighbor of neighbors(board)) {
        let newBoard = JSON.parse(JSON.stringify(board));
        newBoard[neighbor.x][neighbor.y] = player;

        let score = minimax(newBoard, depth - 1, player === players[0] ? players[1] : players[0], alpha, beta);
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

function MinMaxAIMove(colour) {
    console.log("MixMax AI's turn")
    document.getElementById("loading-circle").classList.toggle('thinking');

    aiPlayer = colour;
    aiOpponent = colour === "1" ? "2" : "1";
    const nextMove = minimax(JSON.parse(JSON.stringify(board)), 10, aiPlayer, -Infinity, Infinity);

    document.getElementById("loading-circle").classList.toggle('thinking');
    console.log("MinMax AI's move: Column", nextMove.move[0], nextMove);
    return nextMove.move[0];
}

function RandomAIMove() {
    console.log("Random AI's turn")
    document.getElementById("loading-circle").classList.toggle('thinking');

    const availableColumns = columnsAvailable();
    const chosenColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
    // Wait 0.5 seconds


    document.getElementById("loading-circle").classList.toggle('thinking');
    console.log("Random AI's move: Column", chosenColumn);
    return chosenColumn;
}

function AIMove(colour) {
    document.getElementById("ai-mode").toggleAttribute("playing");
    let chosenColumn;
    switch (document.getElementById("ai-mode").value) {
        case "minmax" :
            chosenColumn = MinMaxAIMove(colour);
            break;
        default:
            chosenColumn = RandomAIMove();
            break;
    }
    columnClicked(document.getElementsByClassName("column")[chosenColumn]);
    document.getElementById("ai-mode").toggleAttribute("playing");
}