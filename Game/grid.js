function updateTurn() {
    const style = document.createElement('style');
    style.innerHTML = `
  #game-board tr:not(.animating):hover :not(td:not(.coin1):not(.coin2) ~ td):not(.coin1):not(.coin2) {
    background-color: ` + (isFinished ? 'transparent' : playerTurn() === '1' ? '#e46874' : '#46bb9c') + `;
}
  `;
    document.head.appendChild(style);

    document.getElementById('player-turn').classList.add('coin' + playerTurn());
    document.getElementById('player-turn').classList.remove('coin' + lastPlayed);
}

function disableHighLight() {
    const style = document.createElement('style');
    style.innerHTML = `
  #game-board tr:hover :not(td:not(.coin1):not(.coin2) ~ td):not(.coin1):not(.coin2) {
    animation-delay: 250ms;
    background-color: transparent;
}
  `;
    document.head.appendChild(style);
}

function enableColumnClick(column) {
    column.addEventListener("click", columnClicked);
    for (let cell of column.children) {
        cell.addEventListener("animationstart", function (event) {
            event.target.parentNode.classList.add("animating");
            updateTurn();
        });
        cell.addEventListener("animationend", function (event) {
            event.target.parentNode.classList.remove("animating");
        });
    }
}

function enableColumnsClick() {
    for (const column of document.getElementsByClassName("column")) {
        enableColumnClick(column);
    }
}

function disableColumnClick(column) {
    column.removeEventListener("click", columnClicked);
}

function disableColumnsClick() {
    for (const column of document.getElementsByClassName("column")) {
        disableColumnClick(column);
    }
}

function togglePlayer() {
    lastPlayed = players[players.findIndex(p => p !== lastPlayed)];
    updateTurn();
}

function playerTurn() {
    return lastPlayed === players[0] ? players[1] : players[0];
}

function columnClicked(event) {
    turn++;
    let column = null;
    let cell = null;

    if (event.type === "click") {
        switch (event.target.tagName.toLowerCase()) {
            case "td":
                cell = event.target;
                column = cell.parentNode;
                break;
            case "tr":
                column = event.target;
                cell = column.children[0];
                break;
            default:
                return;
        }
    } else {
        column = event;
        cell = column.children[0];
    }

    const x = cellCoordinates(cell).x;
    for (let i = 0; i < board[0].length; i++) {
        if (board[x][i] === "") {
            playCell(x, i, playerTurn());
            if (i === board[0].length - 1) disableColumnClick(column);
            break;
        }
    }
    togglePlayer();

    if (!isFinished && mode === "AI" && !document.getElementById("ai-mode").hasAttribute("playing")) {
        disableHighLight();
        setTimeout(() => AIMove(playerTurn()), 500);
    }
}

function resetTable() {
    turn = 0;
    isFinished = false;
    lastPlayed = Math.random() < 0.5 ? players[0] : players[1];
    board = newGame();

    for (const cell of document.querySelectorAll(".cell")) {
        if (cell.classList.contains("coin1") || cell.classList.contains("coin2") || cell.classList.contains("victory")) {
            cell.classList.remove("coin1");
            cell.classList.remove("coin2");
            cell.classList.remove("victory");
        }
    }

    document.getElementById('player-info').innerText = "Player's Turn";
    updateTurn();
    enableColumnsClick();
}

function victory(cells) {
    isFinished = true;
    disableColumnsClick();

    cells.forEach(cell => {
        document.getElementById(cell[0] + "" + cell[1]).classList.add("victory")
    });

    togglePlayer();
    document.getElementById('player-info').innerText = "Player " + lastPlayed + " wins!";
    document.getElementById('player-turn').classList.add('coin' + playerTurn());
    document.getElementById('player-turn').classList.remove('coin' + lastPlayed);
}

function draw() {
    isFinished = true;
    disableColumnsClick();

    document.getElementById('player-info').innerText = "Draw!";
}