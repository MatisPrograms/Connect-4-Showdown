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
        home();
}

function home() {
    resetTable();
    window.location.href = '../homepage/home.html';
}

function enableColumnClick(column) {
    column.addEventListener("click", columnClicked);
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
    const p1 = document.getElementById('player-1');
    const p2 = document.getElementById('player-2');
    if (lastPlayed === players[0]) {
        p1.style.display = 'none';
        p2.style.display = '';
    } else if (lastPlayed === players[1]) {
        p1.style.display = '';
        p2.style.display = 'none';
    }
}

function playerTurn() {
    return lastPlayed === players[0] ? players[1] : players[0];
}

function shortLabel(colour) {
    return colour.charAt(0).toUpperCase();
}

function victory(cells) {
    isFinished = true;
    disableColumnsClick();
    document.getElementById('player-info').innerText = 'Player ' + playerTurn() + ' wins!';
    document.getElementById('player-1').style.display = 'none';
    document.getElementById('player-2').style.display = 'none';

    cells.forEach(cell => {
        document.getElementById(cell[0] + "" + cell[1]).classList.add("green")
    });
}

function draw() {
    isFinished = true;
    disableColumnsClick();
    document.getElementById('player-info').innerText = "It's a Draw!";
    document.getElementById('player-1').style.display = 'none';
    document.getElementById('player-2').style.display = 'none';
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
        setTimeout(() => AIMove(playerTurn()), 500);
    }
}

function resetTable() {
    turn = 0;
    board = newGame();
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

    enableColumnsClick();
}