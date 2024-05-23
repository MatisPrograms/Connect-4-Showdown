const WIDTH = 7;
const HEIGHT = 6;
const MIN_SCORE = -(WIDTH * HEIGHT) / 2 + 3;
const MAX_SCORE = (WIDTH * HEIGHT + 1) / 2 - 3;

class Bitboard {

    constructor(player, board) {
        this.position = 0n;
        this.mask = 0n;
        this.bottom = (1n << BigInt(WIDTH)) - 1n;

        this.player = player ? player : "1";
        this.turn = 0;
        this.score = 0;
        if (board) this.loadBoard(board);
    }

    /**
     * Returns a BigInt representing the unique state of the board.
     *
     * @returns {bigint}
     */
    key() {
        return this.position + this.mask;
    }

    loadBoard(board) {
        for (let row = 0; row < HEIGHT; row++) {
            for (let col = 0; col < WIDTH; col++) {
                let cell = board[col][row];
                if (cell === this.player) {
                    this.position |= 1n << BigInt(col + row * WIDTH);
                }
                if (cell !== "") {
                    this.mask |= 1n << BigInt(col + row * WIDTH);
                    this.turn++;
                }
            }
        }
    }

    toString() {
        console.log("Position:");
        this.print(this.position);
        console.log("\nMask:");
        this.print(this.mask);
        console.log("\nKey:");
        this.print(this.key());
    }

    print(bits) {
        let table = "";
        for (let row = HEIGHT - 1; row >= 0; row--) {
            let line = "";
            for (let col = 0; col < WIDTH; col++) {
                let bit = bits & (1n << BigInt(col + row * WIDTH));
                line += bit === 0n ? "0" : "1";
                if (col < WIDTH - 1) line += " ";
            }
            table += line + "\n";
        }
        console.log(table);
    }

    columnToMove(column) {
        let row = 0;
        let move = 1n << BigInt(column + row * WIDTH);
        while (move && this.mask) {
            row++;
            move = 1n << BigInt(column + row * WIDTH);
        }
        return move;
    }

    /**
     * Plays a move on the board.
     *
     * @param move {BigInt}
     */
    play(move) {
        this.position ^= this.mask;
        this.mask |= move;
        this.turn++;
    }

    /**
     * Return a BigInt representing the possible moves.
     *
     * @returns {bigint}
     */
    moves() {
        let empty = ~this.mask;
        let row = this.bottom;
        let result = 0n;
        for (let i = 0; i < HEIGHT; i++) {
            if (row === 0n) break;
            const valid = row & empty;
            result |= valid;
            empty &= ~(valid << BigInt(WIDTH));
            row = (row & ~valid) << BigInt(WIDTH);
        }
        return result;
    }

    /**
     * Returns true if the game is over.
     *
     * @returns {boolean}
     */
    draw() {
        return this.turn === WIDTH * HEIGHT;
    }

    /**
     * Returns true if the game is over.
     *
     * @returns {boolean}
     */
    victory() {
        this.score = this.evaluate();
        return this.score >= MAX_SCORE;
    }

    /**
     * Returns the score of the board.
     *
     * @returns {number}
     */
    evaluate() {

    }
}