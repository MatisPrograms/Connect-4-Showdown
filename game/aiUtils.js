let aiPlayer;
let maxIterations = 1000;

function evaluateBoard(board) {
    let aiPlayerThreats = 0;
    let opponentThreats = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === aiPlayer) {
                aiPlayerThreats += checkThreats(board, i, j, aiPlayer);
            } else if (board[i][j] !== "") {
                opponentThreats += checkThreats(board, i, j, board[i][j]);
            }
        }
    }
    console.log(aiPlayerThreats - opponentThreats);
    return aiPlayerThreats - opponentThreats;
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
    player = shortLabel(player);
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
    aiPlayer = shortLabel(colour);
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