const game_url = '/Game/game.html';

function playLocal1v1() {
    console.log('Local 1v1');
    window.location.href = game_url + '?mode=1v1';
}

function playVsAI() {
    console.log('Vs AI');
    window.location.href = game_url + '?mode=AI';
}

function playRankedOnline() {
    console.log('Ranked Online');
    window.location.href = game_url + '?mode=Ranked';
}

function randomBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function cellInfo() {
    const maxCellSize = Math.min(window.innerWidth, window.innerHeight) / 10;
    const minCellSize = maxCellSize / 2;

    // Calculate mean surface area of cells
    const averageCellArea = (minCellSize + maxCellSize) / 2;

    // Calculate number of cells to fill 0.05% screen
    return {
        minSize: minCellSize,
        maxSize: maxCellSize,
        cellCount: Math.floor((window.innerWidth * window.innerHeight) / averageCellArea * 0.0005)
    };
}

function background() {
    // Calculate number of cells to fill 0.05% screen
    const info = cellInfo();
    const diff = info.cellCount - cells.size;
    const cellIterator = cells.keys();

    // Animate cells
    for (let i = 0; i < info.cellCount; i++) {
        const div = i >= cells.size ? document.createElement('div') : cellIterator.next().value;
        if (i >= cells.size) document.getElementById('background').appendChild(div);

        const width = randomBetween(info.minSize, info.maxSize);
        div.style.width = `${width}px`;
        div.style.zIndex = `-${randomBetween(1, 10)}`;
        div.style.filter = `blur(${randomBetween(1, 5)}px)`;
        div.style.position = 'absolute';
        div.style.aspectRatio = '1';

        let x = Math.floor(Math.random() * window.innerWidth);
        let y = Math.floor(Math.random() * window.innerHeight);

        while (x <= width) x += width + 1;
        while (y <= width) y += width + 1;
        while (x + width >= window.innerWidth) x -= width + 1;
        while (y + width >= window.innerHeight) y -= width + 1;

        let directionX = Math.random() < 0.5 ? 1 : -1;
        let directionY = Math.random() < 0.5 ? 1 : -1;

        const speed = randomBetween(1, 2.5)
        cells.set(div, setInterval(() => {
            x += speed * directionX;
            y += speed * directionY;
            if (x + parseInt(div.style.width) >= window.innerWidth || x <= 0) {
                directionX = -directionX;
            }
            if (y + parseInt(div.style.width) >= window.innerHeight || y <= 0) {
                directionY = -directionY;
            }

            div.style.transform = `translate(${x}px, ${y}px)`;
        }, 10));
    }

    // Remove extra cells
    if (diff < 0) {
        for (const cell of cellIterator) {
            clearInterval(cell);
            cell.remove();
            cells.delete(cell);
        }
    }
}

// Pause animation during resize and resume after
addEventListener('resize', debounce(() => {
    for (const cell of cells.values()) clearInterval(cell);
}, () => background(), 100));

const cells = new Map();
background();

choosePlaylist('Hub');