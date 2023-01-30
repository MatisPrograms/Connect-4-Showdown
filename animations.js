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


// Social Menu Animations
const toggleSocialMenuButton = document.getElementById('toggle-social-menu');

toggleSocialMenuButton.addEventListener('click', function () {
    document.getElementById('right-sidebar').classList.toggle('open')
    if (document.getElementById('toggle-social-menu').classList.toggle('open')) {
        toggleSocialMenuButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
    } else {
        toggleSocialMenuButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
    }
});
