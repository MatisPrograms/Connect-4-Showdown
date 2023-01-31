function updateMessageObserver() {
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

window.addEventListener('load', function () {

    updateMessageObserver();

    // Chat Menu Animations
    const toggleChatMenuButton = document.getElementById('toggle-chat-menu');
    toggleChatMenuButton.addEventListener('click', function () {
        document.getElementById('left-sidebar').classList.toggle('open')
        if (document.getElementById('toggle-chat-menu').classList.toggle('open')) {
            toggleChatMenuButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        } else {
            toggleChatMenuButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        }
    });

    document.getElementById("chat-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            addMessage();
        }
    });
});

function addMessage() {
    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message', 'message-hidden');
    chatMessage.innerHTML = `
            <div class="chat-avatar">
                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">
                Me
            </div>
            <div class="chat-message-text">
                ${document.getElementById('chat-input').value}
            </div>
    `;
    document.getElementById('chat-messages').appendChild(chatMessage);
    document.getElementById('chat-input').value = '';

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    updateMessageObserver();
}

class Chat extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <aside class="sidebar" id="left-sidebar">
                <link href="../../SideMenus/Chat/chat.css" rel="stylesheet">
                <link href="../../SideMenus/layout.css" rel="stylesheet">
                <div class="sidebar-header">Chat</div>
                <div class="chat-container">
                    <div id="chat-messages" class="chat-messages">
                        <div class="chat-message message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">
                                Me
                            </div>
                            <div class="chat-message-text">
                                Hello You!
                            </div>
                        </div>
                        <div class="chat-message other message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">
                                You
                            </div>
                            <div class="chat-message-text">
                                Hello Me!
                            </div>
                        </div>
                        <div class="chat-message message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">
                                Me
                            </div>
                            <div class="chat-message-text">
                                How are you?
                            </div>
                        </div>
                        <div class="chat-message other message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">
                                You
                            </div>
                            <div class="chat-message-text">
                                I'm fine, thanks!
                            </div>
                        </div>
                        <div class="chat-message other message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">
                                You
                            </div>
                            <div class="chat-message-text">
                                And you?
                            </div>
                        </div>
                        <div class="chat-message message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">
                                Me
                            </div>
                            <div class="chat-message-text">
                                I'm fine too, thanks!
                            </div>
                        </div>
                        <div class="chat-message message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">
                                Me
                            </div>
                            <div class="chat-message-text">
                                Want to play a game of Connect 4?
                            </div>
                        </div>
                        <div class="chat-message other message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">
                                You
                            </div>
                            <div class="chat-message-text">
                                Sure!
                            </div>
                        </div> 
                    </div>
                    <div class="chat-input-container">
                        <textarea id="chat-input" class="chat-input" placeholder="Message" rows="1"></textarea>
                        <div class="chat-send-icon" onclick="addMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </div>
                    </div>
                </div>
            </aside>
            <span>
                <button class="drawer-toggle-button" id="toggle-chat-menu">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </span>
    `;
    };
}

customElements.define('app-chat', Chat);