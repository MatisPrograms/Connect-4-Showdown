const home_url = '../Home/home.html';
const game_url = '../Game/game.html';
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
switch (mode) {
    case '1v1':
        console.log('1v1');
        break;
    case 'AI':
        console.log('AI');
        document.getElementById("ai-modes").style.opacity = "1";
        break;
    case 'Online':
        console.log('Online');
        break;
    default:
        // home();
}

function home() {
    if (!window.location.href.includes(home_url.replace('../', ''))) window.location.href = home_url;
}

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
    window.location.href = game_url + '?mode=Online';
}