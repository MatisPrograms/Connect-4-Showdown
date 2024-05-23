const jwt = require("jsonwebtoken");
const {addCors} = require("./cors");
const db = require("../mongoDB.js").db;

class Router {

    constructor() {
        this.routes = [];
    }

    route(path, callback, method, authentification) {
        this.routes.push({path, callback, method, authentification});
    }

    GET(path, callback, authentification) {
        this.route(path, callback, "GET", !!authentification);
    }

    POST(path, callback, authentification) {
        this.route(path, callback, "POST", !!authentification);
    }

    PUT(path, callback, authentification) {
        this.route(path, callback, "PUT", !!authentification);
    }

    DELETE(path, callback, authentification) {
        this.route(path, callback, "DELETE", !!authentification);
    }

    json(req) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        return new Promise((resolve, reject) => {
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    async apply(req, res) {
        try {
            req.url = req.url.replace('/api', '');
            req.method = req.method.toUpperCase();
            if (!['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(req.method)) {
                res.statusCode = 405;
                return res.end('Method not allowed');
            }

            if (req.method === 'OPTIONS') {
                addCors(res);
                res.statusCode = 200;
                return res.end();
            }

            for (const route of this.routes) {
                if (route.path.toLowerCase() === req.url.toLowerCase().split('?')[0] && route.method === req.method) {
                    if (route.authentification && !await authenticate_token(req, res)) {
                        res.statusCode = 401;
                        return res.end('Unauthorized');
                    }
                    return route.callback(req, res);
                }
            }

            res.statusCode = 404;
            return res.end('Not found');
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            return res.end('Internal server error');
        }
    }
}

function authenticate_token(request, response) {
    const jwt_access_token = request.headers.authorization.split(" ")[1].replaceAll('"', '');
    if (!jwt_access_token) {
        console.log("No token provided");
        return false
    } else {
        return jwt.verify(jwt_access_token, process.env.JWT_ACCESS_TOKEN, async err => {
            if (err) {
                // get refresh token of user from db
                const jwt_refresh_token = await db.collection("Users").findOne({"Tokens.jwt_token": jwt_access_token}).then(res => {
                    if (!res) return false;
                    return res.Tokens.jwt_refresh
                });
                if (!jwt_refresh_token) {
                    console.log("No refresh token found");
                    return false;
                }

                // try to refresh token
                const new_jwt_access_token = await fetch("http://localhost:8080/auth/refresh", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({jwt_refresh: jwt_refresh_token})
                }).then(async res => (await res.json()).jwt_token).catch(() => false);

                if (!new_jwt_access_token) {
                    console.log("Token refresh failed");
                    return false;
                }

                console.log("Token refreshed")
                db.collection("Users").updateOne({"Tokens.jwt_token": jwt_access_token}, {$set: {"Tokens.jwt_token": new_jwt_access_token}}).then(() => console.log("User token updated")).catch(err => console.log(err));

                return true;
            } else {
                return true;
            }
        });
    }
}

module.exports = new Router();