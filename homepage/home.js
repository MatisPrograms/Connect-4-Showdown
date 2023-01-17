function openSignInMenu() {
    if (document.getElementById('sign-in-pop-up').classList.toggle('opened')) {
        document.getElementById('sign-in-pop-up').style.display = 'block';
    } else {
        document.getElementById('sign-in-pop-up').style.display = 'none';
    }
}

function playLocal1v1() {
    console.log('Local 1v1');
}

function playVsAI() {
    console.log('Vs AI');
}

function playRankedOnline() {
    console.log('Ranked Online');
}

function toggleDrawer() {
    if (document.getElementById('drawer-content').classList.toggle('opened')) {
        document.getElementById('drawer-content').style.display = 'block';
    } else {
        document.getElementById('drawer-content').style.display = 'none';
    }
}

function toggleLogin() {
    if (!document.getElementById('loginTab').classList.contains('active')) {
        document.getElementById('loginTab').classList.toggle('active');
        document.getElementById('registerTab').classList.toggle('active');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    }
}

function toggleRegister() {
    if (!document.getElementById('registerTab').classList.contains('active')) {
        document.getElementById('registerTab').classList.toggle('active');
        document.getElementById('loginTab').classList.toggle('active');
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    }
}

function verifyUsername() {
    for (const input of document.getElementsByClassName("form-control")) {
        if (input.type === "text") {
            if (input.value.length > 4 && !input.value.match(/[^a-zA-Z0-9]/g)) {
                input.classList.add("is-valid");
                input.classList.remove("is-invalid");
            } else {
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            }
        }
    }
}

function verifyEmail() {
    for (const input of document.getElementsByClassName("form-control")) {
        if (input.type === "email") {
            if (input.value.length > 4 && input.value.includes("@") && input.value.includes(".") && input.value.indexOf("@") > 0 && input.value.indexOf(".") > input.value.indexOf("@") + 1 && input.value.indexOf(".") < input.value.length - 1) {
                input.classList.add("is-valid");
                input.classList.remove("is-invalid");
            } else {
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            }
        }
    }
}

function verifyPassword() {
    for (const input of document.getElementsByClassName("form-control")) {
        if (input.type === "password") {
            if (input.value.length > 7 && input.value.match(/[A-Z]/g) && input.value.match(/[a-z]/g) && input.value.match(/[0-9]/g) && input.value.match(/[^a-zA-Z0-9]/g)) {
                input.classList.add("is-valid");
                input.classList.remove("is-invalid");
            } else {
                input.classList.add("is-invalid");
                input.classList.remove("is-valid");
            }
        }
    }
}