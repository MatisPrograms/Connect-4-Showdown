const leaderboardSocket = io('http://' + window.location.host.split(':')[0] + ':3000/api/leaderboard');

const ONLINE_THRESHOLD = 10;
let leaderboardSocketRetries = 10;

leaderboardSocket.on('connect', () => {
    console.log('Connected to live Leaderboard');
});

leaderboardSocket.on('leaderboard', (leaderboard) => {
    loadLeaderboard(leaderboard).then(() => console.log('Leaderboard updated'));
});

leaderboardSocket.on('disconnect', () => {
    console.log('Disconnected from live Leaderboard');
    if (leaderboardSocketRetries > 0) {
        setTimeout(() => {
            leaderboardSocketRetries--;
            leaderboardSocket.connect();
        }, 1000);
    }
});

async function loadLeaderboard(leaderboard) {
    const leaderboardContainer = document.getElementById('leaderboard-rankings');

    let onlineUsers = 0;

    // Clear leaderboard
    leaderboardContainer.innerHTML = '';

    for (const [index, user] of leaderboard.entries()) {
        // Create row for leaderboard
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${index + 1}.</td>
                <td>${user.Username}</td>
                <td>${user.Rank.Rank} ${user.Rank.Division}<br><span>${user.MMR}</span></td>
            `;

        // Calculate time since last connection
        const passedTime = new Date() - new Date(user.LastConnection);
        const minutes = Math.floor(passedTime / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // Display time since last connection
        if (!user.LastConnection) {
            row.innerHTML += `<td data-status="Offline">Never</td>`;
        } else if (user.LastConnection && minutes < ONLINE_THRESHOLD) {
            row.innerHTML += `<td data-status="Online">Online</td>`;
            onlineUsers++;
        } else {
            const timeValue = days > 0 ? days : hours > 0 ? hours : minutes;
            const timeUnit = (days > 0 ? "Day" : hours > 0 ? "Hour" : "Minute") + (timeValue > 1 ? "s" : "");
            row.innerHTML += `<td data-status="Offline">${timeValue} ${timeUnit}</td>`;
        }

        // Add row to leaderboard
        leaderboardContainer.appendChild(row);

        // Open profile page in new tab
        row.addEventListener('click', () => {
            window.open(`/Profile/profile.html?username=${user.Username}`);
        });
    }

    // Update online users
    // <span class="offline">0</span> Users Online
    document.querySelector('.online-users').innerHTML = `
    <span ${onlineUsers > 0 ? '' : 'class="offline"'}>${onlineUsers}</span> User${onlineUsers === 1 ? "" : "s"} connected from Top 100
    `;
}

class Leaderboard extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <link href="../Leaderboard/leaderboard.css" rel="stylesheet">
            <button id="leaderboard-button" onclick="leaderboardDisplay()">Leaderboard</button>
            <div class="leaderboard-container" id="leader-container">
                <div class="leaderboard-title">
                    <i class="fas fa-crown"></i>
                    Live Leaderboard
                    <i class="fas fa-crown"></i>
                </div>
                <div class="leaderboard-table-container">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Rank</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboard-rankings">
                        </tbody>    
                    </table>
                </div>
                <div class="online-users">
                </div>
            </div>
    `;
    };
}

function leaderboardDisplay() {
    let leaderboard = document.getElementById("leader-container");
    if (!leaderboard.classList.contains("hidden")) {
        closeLeaderBoard();
    } else {
        console.log("Opening Leaderboard")
        leaderboard.classList.remove("hidden");
        document.getElementById("focus").classList.remove("hidden");
    }
}

function closeLeaderBoard() {
    document.getElementById("leader-container").classList.add("hidden");
    document.getElementById("focus").classList.add("hidden");
}

function leaderBoardLayout() {
    if (window.innerWidth > window.innerHeight) {
        // LANDSCAPE
        if (!document.getElementById('leader-container').classList.contains("hidden") && !document.getElementById("focus").classList.contains("hidden") && !document.getElementById("pop-up-container").classList.contains("hidden")) {
            document.getElementById("focus").classList.add("hidden");
        }
        if (document.getElementById("leader-container").classList.contains("hidden")) {
            document.getElementById("leader-container").classList.remove("hidden");
        }
    } else {
        // PORTRAIT
        document.getElementById("leader-container").classList.add("hidden");
    }
}

onPageReady(() => {
    // Close Leaderboard when clicking outside of it
    document.addEventListener("mouseup", (e) => {
        if (!document.getElementById('leader-container').classList.contains("hidden") && window.innerWidth < window.innerHeight && !document.getElementById("focus").classList.contains("hidden") && e.target.id !== "leaderboard-button" && !e.target.closest(".leaderboard-container")) {
            closeLeaderBoard();
        }
    });

    leaderBoardLayout();
});

window.addEventListener('resize', debounce(() => {

}, () => {
    leaderBoardLayout();
}, 10));

customElements.define('app-leaderboard', Leaderboard);
