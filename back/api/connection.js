const crypto = require('crypto');
const router = require('../queryManagers/routes.js');
const https = require("https");
const db = require('../mongoDB.js').db;
const jwt = require("jsonwebtoken");

const encrypt = password => {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
};

function randomColour() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Sign-Up --> HTTP POST request to api/signup. The body of the request should be composed of a JSON representation
 * of an object, containing 3 keys: "mail", "username", and "password".
 *
 * @param req The request.
 * @param res The response.
 * @param data The JSON object containing the email, username, password and avatar.
 */
router.POST('/signup', (req, res) => {
    router.json(req).then(async data => {
        let email = data.email;
        let username = data.username;
        let password = data.password;
        const avatar = data.avatar ? data.avatar : await db.collection("Avatars")
            .aggregate([{ $sample: { size: 1 } }])
            .toArray()
            .then(avatars => avatars[0].Url)
            .catch(err => console.log(err));

        // Validate email format
        if (email.length <= 4 || email.match(/@/g).length !== 1 || !email.includes(".") || email.indexOf("@") <= 0 || email.lastIndexOf(".") <= email.indexOf("@") + 1 || email.lastIndexOf(".") >= email.length - 1) {
            res.statusCode = 400;
            return res.end("Invalid email format");
        }

        // Validate password format
        if (password.length <= 7 || !password.match(/[A-Z]/g) || !password.match(/[a-z]/g) || !password.match(/[0-9]/g) || !password.match(/[^a-zA-Z0-9]/g)) {
            res.statusCode = 400;
            return res.end("Invalid password format");
        }

        // Validate username format
        if (username.length < 4 || username.match(/[^a-zA-Z0-9]/g)) {
            res.statusCode = 400;
            return res.end("Invalid username format");
        }

        password = encrypt(password);

        // Check if email or username already exists in the database
        if (await db.collection("Users").count({ $or: [{ Email: email }, { Username: username }] }) > 0) {
            res.statusCode = 409;
            return res.end("Email or Username already exists");
        }

        // Add user to the database
        const err = await db.collection("Users").insertOne({
            Email: email,
            Username: username,
            Password: password,
            Avatar: avatar,
            MMR: 0,
            Timestamp: new Date()
        }, (err) => err).then(() => console.log("User added to the database")).catch(err => console.log(err));

        if (err) {
            res.statusCode = 500;
            return res.end("Database error");
        } else {
            res.statusCode = 200;
            return res.end(JSON.stringify({ Email: email, Username: username, Avatar: avatar }));
        }
    });
});

/**
 * HTTP POST request to api/login. The body of the request should be composed of a JSON representation of an object,
 * containing 2 keys: "password", and "mail" OR "username". Your API should return a JsonWebToken (JWT).
 *
 * @param req The request.
 * @param res The response.
 * @param data The JSON object containing the email and password.
 */
router.POST('/login', (req, res) => {
    router.json(req).then(async data => {
        let email = data.email;
        let password = encrypt(data.password);

        // Check if email already exists in the database
        await db.collection("Users").findOne({
            Email: email,
            Password: password
        }, { projection: { Password: 0, Tokens: 0, _id: 0 } }).then(user => {
            if (!user) {
                res.statusCode = 401;
                return res.end("Invalid email or password");
            }
            fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: user._id,
                    email: email,
                })
            }).then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            }).then(data => {
                const tokens = data;
                delete user._id;

                // update user last connection field
                db.collection("Users").updateOne({ Email: email, Password: password }, {
                    $set: {
                        LastConnection: new Date(),
                        Tokens: tokens
                    }
                }).then(() => console.log("User last connection & tokens updated")).catch(err => console.log(err));

                // return tokens
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                    token: JSON.stringify(data.jwt_token),
                    user: JSON.stringify(user)
                }));
            }).catch(error => {
                console.log(error);
                res.statusCode = 500;
                return res.end("Internal server error");
            });
        });
    });
});

router.POST('/logout', (req, res) => {
    console.log(`Logout: ${req}`)
    router.json(req).then(data => {
        let email = data.email;

        fetch('http://localhost:8080/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
            })
        }).then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        }).then(data => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ tokens: JSON.stringify(data) }));
        }).catch(error => {
            console.log(error);
            res.statusCode = 500;
            return res.end("Internal server error");
        });
    });
});
router.POST('/updateinfo', (req, res) => {
    router.json(req).then(async data => {

        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token.replaceAll('\"', ''), process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
            if (err) return res.end("Unauthorized");
            return decoded
        });
        console.log("heloooo");
        if (!decoded) return;
        user = await db.collection("Users").findOne({ Email: decoded.email }, {
            projection: {
                Password: 0,
                Tokens: 0,
                _id: 0
            }
        });
        console.log("user" + user.Username);
        console.log("data.Username" + data.Username);
        if (data.Username == user.Username) {
            // Récupérer le nom d'utilisateur depuis les paramètres de l'URL
            // Get parameters from the url
            console.log(data);
            // Vérifier si l'utilisateur existe dans la base de données

            await db.collection("Users").updateOne({ Username: data.Username }, {
                $set: {

                    Email: data.Email,
                    Username: data.Newusername,
                    Password: data.Password,
                    Avatar: data.Avatar
                }
            }).catch(err => console.log(err));
        }
        else {
            // Si l'utilisateur n'existe pas, renvoyer une erreur 404
            res.statusCode = 404;
            console.log("404");
            return res.end('Utilisateur non trouvé');
        }
        userreturn = await db.collection("Users").findOne({ Email: decoded.email }, {
            projection: {
                Password: 0,
                Tokens: 0,
                _id: 0
            }
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        console.log(userreturn);

        return res.end(JSON.stringify({
            Avatar: JSON.stringify(userreturn.Avatar),
            Username: JSON.stringify(userreturn.Username),
            Email: JSON.stringify(userreturn.Username)
        }));
    })

}, true);
router.POST('/user', (req, res) => {
    router.json(req).then(async data => {
        if (res.statusCode !== 200) return res.end("Unauthorized");

        // update user last connection field
        db.collection("Users").updateOne({ Email: data.email }, { $set: { LastConnection: new Date() } }).catch(err => console.log(err));

        // get user data
        const user = await db.collection("Users").findOne({ Email: data.email }, {
            projection: {
                Password: 0,
                Tokens: 0,
                _id: 0
            }
        })
        const jwt_token = await db.collection("Users").findOne({ Email: data.email }).then(user => user.Tokens.jwt_token);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
            token: JSON.stringify(jwt_token),
            user: JSON.stringify(user)
        }));
    });
}, true);

// Route GET pour récupérer le mail et le mot de passe associé à un utilisateur
router.GET('/profile', async (req, res) => {

    let paramusername;
    // Récupérer le nom d'utilisateur depuis les paramètres de l'URL
    // Get parameters from the url
    const urlParams = req.url.split('?')[1];
    if (urlParams) {
        const params = new Map(urlParams.split('&').map(p => p.split('=')));
        username = params.get('username');

    }
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await db.collection("Users").findOne({ Username: username }, {
        projection: {
            Password: 0,
            Tokens: 0,
            _id: 0
        }
    })

    user.Vues = Math.floor(Math.random() * 10000);

    if (!user) {
        // Si l'utilisateur n'existe pas, renvoyer une erreur 404
        return res.status(404).send('Utilisateur non trouvé');
    }
    res.statusCode = 200;
    // Si l'utilisateur existe, renvoie le user afin de afficher les info coté client
    res.setHeader('Content-Type', 'application/json');
    console.log(user);
    return res.end(JSON.stringify(user));

}, false);

router.GET('/avatar', async (req, res) => {
    // Set default data
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/svg+xml');
    // const imageUrl = 'https://randomavatar.com/avatar/1043258119';
    const imageUrl = 'https://source.boringavatars.com/beam/50/';
    let imageParams = '';
    let newImage = '';

    // Get parameters from the url
    const urlParams = req.url.split('?')[1];
    if (urlParams) {
        const params = new Map(urlParams.split('&').map(p => p.split('=')));
        imageParams = params.get('name') + '?colors=' + params.get('colors');
        newImage = params.get('new');
    }
    if (imageParams === '') imageParams = `avatar-${Math.floor(Math.random() * Infinity)}?colors=${randomColour()},${randomColour()},${randomColour()},${randomColour()},${randomColour()}`

    // Check if the image doesn't exist in the database
    if (await db.collection("Avatars").count({ Url: imageUrl + imageParams }) === 0) {
        if (newImage || newImage === undefined) {
            // Retrieve the image from the API
            await new Promise(resolve => {
                https.get(imageUrl + imageParams, async (response) => {
                    let data = '';
                    response.on('data', (chunk) => {
                        data += chunk;
                    });
                    response.on('end', async () => {
                        // Add the image to the database
                        resolve(await db.collection("Avatars").insertOne({
                            Url: imageUrl + imageParams,
                            Data: data
                        }).catch(err => console.log(err)));
                    });
                }).on('error', (err) => {
                    console.log(`Error retrieving image: ${err}`);
                });
            });
        } else {
            const randAvatar = await db.collection("Avatars").aggregate([{ $sample: { size: 1 } }]).toArray()
            return res.end(randAvatar[0].Data);
        }
    }

    // Return the image from the database
    return res.end(await db.collection("Avatars").findOne({ Url: imageUrl + imageParams }).then(avatar => avatar.Data));
});