const manual = true;
const solver = false;

const iterations = 500;
let iteration = 1;

const player1Model = 'Random AI';
const player2Model = 'Hybrid2 AI';
let startTime = Date.now();

console.log(`Automating ${iterations} games`);
onPageReady(async () => {
        let moves = '';
        let oldBoard = undefined;

        updateTurn = async function updateTurn() {
            if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
                if (oldBoard !== undefined) {
                    for (let i = 0; i < board[0].length; i++) {
                        for (let j = 0; j < board.length; j++) {
                            if (oldBoard[j][i] !== board[j][i]) {
                                moves += j + 1;
                                break;
                            }
                        }
                    }
                }
                oldBoard = board;
            }

            // Dynamic highlight of column
            const style = document.createElement('style');
            style.innerHTML = `
  #game-board tr:not(.animating):hover :not(td:not(.coin1):not(.coin2) ~ td):not(.coin1):not(.coin2) {
    background-color: ` + playerColour(turnPlayer) + `80;
}
  `;
            document.head.appendChild(style);

            // Update board with coins
            for (let i = 0; i < board[0].length; i++) {
                for (let j = 0; j < board.length; j++) {
                    if (board[j][i] === '') {
                        document.getElementById(j + "" + i).classList.remove("coin1", "coin2", "victory");
                    } else if (board[j][i] !== '' && !document.getElementById(j + "" + i).classList.contains("coin" + board[j][i])) {
                        document.getElementById(j + "" + i).classList.add("coin" + board[j][i]);
                    }
                }
            }

            if (!isFinished) {
                // Update turn info
                document.getElementById('player-turn').classList.add('coin' + turnPlayer);
                document.getElementById('player-turn').classList.remove('coin' + lastPlayed);
            }

            if (mode === 'AI' && document.getElementById("ai-mode").value === 'hybrid' && !isFinished && turnNumber % 2 === AIOrder % 2) {
                if (solver) {
                    await fetch(baseUrl() + '/api/solve', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            moves: moves
                        })
                    }).then(response => {
                        if (response.status !== 200) return;
                        return response.json();
                    }).then(json => {
                        const scores = json.score.map((score) => score > 20 ? -20 : score);
                        const maxScore = Math.max(...scores);
                        const indexScores = {0: 1, 1: 2, 2: 3, 3: 4, 4: 3, 5: 2, 6: 1};
                        const maxIndexes = scores.map((score, index) => score === maxScore ? indexScores[index] : 0);
                        setTimeout(() => {
                            document.getElementsByClassName('column')[maxIndexes.indexOf(Math.max(...maxIndexes))].click();
                        }, 500);
                    }).catch(error => console.log(error));
                } else {
                    const availableMoves = [];
                    for (let i = 0; i < board.length; i++) {
                        if (board[i][5] === '') {
                            availableMoves.push(i);
                        }
                    }
                    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                    document.getElementsByClassName('column')[randomMove].click();
                }
            }
        }

        saveGame = async function saveGame() {
            if (manual) return;
            const AI1 = player1Model + ' Iteration ' + iteration;
            const AI2 = player2Model + ' Iteration ' + iteration;
            await fetch(baseUrl() + '/api/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player1: AI1,
                    player2: AI2,
                    winner: lastPlayed === "1" ? AI1 : AI2,
                    board: board,
                    turnNumber: turnNumber,
                    moves: moves
                })
            });
        }

        resetTable = function resetTable() {
            if (iteration > iterations) {
                const totalTime = Date.now() - startTime;
                console.log('Finished automating games in ' + totalTime / 1000 + ' seconds', '(' + (totalTime / 1000) / iterations + ' seconds per game)');
                return
            }
            moves = '';
            oldBoard = undefined;

            socket.emit('resetGame');
            document.getElementById('player-info').innerText = "Player's Turn";

            if (mode === 'AI' && localStorage.getItem("user") !== null) {
                document.getElementsByClassName('save-game-button')[0].removeAttribute('disabled');
            } else {
                document.getElementsByClassName('save-game-button')[0].setAttribute('disabled', '');
            }

            enableColumnsClick();
        }

        victory = function victory(cells) {
            isFinished = true;
            disableColumnsClick();

            cells.forEach(cell => {
                document.getElementById(cell[0] + "" + cell[1]).classList.add("victory")
            });

            document.getElementById('player-info').innerText = "Player " + lastPlayed + " wins!";
            document.getElementById('player-turn').classList.remove('coin' + turnPlayer);
            document.getElementById('player-turn').classList.add('coin' + lastPlayed);
            console.log('Game ' + iteration++ + ' finished. Won by ' + lastPlayed + ' in ' + turnNumber + '\nmoves', moves);

            saveGame();
            if (!manual) setTimeout(() => {
                resetTable();
            }, 500);
        }

        draw = function draw() {
            isFinished = true;
            disableColumnsClick();
            document.getElementById('player-info').innerText = "Draw!";
            document.getElementById('player-turn').classList.remove('coin1', 'coin2');

            console.log('Game ' + iteration++ + ' finished. Draw in ' + turnNumber + ' moves');

            saveGame();
            if (!manual) setTimeout(() => {
                resetTable();
            }, 500);
        }

        document.getElementById("ai-mode").value = "hybrid";
        document.getElementById("ai-plays").value = "1";
        AIOrder = '2';
        AIModel = 'hybrid';
        socket.emit('setup', {AIplays: AIOrder, AImodel: AIModel});

        resetTable();
    }
)
