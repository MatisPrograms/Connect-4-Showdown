const defaultSize = 1920 * 1080;

function applyScale() {
    const appCover = document.getElementById('app-cover');
    let scale = window.innerWidth * window.innerHeight / defaultSize;
    if (window.innerHeight > window.innerWidth) scale = window.innerHeight * window.innerHeight / defaultSize;
    appCover.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', () => {
    applyScale();
});

class musicPlayer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `

        <link href="../Music/music-dark.css" rel="stylesheet">
        <audio id="HubMusic"></audio>
        <div id="app-cover">
            <div id="player">
                <div id="player-track">
                    <div id="track-name"></div>
                    <div id="album-name"></div>
                    <div id="track-time">
                        <div id="current-time"></div>
                        <div id="track-length"></div>
                    </div>
                    <div id="s-area">
                        <div id="ins-time"></div>
                        <div id="s-hover"></div>
                        <div id="seek-bar"></div>
                    </div>
                </div>
                <div id="player-content">
                    <div id="album-art">
                        <div id="buffer-box">Buffering ...</div>
                    </div>
                    <div id="player-controls">
                        <div class="control">
                            <div class="button" id="play-previous">
                                <i class="fas fa-backward"></i>
                            </div>
                        </div>
                        <div class="control">
                            <div class="button" id="play-pause-button">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="control">
                            <div class="button" id="play-next">
                                <i class="fas fa-forward"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        applyScale();
    }
}

customElements.define('music-player', musicPlayer);