let deviceReady = true;

const isCordova = () => window.hasOwnProperty('cordova');
document.addEventListener("deviceready", () => {
    deviceReady = true
    StatusBar.overlaysWebView(false);
});

function onPageReady(callback) {
    window.addEventListener("load", callback);
}

function debounce(immediate, later, wait, ready) {
    let timeout;
    return () => {
        const context = this;
        const args = arguments;
        const callNow = ready && !timeout;

        clearTimeout(timeout);
        immediate.apply(context, args);
        timeout = setTimeout(() => {
            timeout = null;
            if (!ready) later.apply(context, args);
        }, wait);
        if (callNow) later.apply(context, args);
    };
}

const songPath = "../Assets/Music/"
let playlistSongs = [];
let playlistName = "";
let albumArtworks = [];
let currentCordovaMediaStatus;

function choosePlaylist(name) {
    playlistSongs = [];
    playlistName = name + "/";

    fetch(baseUrl() + '/api/playlist?name=' + name, {
        method: 'GET',
    }).then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    }).then(data => {
        playlistSongs = data.songs.map(song => {
            if (song.split('.').length <= 1) song += '.mp3';
            return song;
        });

        const loadingPlayer = setInterval(() => {
            const songArt = document.getElementById('album-art');
            if (songArt) {
                clearInterval(loadingPlayer);

                playlistSongs.forEach(song => {
                    const img = document.createElement('img');
                    img.id = `art_${playlistSongs.indexOf(song)}`;
                    img.src = `${baseUrl()}/api/avatar?name=${song}&colors=${randomColour()},${randomColour()},${randomColour()},${randomColour()},${randomColour()}`;
                    songArt.appendChild(img);

                    albumArtworks.push(img.id)
                });

                // Set first song as active
                document.getElementById(`art_0`).classList.add('active');
            }
        });
    });
}

const mediaVerbose = false;
const onMediaSuccess = (success) => mediaVerbose ? console.log("Success:", success) : {};
const onMediaError = (error) => mediaVerbose ? console.log("Error:", error) : {};
const onMediaChangeStatus = (status) => {
    currentCordovaMediaStatus = Media.MEDIA_MSG[status];
    mediaVerbose ? console.log("Status:", currentCordovaMediaStatus) : {};
}
