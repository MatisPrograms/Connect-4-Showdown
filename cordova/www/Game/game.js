const socket = io(window.location.origin + '/api/game', {
    auth: {
        token: localStorage.getItem('jwt_token')
    }
});

const home_url = '/Home/home.html';
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

let savedGame = '';
let loadedGame = false;

let player1;
let player2;

let turnNumber;
let turnPlayer;
let lastPlayed;
let board;
let isFinished;
let mmrDiff;

let AIModel = 'random';
let AIOrder = '2';

socket.on('connect', () => {
    console.log('Connected to Game Server | Requesting game mode:', mode);
});

socket.on('AI-Setup', () => {
    socket.emit('AI', {AIplays: AIOrder, AImodel: AIModel});
});

socket.on('Casual-Setup', () => {
    socket.emit('Casual', urlParams.get('challenge'));
});

socket.on('Waiting', () => {
    console.log('Waiting for another player to join...');
    document.getElementById('online-waiting-container').classList.add('show');
    document.getElementById('focus-blur').style.display = 'block';
});

socket.on('newGame', (game) => {
    if (mode === 'Ranked' || mode === 'Casual') {
        document.getElementById("toggle-chat-menu").classList.remove("hidden");
        document.getElementsByClassName('bottom-grid')[0].style.display = 'none';
    }
    if (document.getElementById('online-waiting-container').classList.contains('show')) {
        navigator.vibrate(250);
        document.getElementById('online-waiting-container').classList.remove('show');
        document.getElementById('focus-blur').style.display = 'none';
    }
    turnNumber = game.turnNumber;
    turnPlayer = game.turnPlayer;
    player1 = game.player1;
    player2 = game.player2;
    isFinished = game.status.finished;
    board = game.board;
    mmrDiff = game.mmr;

    updatePlayer(1, player1.Avatar, player1.Username, player1.MMR)
    updatePlayer(2, player2.Avatar, player2.Username, player2.MMR)

    updateTurn();
    if (mode === 'AI' && !loadedGame) loadGame();
});

socket.on('updatedBoard', (game) => {
    turnNumber = game.turnNumber;
    lastPlayed = turnPlayer;
    turnPlayer = game.turnPlayer;
    isFinished = game.status.finished;
    board = game.board;
    mmrDiff = game.mmr;

    if (isFinished) {
        navigator.vibrate(250);
        document.getElementsByClassName('save-game-button')[0].setAttribute('disabled', '');
        if (game.status.winner !== 'draw') {
            victory(game.status.winner, game.status.cells);
        } else {
            draw();
        }
        if (mode === 'Ranked' || mode === 'Casual') {
            const p = game.status.winner === "1" ? player1 : player2

            // Creating the winner title
            let won = true;
            let draw = false;
            const title = document.createElement('div');
            title.classList.add('winner-title-message');
            if (game.status.winner === "draw") {
                title.classList.add('draw');
                title.innerHTML = 'Draw'
                draw = true;
            } else {
                if (p.Username.toLowerCase() === user.Username.toLowerCase()) {
                    title.classList.add('won');
                    title.innerHTML = 'You Won';
                } else {
                    title.classList.add('lost');
                    title.innerHTML = 'You Lost';
                    won = false;
                }
            }
            const titleContainer = document.querySelector('.winner-title-container');
            if (titleContainer.hasChildNodes()) titleContainer.innerHTML = '';
            titleContainer.appendChild(title);

            for (let i = 0; i < 2; i++) {
                const source = document.getElementsByClassName('player-info')[i];
                const username = source.querySelector('.player-username').textContent;

                document.getElementsByClassName('player-info')[i + 2].querySelector('.player-username').innerHTML = username;
                document.getElementsByClassName('player-avatar')[i + 2].innerHTML = document.getElementsByClassName('player-avatar')[i].innerHTML;

                if (!draw && username.toLowerCase() === p.Username.toLowerCase()) {
                    document.getElementsByClassName('player-avatar')[i + 2].innerHTML += '<div class="crown"><i class="fas fa-crown"></i></div>'
                }

                if (username.toLowerCase() === user.Username.toLowerCase()) {
                    if (mode === 'Ranked') {
                        const mmr = source.querySelector('.player-sub-info .player-mmr').textContent;
                        document.getElementsByClassName('match-info')[0].innerHTML = '<div class="mmr-score">' + mmr + '<span class="mmr-diff ' + (won ? "positive" : "negative") + '">' + mmrDiff + '</span></div>'
                    }
                    if (mode === 'Casual') {
                        document.getElementsByClassName('match-info')[0].innerHTML = '<div class="score-holder">1 - 2</div>'
                    }
                }
            }

            setTimeout(() => {
                document.getElementById('winner-container').classList.add('show');
                document.getElementById('focus-blur').style.display = 'block';
            }, 1000);
        }
    }

    updateTurn();
})

socket.on('timer', (data) => {
    if (!isFinished) updateTimer(data.totalTime, data.player1, data.player2);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected from server:", reason);
});

function home() {
    window.location.href = home_url;
}

onPageReady(() => {
    user = JSON.parse(localStorage.getItem('user'));

    switch (mode) {
        case '1v1':
            break;
        case 'AI':
            document.querySelector(".ai-container").style.display = 'flex';

            document.querySelector(".save-game").style.display = 'flex';
            if (user) document.querySelector(".save-game-button").removeAttribute('disabled');

            updatePlayer(2, `${baseUrl()}/api/avatar?name=avatar-10&colors=94813b,4190d,e06bb4,9ad7a,5d6619`, AIModel.charAt(0).toUpperCase() + AIModel.slice(1), 'AI')

            document.getElementById('ai-mode').addEventListener('change', (e) => {
                AIModel = e.target.value;
                updatePlayer(2, false, AIModel.charAt(0).toUpperCase() + AIModel.slice(1), false)
                socket.emit('AI', {AIplays: AIOrder, AImodel: AIModel});
            });
            document.getElementById('ai-plays').addEventListener('change', (e) => {
                AIOrder = e.target.value;
                socket.emit('AI', {AIplays: AIOrder, AImodel: AIModel});
            });

            for (const button of document.getElementsByClassName('load-saved-game-button')) {
                button.addEventListener('click', () => {
                    savedGame = button.innerHTML;
                    document.getElementById('load-saved-game-container').classList.remove('show');
                    document.getElementById('focus-blur').style.display = 'none';
                });
            }
            break;
        case 'Ranked':
            if (!user) home();
            break;
        case 'Casual':
            if (!user || !urlParams.get('challenge')) home();
            break;
        default:
            home();
    }

    if (localStorage.getItem("user")) {
        updatePlayer(1, user.Avatar, user.Username, user.MMR)
        document.getElementById("toggle-social-menu").classList.remove("hidden");
    }

    enableColumnsClick();
    socket.emit('gameMode', {mode: mode});
});

function updatePlayer(playerNumber, avatar, username, mmr) {
    if (playerNumber < 1 || playerNumber > 2) return
    if (avatar) document.getElementsByClassName('player-avatar')[playerNumber - 1].innerHTML = '<img src="' + avatar + '" alt="avatar of player ' + playerNumber + '">';
    if (username) document.getElementsByClassName('player-username')[playerNumber - 1].innerText = username;
    if (mmr || mmr === 0) document.getElementsByClassName('player-mmr')[playerNumber - 1].innerText = mmr;

    if (avatar) {
        document.getElementsByClassName('player-avatar')[playerNumber - 1].querySelector('img').addEventListener('click', () => {
            window.open(`/Profile/profile.html?username=${username}`);
        });
    }
}

function updateTimer(totalTime, p1, p2) {
    document.querySelector('.timer-countdown').innerHTML = `${Math.floor(totalTime / 60)}:${(totalTime % 60 < 10 ? '0' : '') + (totalTime % 60)}`;
    const playerTimers = document.querySelectorAll('.player-timer');
    playerTimers[0].innerHTML = `${p1 < 10 ? '0' : ''}${p1}s`;
    playerTimers[1].innerHTML = `${p2 < 10 ? '0' : ''}${p2}s`;
}

function playerColour(player) {
    return isFinished ? '#444656' : player === '1' ? '#46bb9c' : '#e46874';
}

function updateTurn() {
    let yourTurn = true

    // Disable and Enable interactions for player's turn
    if (mode !== '1v1') {
        const p = turnPlayer === "1" ? player1 : player2
        if (mode === 'AI' && p === 'Human' || mode === 'Ranked' && p.Username.toLowerCase() === user.Username.toLowerCase() || mode === 'Casual' && p.Username.toLowerCase() === user.Username.toLowerCase()) {
            enableColumnsClick();
        } else {
            disableColumnsClick()
            yourTurn = false
        }
    }

    // Dynamic highlight of column for mouse pointed devices
    if (window.matchMedia('(pointer:fine)').matches || navigator.pointerEnabled) {
        const style = document.createElement('style');
        style.innerHTML = `
        #game-board tr:not(.animating):hover :not(td:has(:not(.coin1):not(.coin2)) ~ td):has(:not(.coin1):not(.coin2)) .cell {
            background-color: ` + (yourTurn ? (playerColour(turnPlayer) + '80') : '#444655') + `;
        }`
        document.head.appendChild(style);
    }

    // Update board with coins
    for (let i = 0; i < board[0].length; i++) {
        for (let j = 0; j < board.length; j++) {
            const token = document.getElementById(j + "" + i).querySelector('.cell');
            if (board[j][i] === '') {
                token.classList.remove("coin1", "coin2", "victory");
            } else if (board[j][i] !== '' && !document.getElementById(j + "" + i).classList.contains("coin" + board[j][i])) {
                token.classList.add("coin" + board[j][i]);
            }
        }
    }

    if (!isFinished) {
        // Update turn info
        if (mode !== '1v1') {
            const p = turnPlayer === "1" ? player1 : player2
            document.getElementById('player-info').innerText = (p.Username ? p.Username : p) + "'s Turn";
        }
        document.getElementById('player-turn').classList.add('coin' + (turnPlayer === "1" ? "1" : "2"));
        document.getElementById('player-turn').classList.remove('coin' + (turnPlayer === "1" ? "2" : "1"));
    }
}

function enableColumnClick(column) {
    column.addEventListener("click", columnClicked);
    for (let cell of column.children) {
        cell.addEventListener("animationend", function (event) {
            let target = event.target.parentNode.parentNode;
            if (isFinished) target.classList.remove("animating"); else setTimeout(() => {
                target.classList.remove("animating");
            }, 100);
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

function columnClicked(event) {
    let column = null;
    let cell = null;

    if (event.type === "click") {
        switch (event.target.tagName.toLowerCase()) {
            case "div":
                cell = event.target.parentNode;
                column = cell.parentNode;
                break;
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

    column.classList.add("animating");
    const x = cellCoordinates(cell).x;
    for (let i = 0; i < board[0].length; i++) {
        if (board[x][i] === "") {
            socket.emit('newMove', [x, i]);
            if (i === board[0].length - 1) disableColumnClick(column);
            break;
        }
    }
}

function saveGame() {
    if (isFinished || !user) return;
    fetch(baseUrl() + '/api/save', {
        method: 'POST', headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }, body: JSON.stringify({
            player1: player1 === 'Human' ? user.Username : player1.Username ? player1.Username : player1,
            player2: player2 === 'Human' ? user.Username : player2.Username ? player2.Username : player2,
            turnPlayer: turnPlayer,
            board: board,
        })
    }).then(response => {
        if (response.status === 200) console.log('Game saved'); else console.log('Error saving game');
    });
}

function loadGame() {
    if (!user) return;
    loadedGame = true;
    fetch(baseUrl() + '/api/load', {
        method: 'POST', headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }, body: JSON.stringify({
            player1: player1 === 'Human' ? user.Username : player1.Username ? player1.Username : player1,
            player2: player2 === 'Human' ? user.Username : player2.Username ? player2.Username : player2,
        })
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                data = data.savedGame;
                if (data) {
                    // Ask if user wants to load saved game
                    document.getElementById('load-saved-game-container').classList.add('show');
                    document.getElementById('focus-blur').style.display = 'block';

                    // Wait for savedGame value to change
                    const interval = setInterval(() => {
                        if (savedGame) {
                            if (savedGame === 'Load Game') {
                                savedGame = "";
                                socket.emit('loadGame', data);
                            } else {
                                fetch(baseUrl() + '/api/save', {
                                    method: 'DELETE', headers: {
                                        'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
                                    }, body: JSON.stringify({
                                        player1: player1 === 'Human' ? user.Username : player1.Username ? player1.Username : player1,
                                        player2: player2 === 'Human' ? user.Username : player2.Username ? player2.Username : player2,
                                    })
                                }).then(() => console.log('Game deleted')).catch(() => console.log('Error deleting game'));
                            }
                            clearInterval(interval);
                        }
                    });
                }
            });
        }
    });
}

function resetTable() {
    socket.emit('resetGame');
    document.getElementById('player-info').innerText = "Turn";

    document.getElementById('winner-container').classList.remove('show');
    document.getElementById('focus-blur').style.display = 'none';
    document.getElementsByClassName('winner-title-container')[0].innerHTML = '';

    if (mode === 'AI' && localStorage.getItem("user") !== null) {
        document.getElementsByClassName('save-game-button')[0].removeAttribute('disabled');
    } else {
        document.getElementsByClassName('save-game-button')[0].setAttribute('disabled', '');
    }

    updateTurn();
    enableColumnsClick();
}

function victory(winner, cells) {
    isFinished = true;
    disableColumnsClick();

    if (cells) cells.forEach(cell => document.getElementById(cell[0] + "" + cell[1])
        .querySelector('.cell').classList.add("victory"));

    if (mode !== '1v1') {
        const p = winner === "1" ? player1 : player2
        document.getElementById('player-info').innerText = (p.Username ? p.Username : p) + " wins!";
    } else {
        document.getElementById('player-info').innerText = "Player " + winner + " wins!";
    }

    document.getElementById('player-turn').classList.remove('coin1', 'coin2');
    document.getElementById('player-turn').classList.add('coin' + winner);
}

function draw() {
    isFinished = true;
    disableColumnsClick();

    document.getElementById('player-info').innerText = "Draw!";
    document.getElementById('player-turn').classList.remove('coin1', 'coin2');
}

function cellCoordinates(cell) {
    return {
        x: parseInt(cell.id[0]), y: parseInt(cell.id[1])
    }
}
