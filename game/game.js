let turn = 0;
const players = ["red", "yellow"];
let lastPlayed = Math.random() < 0.5 ? players[0] : players[1];
let board = newGame();

function newGame() {
    return [['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', '']]
}

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

function playCell(x, y, colour) {
    board[x][y] = colour.charAt(0).toUpperCase();
    document.getElementById(x + "" + y).classList.add(colour);

    const winner = checkWinnerFromCell(board, x, y)
    if (winner.player !== "" && winner.cells.length > 0) victory(winner.cells)
    else if (checkDraw(board)) draw();
}