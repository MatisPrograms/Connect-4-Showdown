function openSignInMenu() {
    if (document.getElementById('sign-in-pop-up').classList.toggle('opened')) {
        document.getElementById('sign-in-pop-up').style.display = 'block';
    } else {
        document.getElementById('sign-in-pop-up').style.display = 'none';
    }
}

function toggleDrawer() {
    if (document.getElementById('drawer-content').classList.toggle('opened')) {
        document.getElementById('drawer-content').style.display = 'block';
    } else {
        document.getElementById('drawer-content').style.display = 'none';
    }
}