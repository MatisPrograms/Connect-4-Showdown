let aiPlayer;
let aiOpponent;

const worker = new Worker('minimaxWorker.js');

async function MinMaxAIMove(colour) {
    console.log("MixMax AI's turn");
    document.getElementById("loading-circle").classList.add("thinking");

    aiPlayer = colour;
    aiOpponent = colour === "1" ? "2" : "1";

    worker.postMessage({
        board: board,
        depth: 20,
        player: aiPlayer,
        min: -Infinity,
        max: Infinity,
        aiPlayer: aiPlayer,
        aiOpponent: aiOpponent
    });

    const nextMove = await new Promise((resolve) => {
        worker.onmessage = (event) => {
            resolve(event.data);
        };
    });

    document.getElementById("loading-circle").classList.remove("thinking");
    console.log("MinMax AI's move: Column", nextMove.move[0], nextMove);
    return nextMove.move[0];
}

async function RandomAIMove() {
    console.log("Random AI's turn")
    document.getElementById("loading-circle").classList.add('thinking');

    await new Promise((resolve) => setTimeout(resolve, 500));
    const availableColumns = columnsAvailable();
    const chosenColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)];

    document.getElementById("loading-circle").classList.remove('thinking');
    console.log("Random AI's move: Column", chosenColumn);
    return chosenColumn;
}

async function AIMove(colour) {
    document.getElementById("ai-mode").toggleAttribute("playing");
    let chosenColumn;
    switch (document.getElementById("ai-mode").value) {
        case "minmax" :
            chosenColumn = await MinMaxAIMove(colour);
            break;
        default:
            chosenColumn = await RandomAIMove();
            break;
    }
    columnClicked(document.getElementsByClassName("column")[chosenColumn]);
    document.getElementById("ai-mode").toggleAttribute("playing");
}