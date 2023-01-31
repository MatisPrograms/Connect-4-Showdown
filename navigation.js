const game_url = '../Game/game.html';
const home_url = '../Home/home.html';

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