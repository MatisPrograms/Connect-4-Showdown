let unreadMessages = 0;

function updateLiveMessages() {
    // Message Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('message-shown');
            } else {
                entry.target.classList.remove('message-shown');
            }
        });
    });

    // Observe all messages
    const hiddenElements = document.querySelectorAll('.message-hidden');
    hiddenElements.forEach((element) => {
        observer.observe(element);
    });
}

onPageReady(() => {

    updateLiveMessages();

    // LiveChat Menu Animations
    const toggleChatMenuButton = document.getElementById('toggle-chat-menu');
    toggleChatMenuButton.addEventListener('click', function () {
        document.getElementById('left-sidebar').classList.toggle('open')
        if (document.getElementById('toggle-chat-menu').classList.toggle('open')) {
            toggleChatMenuButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        } else {
            toggleChatMenuButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        }
        if (unreadMessages > 0) unreadMessages = 0;
    });

    document.getElementById("live-chat-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendLiveMessage();
        }
    });

    socket.on('receiveMessage', (data) => {
        const you = data.Username.toLowerCase() === user.Username.toLowerCase();
        const menu = document.getElementById('toggle-chat-menu');
        if (!you && !menu.classList.contains('open')) {
            unreadMessages++;
            const notificationMessage = unreadMessages < 100 ? unreadMessages : '99+';
            if (unreadMessages > 1) {
                const notification = document.querySelector('.notification');
                notification.innerHTML = notificationMessage;
                if (unreadMessages > 99) notification.style.fontSize = '0.75rem';
            } else {
                const notification = document.createElement('div');
                notification.classList.add('notification');
                notification.innerHTML = unreadMessages;
                menu.appendChild(notification);
            }
        }
        addLiveMessage(you, data.Message)
    });
});

function addLiveMessage(you, message) {
    const input = document.getElementById('live-chat-input');
    if (input.value === '' && !message) return;
    const isPlayer1 = player1.Username.toLowerCase() === user.Username.toLowerCase();
    const youPlayer = you ? isPlayer1 ? player1 : player2 : isPlayer1 ? player2 : player1;

    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message', 'message-hidden');
    if (!you) chatMessage.classList.add('other');
    chatMessage.innerHTML = `
            <div class="chat-avatar">
                <img alt="Avatar" src="${youPlayer.Avatar}">
                ${youPlayer.Username}
            </div>
            <div class="chat-message-text">
                ${message ? message : input.value}
            </div>
    `;

    const chatMessages = document.getElementById('live-chat-messages');

    chatMessages.appendChild(chatMessage);
    if (you) input.value = '';

    updateLiveMessages();
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 250);
}

function sendLiveMessage() {
    const message = document.getElementById('live-chat-input').value;
    if (message) socket.emit('sendMessage', user.Username, message);
}

class LiveChat extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <link href="../../SideMenus/Chat/chat.css" rel="stylesheet">
            <link href="../../SideMenus/Chat/live-chat.css" rel="stylesheet">
            <link href="../../SideMenus/layout.css" rel="stylesheet">
            <aside id="left-sidebar">
                <div class="drawer-toggle-button hidden" id="toggle-chat-menu">
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="sidebar">
                    <div class="sidebar-header">Chat</div>
                    <div class="chat-container">
                        <div id="live-chat-messages" class="chat-messages">
<!--                            <div class="chat-message message-hidden">-->
<!--                                <div class="chat-avatar">-->
<!--                                    <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">-->
<!--                                    Me-->
<!--                                </div>-->
<!--                                <div class="chat-message-text">-->
<!--                                    This is me talking!-->
<!--                                </div>-->
<!--                            </div>-->
<!--                            <div class="chat-message other message-hidden">-->
<!--                                <div class="chat-avatar">-->
<!--                                    <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">-->
<!--                                    Him-->
<!--                                </div>-->
<!--                                <div class="chat-message-text">-->
<!--                                    This is him talking!-->
<!--                                </div>-->
<!--                            </div>-->
                        </div>
                        <div class="chat-input-container">
                            <textarea id="live-chat-input" class="chat-input" placeholder="Message" rows="1"></textarea>
                            <div class="chat-send-icon" onclick="sendLiveMessage()">
                                <i class="fas fa-paper-plane"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
    `;
    };
}

customElements.define('app-live-chat', LiveChat);