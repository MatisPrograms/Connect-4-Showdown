let user

window.addEventListener("load", () => {
    userUpdate();
});

function updateUser() {
    user = JSON.parse(localStorage.getItem("user"));
    if (!user) return new Promise((resolve) => resolve());
    return fetch(baseUrl() + '/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token').replace(/['"]+/g, '')
        },
        body: JSON.stringify({email: user.Email})
    }).then(async response => {
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();

        const updatedJwtToken = json.token;
        const updatedUser = json.user;

        localStorage.setItem("jwt_token", updatedJwtToken);
        localStorage.setItem("user", JSON.stringify(JSON.parse(updatedUser)));

        return updatedUser;
    }).catch(() => {
        user = undefined;
    })
}

function getRanks() {
    return fetch(baseUrl() + '/api/ranks', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    }).then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    })
}

function getRank(mmr) {
    return fetch(baseUrl() + '/api/rank', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({mmr: mmr})
    }).then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    })
}

function userUpdate() {
    updateUser().then(() => {
        if (user) userConnected();
        else userDisconnected();
    });
}

function userConnected() {
    if (socialSocket) socialSocket.emit('update', {
        token: localStorage.getItem('jwt_token'),
        recursive: true
    });

    if (window.location.pathname === "/Home/home.html") {
        document.getElementById("toggle-social-menu").classList.remove("hidden");
        document.getElementById("sign-in-button").setAttribute("disabled", "");
        document.getElementById("sign-out-button").removeAttribute("disabled");

        document.getElementById("game-mode-online").removeAttribute("disabled");
        document.getElementById("mmr-score-text").innerText = user.MMR;


        document.getElementById("welcome-username").innerText = user.Username;
        document.getElementById("welcome-avatar").src = user.Avatar;
        document.querySelector('.welcome-avatar').addEventListener('click', () => {
            window.open(`/Profile/profile.html?username=${user.Username}`);
        });
        document.querySelector('.welcome-container').classList.add("connected");

        getRank(user.MMR).then(data => {
            document.getElementById("mmr-icon-rank").src = "../Assets/" + data.Rank + "_Rank_600x600.png";
        });
    }
}

function userDisconnected() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");

    document.getElementById("toggle-social-menu").classList.add("hidden");
    if (socialSocket) socialSocket.disconnect();

    if (window.location.pathname === "/Home/home.html") {
        document.getElementById("game-mode-online").setAttribute("disabled", "");

        document.querySelector('.welcome-container').classList.remove("connected");
    }
}

function baseUrl() {
    return window.location.protocol + '//' + (window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host);
}