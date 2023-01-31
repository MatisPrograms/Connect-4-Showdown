window.addEventListener('load', function () {

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
});

class Chat extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <aside class="sidebar" id="left-sidebar">
                <link href="../../SideMenus/Chat/chat.css" rel="stylesheet">
                <div class="sidebar-header">Chat</div>
                <div class="chat-container">
                    <div class="chat-messages">
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
                        <div class="chat-message message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">
                                Me
                            </div>
                            <div class="chat-message-text">
                                I'll start!
                            </div>
                        </div>
                        <div class="chat-message other message-hidden">
                            <div class="chat-avatar">
                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">
                                You
                            </div>
                            <div class="chat-message-text">
                                I'll go first!
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <textarea class="chat-input" placeholder="Message" rows="1"></textarea>
                        <div class="chat-send-icon">
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