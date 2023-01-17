const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
switch (mode) {
    case '1v1':
        break;
    case 'AI':
        window.onload = function () {
            document.getElementById("ai-modes").style.display = "block";
        };
        break;
    case 'Online':
        break;
    default:
        window.location.href = '../homepage/home.html';
}

function isDraw(board) {
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
            if (board[i][j] === '') {
                return false;
            }
        }
    }
    return true;
}
function getCoord(cases){
    return cases.id[0]+":"+cases.id[1];

}

function checkWinBoard(board) {
    const cells = [];

    // Check Vertical
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
            let count = 0;
            let color = board[i][j];
            let verticalCells = [];
            if (color !== '') {
                for (let k = j; k < 6; k++) {
                    if (board[i][k] === color) {
                        count++;
                        verticalCells.push({x: i, y: k});
                        if (count === 4) {
                            cells.push(...verticalCells);
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
    }

    // Check Horizontal
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
            let count = 0;
            let color = board[i][j];
            let horizontalCells = [];
            if (color !== '') {
                for (let k = i; k < 7; k++) {
                    if (board[k][j] === color) {
                        count++;
                        horizontalCells.push({x: k, y: j});
                        if (count === 4) {
                            cells.push(...horizontalCells);
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
    }

    // Check Diagonal (Top Left to Bottom Right)
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
            let count = 0;
            let color = board[i][j];
            let diagonalCells1 = [];
            if (color !== '') {
                let k = i;
                let l = j;
                while (k < 7 && l < 6) {
                    if (board[k][l] === color) {
                        count++;
                        diagonalCells1.push({x: k, y: l});
                        if (count === 4) {
                            cells.push(...diagonalCells1);
                            break;
                        }
                    } else {
                        break;
                    }
                    k++;
                    l++;
                }
            }
        }
    }

    // Check Diagonal (Top Right to Bottom Left)
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
            let count = 0;
            let color = board[i][j];
            let diagonalCells2 = [];
            if (color !== '') {
                let k = i;
                let l = j;
                while (k >= 0 && l < 6) {
                    if (board[k][l] === color) {
                        count++;
                        diagonalCells2.push({x: k, y: l});
                        if (count === 4) {
                            cells.push(...diagonalCells2);
                            break;
                        }
                    } else {
                        break;
                    }
                    k--;
                    l++;
                }
            }
        }
    }

    if (cells.length > 0) {
        return board[cells[0].x][cells[0].y];
    } else if (isDraw(board)) {
        return 'draw';
    } else {
        return '';
    }
}

function boardToKey(board) {
    // Initialize an empty string to store the key
    let key = '';
    // Iterate over the rows of the board
    for (let i = 0; i < board.length; i++) {
        // Iterate over the cells in the current row
        for (let j = 0; j < board[i].length; j++) {
            // Append the value of the current cell to the key string
            key += board[i][j];
        }
    }
    // Return the generated key
    return key;
}


const MAX_TURNS = 5; // maximum number of turns
let AI_COLOR = 'red'; // color of the AI player
const transpositionTable = new Map(); // transposition table to store previously calculated game states

function minmax(board, depth, alpha, beta, isMaximizing, color) {
    // check if the game is a draw or if the maximum number of turns has been reached
    if (isDraw(board) || depth === MAX_TURNS) {
        return 0;
    }

    // check if the current state is already in the transposition table
    const key = boardToKey(board);
    if (transpositionTable.has(key)) {
        return transpositionTable.get(key);
    }

    // check if the current player has won
    if (checkWinBoard(board, color)) {
        return (color === AI_COLOR) ? 10 - depth : depth - 10;
    }

    let bestScore = (isMaximizing) ? -Infinity : Infinity;
    for (let column = 0; column < 7; column++) {
        // check if the column is full
        if (board[column][5] !== null) {
            continue;
        }

        // make the move
        let row = 0;
        while (board[column][row] !== null) {
            row++;
        }
        board[column][row] = color;

        // calculate the score of the move
        let score = minmax(board, depth + 1, alpha, beta, !isMaximizing, (color === 'red') ? 'yellow' : 'red');

        // undo the move
        board[column][row] = null;

        // update bestScore and alpha/beta values
        if (isMaximizing) {
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);
        } else {
            bestScore = Math.min(bestScore, score);
            beta = Math.min(beta, bestScore);
        }

        // check for alpha-beta pruning
        if (beta <= alpha) {
            break;
        }
    }

    // add the best score of the current state to the transposition table
    transpositionTable.set(key, bestScore);

    return bestScore;
}

function getBestMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;
    for (let column = 0; column < 7; column++) {
        // check if the column is full
        if (board[column][5] !== null) {
            continue;
        }

        // make the move
        let row = 0;
        while (board[column][row] !== null) {
            row++;
        }
        board[column][row] = AI_COLOR;

        // calculate the score of the move
        let score = minmax(board, 0, -Infinity, Infinity, false, (AI_COLOR === 'red') ? 'yellow' : 'red');

        // undo the move
        board[column][row] = null;

        // update bestScore and bestMove if necessary
        if (score > bestScore) {
            bestScore = score;
            bestMove = column;
        }
    }
    return bestMove;
}

function BestAIMove(colour) {
    AI_COLOR = colour;

    let board = [['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', '']];

    const columns = document.getElementsByClassName("column");
    for (let i = 0; i < columns.length; i++) {
        const cells = columns[i].querySelectorAll(".cell");
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.classList.contains('red')) {
                board[columns.length - i - 1][cells.length - j - 1] = 'red';
            } else if (cell.classList.contains('yellow')) {
                board[columns.length - i - 1][cells.length - j - 1] = 'yellow';
            }
        }
    }

    const move = getBestMove(board);
    if (move == null) return RandomAIMove();
    console.log(move);
    console.log(board);
    console.log("Minmax AI's move: Column" + move);
    columnClicked(move);
}

function RandomAIMove() {
    const columns = Array.from(document.getElementsByClassName("column"));
    const randomColumn = Math.floor(Math.random() * columns.length);
    console.log("Random AI's move: Column " + randomColumn);
    columnClicked(columns[randomColumn]);
}

function AIMove(colour) {
    setTimeout(function () {
        document.getElementById("ai-toggle").toggleAttribute("playing");
        switch (document.getElementById("ai-mode").value) {
            case "random" :
                RandomAIMove();
                break;
            case "minmax" :
                BestAIMove(colour);
                break;
            default:
                break;
        }
        document.getElementById("ai-toggle").toggleAttribute("playing");
    }, 500);

}

function togglePlayer() {
    const p1 = document.getElementById('player-1');
    const p2 = document.getElementById('player-2');
    if (p1.style.display === 'none' && p2.style.display !== 'none') {
        p1.style.display = '';
        p2.style.display = 'none';
    } else if (p2.style.display === 'none' && p1.style.display !== 'none') {
        p1.style.display = 'none';
        p2.style.display = '';
    }
}

function playersTurn() {
    const p1 = document.getElementById('player-1');
    const p2 = document.getElementById('player-2');
    if (p1.style.display === 'none' && p2.style.display !== 'none') {
        return 'yellow';
    } else if (p2.style.display === 'none' && p1.style.display !== 'none') {
        return 'red';
    }
}

function drawVictory(cells) {
    disableColumnClicked();
    document.getElementById('player-info').innerText = 'Player ' + playersTurn() + ' wins!';
    document.getElementById('player-1').style.display = 'none';
    document.getElementById('player-2').style.display = 'none';

    cells.forEach(cell => {
        cell.classList.add("green")
    });
}

function checkWin(cell, colour) {
    const cells = [];

    // Check Vertical
    const verticalCells = [];
    let row = cell.parentNode;
    let count = 0;
    for (let cell of row.querySelectorAll('.cell')) {
        if (cell != null && cell.classList.contains(colour)) {
            count++;
            verticalCells.push(cell);
            if (count === 4) {
                break;
            }
        } else {
            count = 0;
            verticalCells.length = 0;
        }
    }
    if (verticalCells.length >= 4) {
        cells.push(...verticalCells);
    }

    // Check Horizontal
    const horizontalCells = [];
    let column = cell.cellIndex;
    count = 0;
    for (let row of cell.parentNode.parentNode.querySelectorAll('.column')) {
        const cell = row.querySelectorAll('.cell')[column];
        if (cell != null && cell.classList.contains(colour)) {
            count++;
            horizontalCells.push(cell);
            if (count === 4) {
                break;
            }
        } else {
            count = 0;
            horizontalCells.length = 0;
        }
    }
    if (horizontalCells.length >= 4) {
        cells.push(...horizontalCells);
    }

    // Check Diagonal (Top Right to Bottom Left)
    const diagonal1Cells = [];
    row = cell.parentNode.rowIndex;
    column = cell.cellIndex;
    count = 0;
    while (row > 0 && column > 0) {
        row--;
        column--;
    }
    while (row < 6 && column < 7) {
        const cell = document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${column + 1})`);
        if (cell != null && cell.classList.contains(colour)) {
            count++;
            diagonal1Cells.push(cell);
            if (count === 4) {
                break;
            }
        } else {
            count = 0;
            diagonal1Cells.length = 0;
        }
        row++;
        column++;
    }
    if (diagonal1Cells.length >= 4) {
        cells.push(...diagonal1Cells);
    }

    // Check Diagonal (Bottom Right to Top Left)
    const diagonal2Cells = [];
    row = cell.parentNode.rowIndex;
    column = cell.cellIndex;
    count = 0;
    while (row < 5 && column > 0) {
        row++;
        column--;
    }
    while (row >= 0 && column < 7) {
        const cell = document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${column + 1})`);
        if (cell != null && cell.classList.contains(colour)) {
            count++;
            diagonal2Cells.push(cell);
            if (count === 4) {
                break;
            }
        } else {
            count = 0;
            diagonal2Cells.length = 0;
        }
        row--;
        column++;
    }
    if (diagonal2Cells.length >= 4) {
        cells.push(...diagonal2Cells);
    }


    if (cells.length > 0) {
        console.log(cells);
        drawVictory(cells);
        return colour;
    }
    return "";
}

function enableColumnClicked() {
    for (const column of document.getElementsByClassName("column")) {
        column.addEventListener("click", columnClicked);
    }
}

function disableColumnClicked() {
    for (const column of document.getElementsByClassName("column")) {
        column.removeEventListener("click", columnClicked);
    }
}

function columnClicked(event) {
    // add class red to the last empty cell in the column
    const column = event.type === "click" ? event.target.parentNode : event;
    const cells = column.querySelectorAll('.cell');
    for (let i = cells.length - 1; i >= 0; i--) {
        const cell = cells[i];
        if (!cell.classList.contains('red') && !cell.classList.contains('yellow')) {
            const colour = playersTurn();
            cell.classList.add(colour);
            checkWin(cell, colour)
            togglePlayer();
            break;
        }
    }

    if (!document.getElementById("ai-toggle").hasAttribute("playing") && document.getElementById('ai-toggle').checked) {
        AIMove(playersTurn());
    }
}

function restTable() {
    for (const cell of document.querySelectorAll('.cell')) {
        if (cell.classList.contains('red') || cell.classList.contains('yellow') || cell.classList.contains('green')) {
            cell.classList.remove('red');
            cell.classList.remove('yellow');
            cell.classList.remove('green');
        }
    }
    document.getElementById('player-1').style.display = '';
    document.getElementById('player-2').style.display = 'none';
    document.getElementById('player-info').innerText = 'Player\'s Turn';

    enableColumnClicked();
}