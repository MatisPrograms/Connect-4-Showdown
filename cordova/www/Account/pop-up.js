function randomColour() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function closePopUp() {
    document.getElementsByClassName("pop-up-container")[0].classList.add("hidden");
    document.getElementById("focus").classList.add("hidden");
    document.getElementById("sign-in-button").classList.remove("hidden");
}

function verifyUsernameFormat(input) {
    if (input && input.value && input.value.length > 3 && !input.value.match(/[^a-zA-Z0-9]/g)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
    } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    }
}

function verifyEmailFormat(input) {
    if (input.id === "register-confirm-email-input" && input.value !== document.getElementById("register-email-input").value) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    } else if (input && input.value && input.value.length > 4 && /\S+@\S+\.\S+/.test(input.value)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
    } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    }
}

function verifyPasswordFormat(input) {
    if (input.id === "register-confirm-password-input" && input.value !== document.getElementById("register-password-input").value) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    } else if (input && input.value && input.value.length > 7 && input.value.match(/[A-Z]/g) && input.value.match(/[a-z]/g) && input.value.match(/[0-9]/g) && input.value.match(/[^a-zA-Z0-9]/g)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
    } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    }
}

function verifyAvatarSelected() {
    const avatars = document.getElementsByClassName("active-avatar")
    if (avatars.length === 0) {
        const randomAvatar = document.getElementsByClassName("avatar-preview")[Math.floor(Math.random() * document.getElementsByClassName("avatar-preview").length)];
        randomAvatar.classList.add("active-avatar");
    }
}

onPageReady(() => {

    // Sign in button
    document.getElementById("sign-in-button").addEventListener("click", () => {
        document.getElementById("sign-in-button").classList.add("hidden");
        document.getElementById("focus").classList.remove("hidden");
        document.getElementById("sign-in-pop-up").classList.remove("hidden");

        const avatarGroup = Array.from(document.getElementsByClassName("form-group")).pop();

        // check if avatarGroup has a div with class avatar-container
        if (!avatarGroup.lastElementChild.classList.contains("avatar-container")) {
            const avatars = document.createElement("div");
            avatars.classList.add("avatar-container");
            avatars.innerHTML = generatesAvatars();

            avatarGroup.appendChild(avatars);

            // Make avatars selectable
            for (const avatar of document.getElementsByClassName("avatar-preview")) {
                avatar.addEventListener("click", () => {
                    for (const otherAvatar of document.getElementsByClassName("avatar-preview")) {
                        otherAvatar.classList.remove("active-avatar");
                    }
                    avatar.classList.toggle("active-avatar");
                });
            }
        }
    });

    // Sign out button
    document.getElementById("sign-out-button").addEventListener("click", () => {
        document.getElementById("sign-in-button").removeAttribute("disabled");
        document.getElementById("sign-out-button").setAttribute("disabled", "");

        localStorage.removeItem("jwt_token");
        localStorage.removeItem("jwt_refresh");
        localStorage.removeItem("user");
        userUpdate();
    });

    // Create account shortcut
    document.getElementById("create-account-shortcut").addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementsByClassName("pop-up-tab")[1].click();
    });

    // Toggle pop-up tabs
    for (const tab of document.getElementsByClassName("pop-up-tab")) {
        tab.addEventListener("click", function () {
            for (const otherTab of document.getElementsByClassName("pop-up-tab")) {
                if (tab.innerHTML !== otherTab.innerHTML && otherTab.classList.contains("active-tab")) {
                    tab.classList.toggle("active-tab");
                    otherTab.classList.toggle("active-tab");
                    for (const tabPane of document.getElementsByClassName("tab-pane")) {
                        tabPane.classList.toggle("active-form");
                    }
                }
            }
        });
    }

    // Close Pop-up when clicking outside of it
    document.addEventListener("mouseup", (e) => {
        if (!document.getElementById('sign-in-pop-up').classList.contains("hidden") && !document.getElementById("focus").classList.contains("hidden") && e.target.id !== "sign-in-button" && !e.target.closest(".pop-up-container")) {
            closePopUp();
        }
    });

    // Make input in form validation dynamic
    for (const input of document.getElementsByClassName("form-control")) {
        input.addEventListener("input", () => {
            if (input.value.length === 0) {
                input.classList.remove("is-valid");
                input.classList.remove("is-invalid");
            } else {
                switch (input.type) {
                    case "text":
                        verifyUsernameFormat(input);
                        break;
                    case "email":
                        verifyEmailFormat(input);
                        break;
                    case "password":
                        verifyPasswordFormat(input);
                        break;
                }
            }
        });
    }

    // On Login button click
    document.getElementById('login-submit-button').addEventListener('click', event => {
        event.preventDefault();

        // Check if email and password are valid
        const emailInput = document.getElementById("login-email-input");
        const passwordInput = document.getElementById("login-password-input");
        verifyEmailFormat(emailInput);
        verifyPasswordFormat(passwordInput);

        if (emailInput.classList.contains("is-valid") && passwordInput.classList.contains("is-valid")) {
            fetch(baseUrl() + '/api/login', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
                    email: document.getElementById('login-email-input').value.replace(/\s/g, ''),
                    password: document.getElementById('login-password-input').value.replace(/\s/g, '')
                })
            }).then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            }).then(data => {
                localStorage.setItem("jwt_token", data.token);
                localStorage.setItem("user", JSON.stringify(JSON.parse(data.user)));
                userUpdate();
                closePopUp();
            }).catch(() => {
                const button = document.getElementById('login-submit-button')
                button.classList.add('error');
                setTimeout(() => {
                    button.classList.remove('error');
                }, 350);
            });
        } else {
            console.log("Invalid Login");
        }
    });

    // On Register button click
    document.getElementById('register-submit-button').addEventListener('click', event => {
        event.preventDefault();

        // Check if username, email, password and confirm password are valid
        const usernameInput = document.getElementById("register-username-input");
        const emailInput = document.getElementById("register-confirm-email-input");
        const passwordInput = document.getElementById("register-confirm-password-input");
        verifyUsernameFormat(usernameInput);
        verifyEmailFormat(emailInput);
        verifyPasswordFormat(passwordInput);
        verifyAvatarSelected()

        if (usernameInput.classList.contains("is-valid") && emailInput.classList.contains("is-valid") && passwordInput.classList.contains("is-valid")) {
            fetch(baseUrl() + '/api/signup', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
                    username: document.getElementById('register-username-input').value.replace(/\s/g, ''),
                    email: document.getElementById('register-email-input').value.replace(/\s/g, ''),
                    password: document.getElementById('register-password-input').value.replace(/\s/g, ''),
                    avatar: document.getElementsByClassName("active-avatar")[0].getElementsByTagName("img")[0].src
                })
            }).then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            }).then(data => {
                console.log("Account created successfully:", data);
                document.getElementById('login-email-input').value = document.getElementById('register-email-input').value
                document.getElementById('login-password-input').value = document.getElementById('register-password-input').value
                document.getElementById('login-submit-button').click();
            }).catch(() => {
                const button = document.getElementById('register-submit-button')
                button.classList.add('error');
                setTimeout(() => {
                    button.classList.remove('error');
                }, 250);
            });
        }
    });
});

function generatesAvatars() {
    let avatars = "";
    for (let i = 0; i < 30; i++) {
        avatars += `
            <div class="avatar-preview">
                <img alt="Avatar" src="${baseUrl()}/api/avatar?name=avatar-${i}&colors=${randomColour()},${randomColour()},${randomColour()},${randomColour()},${randomColour()}${Math.random() < 0.75 ? "" : "&new=true"}">
            </div>
        `;
    }
    return avatars;
}

class SignIn extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `
            <link href="../Account/pop-up.css" rel="stylesheet">
            <button class="pop-up-button" id="sign-in-button">Sign In</button>
            <button class="pop-up-button" id="sign-out-button" disabled>Sign Out</button>
            <div class="pop-up-container hidden" id="sign-in-pop-up">
                <ul class="pop-up-tabs">
                    <li>
                        <a class="pop-up-tab active-tab">Login</a>
                    </li>
                    <li>
                        <a class="pop-up-tab">Register</a>
                    </li>
                </ul>
                <div class="pop-up-form">
                    <div class="tab-pane active-form">
                        <form>
                            <div class="form-group">
                                <label for="login-email-input">Email address</label>
                                <input class="form-control" id="login-email-input" placeholder="name@example.com" type="email">
                                <small class="form-text text-muted">We'll never share your email with anyone else.</small>
                            </div>
                            <div class="form-group">
                                <label for="login-password-input">Password</label>
                                <input class="form-control" id="login-password-input" placeholder="Password" type="password">
                                <small class="form-text text-muted">Password must be 8 characters long with at least:
                                    <ul>
                                        <li>1 Uppercase letter</li>
                                        <li>1 Lowercase letter</li>
                                        <li>1 Special character</li>
                                        <li>1 Number</li>
                                    </ul>
                                </small>
                            </div>
                            <button class="form-subit-button" id="login-submit-button" type="submit">Submit</button>
                            <a id="create-account-shortcut" class="form-text" href="">Don't have an account?</a>
                            <a id="password-forgoten" class="form-text" href="">Forgot password?</a>
                        </form>
                    </div>
                    <div class="tab-pane">
                        <form>
                            <div class="form-group">
                                <label for="register-username-input">Username</label>
                                <input class="form-control" id="register-username-input" placeholder="Username" type="text">
                                <small class="form-text text-muted">Username must be at least 5 characters long without any special characters.</small>
                            </div>
                            <div class="form-group">
                                <label for="register-email-input">Email address</label>
                                <input class="form-control" id="register-email-input" placeholder="name@example.com" type="email">
                                <small class="form-text text-muted">Email will be asked at login</small>
                            </div>
                            <div class="form-group">
                                <label for="register-confirm-email-input">Confirm Email address</label>
                                <input class="form-control" id="register-confirm-email-input" placeholder="name@example.com" type="email">
                                <small class="form-text text-muted">Email must be identical to the one above.</small>
                            </div>
                            <div class="form-group">
                                <label for="register-password-input">Password</label>
                                <input class="form-control" id="register-password-input" placeholder="Password" type="password">
                                <small class="form-text text-muted">Password must be 8 characters long with at least:
                                    <ul>
                                        <li>1 Uppercase letter</li>
                                        <li>1 Lowercase letter</li>
                                        <li>1 Special character</li>
                                        <li>1 Number</li>
                                    </ul>
                                </small>
                            </div>
                            <div class="form-group">
                                <label for="register-confirm-password-input">Verify Password</label>
                                <input class="form-control" id="register-confirm-password-input" placeholder="Password" type="password">
                                <small class="form-text text-muted">Password must be identical to the one above.</small>
                            </div>
                            <div class="form-group">
                                <label>Profile Avatar</label>
                                <small class="form-text text-muted">Please chose one below, or a random one shall be given</small>
                            </div>
                            <button class="form-subit-button" id="register-submit-button" type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
    `;
    };
}

customElements.define('app-sign-in', SignIn);