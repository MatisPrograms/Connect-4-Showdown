const socialSocket = io(window.location.origin + '/api/social', {
    auth: {
        token: localStorage.getItem('jwt_token')
    }
});


let unreadNotifications = 0;
let socialSocketRetries = 10;

socialSocket.on('connect', () => {
    console.log("Connected to social socket server");
});

socialSocket.on('update', () => {
    socialSocket.emit('update', {
        token: localStorage.getItem('jwt_token'),
        recursive: false
    })
});

socialSocket.on('friends', (friends) => {
    buildFriendList(friends);
});

socialSocket.on('recent', (recent) => {
    buildRecentList(recent);
});

socialSocket.on('notifications', (notifications) => {
    const menu = document.getElementById('toggle-social-menu');
    unreadNotifications = notifications.length;
    if (!menu.classList.contains('open')) {
        if (unreadNotifications > 1) {
            const notification = document.querySelector('#right-sidebar .notification');
            notification.innerHTML = unreadNotifications < 100 ? unreadNotifications : '99+';
            if (unreadNotifications > 99) notification.style.fontSize = '0.75rem';
        } else {
            const notification = document.createElement('div');
            notification.classList.add('notification');
            notification.innerHTML = unreadNotifications;
            menu.appendChild(notification);
        }
    }

    const tab = document.getElementsByClassName('social-menu-tab')[2];
    if (unreadNotifications > 0) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.innerHTML = unreadNotifications < 100 ? unreadNotifications : '99+';
        if (unreadNotifications > 99) notification.style.fontSize = '0.75rem';
        tab.appendChild(notification);
    } else {
        const notification = tab.querySelector('.notification');
        if (notification) notification.remove();
    }

    buildNotificationList(notifications);
});

socialSocket.on('challenge', (challenge) => {
    window.location.href = '../Game/game.html?mode=Casual&challenge=' + challenge;
});

socialSocket.on('error', (error) => {
    console.log(error);
    const addFriendInput = document.getElementsByClassName('social-list-add-friend')[0];

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.innerHTML = error;
    addFriendInput.appendChild(errorMessage);
    setTimeout(() => {
        addFriendInput.removeChild(errorMessage);
    }, 3000);
});

socialSocket.on('disconnect', () => {
    console.log("Disconnected from social socket server");
    if (socialSocketRetries > 0) {
        setTimeout(() => {
            socialSocketRetries--;
            socialSocket.connect();
        }, 1000);
    }
});

function addFriend() {
    const input = document.getElementById('add-friend-input');
    const friend = input.value.replaceAll(' ', '').replaceAll('\n', '');
    if (friend) socialSocket.emit('addFriend', friend);
    input.value = '';
}

function updateSocialSearch() {
    document.getElementById('add-friend-input').addEventListener('keydown', (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            addFriend();
        }
    });
}

function updateSocialButtons(buttons) {
    for (const button of buttons) {
        button.addEventListener('click', () => {
            const classes = button.querySelector('i').classList;
            let event = ''

            if (classes.contains('fa-comment')) {
                event = 'conversation';
                document.querySelector(".chat-box").style.display = "block";
            }
            else if (classes.contains('fa-fist-raised')) event = 'challenge';
            else {
                const index = Array.from(document.querySelectorAll('.social-list')).indexOf(document.querySelector('.social-list.active'))
                if (classes.contains('fa-plus')) {
                    if (index === 1) event = 'addFriend';
                    else event = 'acceptNotification';
                }
                if (classes.contains('fa-times')) {
                    if (index === 0) event = 'removeFriend';
                    else event = 'declineNotification';
                }
            }

            const username = button.closest('.social-list-item').querySelector('.social-list-item-name').textContent
            if (event.includes('Notification')) socialSocket.emit(event, {
                Type: button.closest('.social-list-item').querySelector('.social-list-item-sub').textContent,
                User: username
            });
            else socialSocket.emit(event, username);
        });
    }
}

function buildFriendList(friends) {
    const friendList = document.getElementsByClassName('social-list')[0];
    friendList.innerHTML = `
        <div class="social-list-add-friend">
            <label class="social-list-add-friend-label">Add Friend</label>
            <span>
                <input id="add-friend-input" class="social-list-add-friend-input" placeholder="Enter friend's Username" type="text">
                <i class="fas fa-paper-plane" onclick="addFriend()"></i>
            </span>
        </div>
    `;
    updateSocialSearch();

    if (!friends || JSON.stringify(friends) === JSON.stringify({}) || friends.length === 0) return;
    const buttons = `
        <div class="social-list-item-buttons">
            <button class="social-list-item-button"><i class="fas fa-comment"></i></button>
            <button class="social-list-item-button"><i class="fas fa-fist-raised"></i></button>
            <button class="social-list-item-button"><i class="fas fa-times"></i></button>
        </div>
    `;

    for (const player of friends) {
        friendList.appendChild(buildItem(
            player.User.Avatar,
            player.User.Username,
            player.User.MMR,
            buttons,
            player.Status === 'Online'));
    }

    updateSocialButtons(friendList.querySelectorAll('.social-list-item-button'));
}

function buildRecentList(recent) {
    const recentList = document.getElementsByClassName('social-list')[1];
    recentList.innerHTML = ``;

    if (!recent || JSON.stringify(recent) === JSON.stringify({}) || recent.length === 0) return;
    const buttons = `
        <div class="social-list-item-buttons">
            <button class="social-list-item-button"><i class="fas fa-fist-raised"></i></button>
            <button class="social-list-item-button"><i class="fas fa-plus"></i></button>
        </div>
    `;

    for (const player of recent) {
        recentList.appendChild(buildItem(
            player.User.Avatar,
            player.User.Username,
            player.User.MMR,
            buttons,
            player.Status === 'Online'));
    }

    updateSocialButtons(recentList.querySelectorAll('.social-list-item-button'));
}

function buildNotificationList(notifications) {
    const notificationList = document.getElementsByClassName('social-list')[2];
    notificationList.innerHTML = '';

    if (!notifications || JSON.stringify(notifications) === JSON.stringify({}) || notifications.length === 0) return;
    const buttons = `
        <div class="social-list-item-buttons">
            <button class="social-list-item-button"><i class="fas fa-plus"></i></button>
            <button class="social-list-item-button"><i class="fas fa-times"></i></button>
        </div>
    `;

    for (const notification of notifications) {
        notificationList.appendChild(buildItem(
            notification.User.Avatar,
            notification.User.Username,
            notification.Type,
            buttons,
            notification.Status === 'Online'));
    }

    updateSocialButtons(notificationList.querySelectorAll('.social-list-item-button'));
}

function buildItem(avatar, name, sub, buttons, online) {
    const listItem = document.createElement('div');
    listItem.classList.add('social-list-item');
    listItem.innerHTML = `
        <div class="social-list-item-avatar">
            <img alt="Avatar" src="${avatar}">
            <div class="status${online ? "" : " offline"}"></div>
        </div>
        <div class="social-list-item-player">
            <div class="social-list-item-name">${name}</div>
            <div class="social-list-item-sub">${sub}</div>
        </div>
        ${buttons}
    `;
    listItem.querySelector('img').addEventListener('click', () => {
        window.open(`/Profile/profile.html?username=${name}`);
    });
    return listItem;
}

onPageReady(() => {

    // Social Menu Animations
    const toggleSocialMenuButton = document.getElementById('toggle-social-menu');
    toggleSocialMenuButton.addEventListener('click', () => {
        document.getElementById('right-sidebar').classList.toggle('open');
        if (document.getElementById('toggle-social-menu').classList.toggle('open')) {
            toggleSocialMenuButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
        } else {
            toggleSocialMenuButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
        }
    });

    // Toggle social tabs
    const socialTabs = document.getElementsByClassName('social-menu-tab');
    for (const tab of socialTabs) {
        tab.addEventListener("click", () => {
            const tabIndex = Array.from(socialTabs).indexOf(tab);
            for (const otherTab of socialTabs) {
                if (tab.innerHTML !== otherTab.innerHTML && otherTab.classList.contains("active-tab")) {
                    tab.classList.toggle("active-tab");
                    otherTab.classList.toggle("active-tab");

                    document.getElementsByClassName('social-content-title')[0].innerHTML = tab.innerHTML.toLowerCase().includes('friends') ? 'Friends' : tab.innerHTML.toLowerCase().includes('clock') ? 'Recent' : 'Notifications';

                    const socialLists = document.getElementsByClassName('social-list');
                    for (const socialList of socialLists) {
                        socialList.scrollTop = 0;
                        if (tabIndex === Array.from(socialLists).indexOf(socialList)) {
                            socialList.classList.add('active');
                        } else {
                            socialList.classList.remove('active');
                        }
                    }
                    break;
                }
            }
        });
    }

    updateSocialSearch();
    updateSocialButtons(document.getElementsByClassName('social-list-item-button'));
});

class Social extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <link href="../../SideMenus/Social/social.css" rel="stylesheet">
            <link href="../../SideMenus/layout.css" rel="stylesheet">
            
            <aside id="right-sidebar">
                <div class="drawer-toggle-button hidden" id="toggle-social-menu">
                    <i class="fas fa-chevron-left"></i>
                </div>
                <div class="sidebar">
                    <div class="sidebar-header">Social</div>
                    <div class="social-container">
                            <ul class="social-navigation">
                                <li>
                                    <a class="social-menu-tab active-tab"><i class="fas fa-user-friends"></i></a>
                                </li>
                                <li>
                                    <a class="social-menu-tab"><i class="fas fa-user-clock"></i></a>
                                </li>
                                <li>
                                    <a class="social-menu-tab"><i class="fas fa-bell"></i></a>
                                </li>
                            </ul>
                        <div class="social-content">
                            <div class="social-content-title">Friends</div>
                            <div class="social-lists">
                                <div class="social-list active">
                                    <div class="social-list-add-friend">
                                        <label class="social-list-add-friend-label">Add Friend</label>
                                        <span>
                                            <input id="add-friend-input" class="social-list-add-friend-input" placeholder="Enter friend's Username" type="text">
                                            <i class="fas fa-paper-plane" onclick="addFriend()"></i>
                                        </span>
                                    </div>
<!--                                   <div class="social-list-item">-->
<!--                                        <div class="social-list-item-avatar">-->
<!--                                            <img alt="Avatar" src="https://source.boringavatars.com/beam/50/avatar">-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-player">-->
<!--                                            <div class="social-list-item-name">John</div>-->
<!--                                            <div class="social-list-item-sub">15320</div>-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-buttons">-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-comment"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-fist-raised"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-times"></i></button>-->
<!--                                        </div>-->
<!--                                   </div>-->
<!--                                   <div class="social-list-item">-->
<!--                                        <div class="social-list-item-avatar">-->
<!--                                            <img alt="Avatar" src="https://source.boringavatars.com/beam/50/avatar">-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-player">-->
<!--                                            <div class="social-list-item-name">John Doe</div>-->
<!--                                            <div class="social-list-item-sub">15320</div>-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-buttons">-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-comment"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-fist-raised"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-times"></i></button>-->
<!--                                        </div>-->
<!--                                   </div>-->
<!--                                   <div class="social-list-item">-->
<!--                                        <div class="social-list-item-avatar">-->
<!--                                            <img alt="Avatar" src="https://source.boringavatars.com/beam/50/avatar">-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-player">-->
<!--                                            <div class="social-list-item-name">John Doe</div>-->
<!--                                            <div class="social-list-item-sub">15320</div>-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-buttons">-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-comment"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-fist-raised"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-times"></i></button>-->
<!--                                        </div>-->
<!--                                   </div>-->
                                </div>
                                <div class="social-list">
<!--                                    <div class="social-list-item">-->
<!--                                        <div class="social-list-item-avatar">-->
<!--                                            <img alt="Avatar" src="https://source.boringavatars.com/beam/50/avatar">-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-player">-->
<!--                                            <div class="social-list-item-name">Hyipercool</div>-->
<!--                                            <div class="social-list-item-sub">11530</div>-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-buttons">-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-fist-raised"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-plus"></i></button>-->
<!--                                        </div>-->
<!--                                   </div>-->
                                </div>
                                <div class="social-list">
<!--                                    <div class="social-list-item">-->
<!--                                        <div class="social-list-item-avatar">-->
<!--                                            <img alt="Avatar" src="https://source.boringavatars.com/beam/50/avatar">-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-player">-->
<!--                                            <div class="social-list-item-name">Johno Doo</div>-->
<!--                                            <div class="social-list-item-sub">Friend Request</div>-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-buttons">-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-plus"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-times"></i></button>-->
<!--                                        </div>-->
<!--                                   </div>-->
<!--                                   <div class="social-list-item">-->
<!--                                        <div class="social-list-item-avatar">-->
<!--                                            <img alt="Avatar" src="https://source.boringavatars.com/beam/50/avatar">-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-player">-->
<!--                                            <div class="social-list-item-name">Joo Boo</div>-->
<!--                                            <div class="social-list-item-sub">Challenge</div>-->
<!--                                        </div>-->
<!--                                        <div class="social-list-item-buttons">-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-plus"></i></button>-->
<!--                                            <button class="social-list-item-button"><i class="fas fa-times"></i></button>-->
<!--                                        </div>-->
<!--                                   </div>-->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    }
}

customElements.define('app-social', Social);
