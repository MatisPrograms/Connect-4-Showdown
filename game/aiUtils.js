const maxDepth = 5; // you can change this value to set the number of turns to predict
const aiPlayer = "red"; // you can change this value to set the AI player color

function evaluateBoard(board) {
    let aiPlayerCount = 0;
    let opponentCount = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === aiPlayer) {
                aiPlayerCount++;
            } else if (board[i][j] !== "") {
                opponentCount++;
            }
        }
    }
    return aiPlayerCount - opponentCount;
}

function minmax(board, depth, player, alpha, beta) {
    console.log("MinMax: " + board, depth, player, alpha, beta);
    if (depth === 0 || depth === maxDepth || checkWinner(board) || checkDraw(board)) {
        return evaluateBoard(board);
    }
    let bestScore;
    let bestMove;
    if (player === aiPlayer) {
        bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === "") {
                    let newBoard = JSON.parse(JSON.stringify(board));
                    newBoard[i][j] = player;
                    let score = minmax(newBoard, depth - 1, playerTurn(), alpha, beta);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = [i, j];
                    }
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
    } else {
        bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === "") {
                    let newBoard = JSON.parse(JSON.stringify(board));
                    newBoard[i][j] = player;
                    let score = minmax(newBoard, depth - 1, playerTurn(), alpha, beta);
                    if (score < bestScore) {
                        bestScore = score;
                        bestMove = [i, j];
                    }
                    beta = Math.min(beta, score);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
    }
    return bestMove ? {move: bestMove, score: bestScore} : bestScore;
}

function MinMaxAIMove(colour) {
    const chosenColumn = minmax(Array.from(board), 0, colour, -Infinity, Infinity).move[0];
    console.log("MinMax AI's move: Column " + chosenColumn);
    return chosenColumn;
}

function RandomAIMove() {
    const chosenColumn = Math.floor(Math.random() * board.length);
    console.log("Random AI's move: Column " + chosenColumn);
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
    console.log("Column Chosen:", chosenColumn, typeof chosenColumn);
    columnClicked(document.getElementsByClassName("column")[chosenColumn]);
    document.getElementById("ai-mode").toggleAttribute("playing");
}