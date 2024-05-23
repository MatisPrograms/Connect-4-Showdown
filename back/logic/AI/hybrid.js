const {checkWinnerFromCell, neighbors} = require('../board_functions.js');
const {countStreakFromCell} = require("../board_functions");
function bestColumn(columns) {
    const columnWeights = {0: 1, 1: 2, 2: 3, 3: 4, 4: 3, 5: 2, 6: 1};
    return columns.reduce((best, column) => {
        if (columnWeights[column] > columnWeights[best]) {
            return column;
        }
        return best;
    });
}

function assesMove(board, player, x, y) {
    board[x][y] = player;
    return checkWinnerFromCell(board, x, y).player === player ? [x, y] : null;
}

hybrid1 = (game, randomFunction) => randomFunction(game);

function hybrid(game) {

    // Check threats
    let whiteList = [];
    const blackList = [];
    for (const neighbor of neighbors(game.board)) {
        const x = neighbor.x;
        const y = neighbor.y;
        const newBoard = JSON.parse(JSON.stringify(game.board));


        // Check if we can win with this move
        const winMove = assesMove(newBoard, game.player(), x, y);
        if (winMove) return winMove;

        // Check if we can block the opponent
        const blockMove = assesMove(newBoard, game.opponent(), x, y);
        if (blockMove) return blockMove;

        newBoard[x][y] = game.player();
        for (const neighbor2 of neighbors(newBoard)) {
            const x2 = neighbor2.x;
            const y2 = neighbor2.y;
            const newBoard2 = JSON.parse(JSON.stringify(newBoard));


            // Make sure we don't offer a winning move to the opponent
            const blockMove2 = assesMove(newBoard2, game.opponent(), x2, y2);
            if (blockMove2) blackList.push(blockMove2[0]);

            // Get a list of winning moves
            const winMove2 = assesMove(newBoard2, game.player(), x2, y2);
            if (winMove2) whiteList.push(winMove2[0]);
        }

        // Block opponent's 3-in-a-row threats
        newBoard[x][y] = game.opponent();
        if (countStreakFromCell(newBoard, x, y, 3)) {
            whiteList.push(x);
        }
    }

    // Filter out columns that are not in the white list
    let availableColumns = game.columnsAvailable();
    if (blackList.length > 0 && whiteList.length > 0) whiteList = whiteList.filter(column => !blackList.includes(column));
    if (blackList.length > 0 && blackList.length < availableColumns.length) availableColumns = availableColumns.filter(column => !blackList.includes(column));
    if (whiteList.length > 0 && whiteList.length < availableColumns.length) availableColumns = availableColumns.filter(column => whiteList.includes(column));

    // Play in the middle
    return [bestColumn(availableColumns), 0];
}

module.exports = {hybrid};