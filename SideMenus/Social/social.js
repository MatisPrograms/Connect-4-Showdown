window.addEventListener('load', function () {

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

});

class Social extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <aside class="sidebar" id="right-sidebar">
                <link href="../../SideMenus/Social/social.css" rel="stylesheet">
                <div class="sidebar-header">Friends</div>
                <ul class="friends-list">
                    <!-- Friend list items here -->
                </ul>
            </aside>
            <span>
                <button class="drawer-toggle-button" id="toggle-social-menu">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </span>
        `;
    }
}

customElements.define('app-social', Social);