function updateConversationMessages() {
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

    updateConversationMessages();

    document.getElementById("conversation-chat-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendConversationMessage();
        }
    });

    socialSocket.on('conversation', (username, data) => {
        document.getElementById('conversation-chat-messages').innerHTML = '';

        const chatBox = document.querySelector('.chat-box');
        chatBox.classList.add('open');
        chatBox.querySelector('.chat-box-header span').innerHTML = username;
        for (const message of data.Messages) {
            const you = message.Sender.toLowerCase() === user.Username.toLowerCase();
            addConversationMessage(
                you,
                you ? data.You : data.Them,
                message.Message
            );
        }
    });

    socialSocket.on('receiveMessage', (data) => {
        const you = data.User.Username.toLowerCase() === user.Username.toLowerCase();
        addConversationMessage(you, data.User, data.Message)
    });
});

function closeChat() {
    document.querySelector('.chat-box.open').classList.remove('open');
    document.querySelector(".chat-box").style.display = "none";
}

function addConversationMessage(you, player, message) {
    const input = document.getElementById('conversation-chat-input');
    if (input.value === '' && !message) return;

    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message', 'message-hidden');
    if (!you) chatMessage.classList.add('other');
    chatMessage.innerHTML = `
            <div class="chat-avatar">
                <img alt="Avatar" src="${player.Avatar}">
                <span>${player.Username}</span>
            </div>
            <div class="chat-message-text">
                ${message ? message : input.value}
            </div>
    `;

    const chatMessages = document.getElementById('conversation-chat-messages');

    chatMessages.appendChild(chatMessage);
    if (you) input.value = '';

    updateConversationMessages();
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 250);
}

function sendConversationMessage() {
    const message = document.getElementById('conversation-chat-input').value;
    if (message) socialSocket.emit('sendMessage',
        user.Username,
        document.querySelector('.chat-box-header span').textContent,
        message);
}

class ConversationChat extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <link href="../../SideMenus/Chat/chat.css" rel="stylesheet">
            <link href="../../SideMenus/Chat/conversation-chat.css" rel="stylesheet">
            <div class="chat-box">
                <div class="chat-box-header">
                <i class="fas fa-times" onclick="closeChat()"></i>
                <span>Username</span>
                </div>
                <div class="chat-container">
                    <div id="conversation-chat-messages" class="chat-messages">
<!--                        <div class="chat-message message-hidden">-->
<!--                            <div class="chat-avatar">-->
<!--                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/matis">-->
<!--                                Me-->
<!--                            </div>-->
<!--                            <div class="chat-message-text">-->
<!--                                This is me talking!-->
<!--                            </div>-->
<!--                        </div>-->
<!--                        <div class="chat-message other message-hidden">-->
<!--                            <div class="chat-avatar">-->
<!--                                <img alt="Avatar" src="https://source.boringavatars.com/beam/50/is">-->
<!--                                Him-->
<!--                            </div>-->
<!--                            <div class="chat-message-text">-->
<!--                                This is him talking!-->
<!--                            </div>-->
<!--                        </div>-->
                    </div>
                    <div class="chat-input-container">
                        <textarea id="conversation-chat-input" class="chat-input" placeholder="Message" rows="1"></textarea>
                        <div class="chat-send-icon" onclick="sendConversationMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('app-conversation-chat', ConversationChat);
