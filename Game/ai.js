let aiPlayer;
let maxIterations = 1000;

function evaluateBoard(board) {
    let score = 0;
    let opponent = aiPlayer === "1" ? "2" : "1";

    // Iterate through the board and count the number of consecutive
    // pieces of the same color in a row, column, and diagonal
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === aiPlayer) {
                score += countThreats(board, i, j, aiPlayer);
            } else if (board[i][j] === opponent) {
                score -= countThreats(board, i, j, opponent);
            }
        }
    }
    return score;
}

function countThreats(board, x, y, player) {
    let count = 0;
    // Check horizontal threats
    count += countConsecutive(board, x, y, 0, 1, player);
    count += countConsecutive(board, x, y, 0, -1, player);
    // Check vertical threats
    count += countConsecutive(board, x, y, 1, 0, player);
    // Check diagonal threats
    count += countConsecutive(board, x, y, 1, 1, player);
    count += countConsecutive(board, x, y, 1, -1, player);
    return count;
}

function countConsecutive(board, x, y, dx, dy, player) {
    let count = 0;
    let i = x + dx;
    let j = y + dy;
    while (i >= 0 && i < board.length && j >= 0 && j < board[i].length && board[i][j] === player) {
        count++;
        i += dx;
        j += dy;
    }
    return count;
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
    if (maxIterations-- < 0 || depth === 0 || checkWinner(board) || checkDraw(board)) return evaluateBoard(board);
    const nextPlayer = player === players[0] ? players[1] : players[0];
    let bestMove;
    let bestScore = player === aiPlayer ? -Infinity : Infinity;

    for (const neighbor of neighbors(board)) {
        let newBoard = JSON.parse(JSON.stringify(board));
        newBoard[neighbor.x][neighbor.y] = player;

        let score = minimax(newBoard, depth - 1, nextPlayer, alpha, beta);
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
    aiPlayer = colour;
    const nextMove = minimax(JSON.parse(JSON.stringify(board)), 20, colour, -Infinity, Infinity);
    if (!isNaN(nextMove)) return RandomAIMove();
    const chosenColumn = nextMove.move[0];
    console.log("MinMax AI's move: Column", chosenColumn);
    return chosenColumn;
}

function RandomAIMove() {
    const availableColumns = columnsAvailable();
    const chosenColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];
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