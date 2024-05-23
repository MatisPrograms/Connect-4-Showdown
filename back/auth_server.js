// Get the environment variables from the .env file.
require('dotenv').config();

// The http module contains methods to handle http queries.
const http = require('http');
const jwt = require("jsonwebtoken");

function generate_access_token(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {expiresIn: '30m'});
}

function generate_refresh_token(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: '1d'});
}


/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
http.createServer((request, response) => {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "auth") {
            const url = request.url.replace('/auth/', '');
            if (request.method === 'POST') {
                let body = '';
                request.on('data', (chunk) => {
                    body += chunk.toString();
                });
                request.on('end', () => {
                    switch (url) {
                        case "login":
                            const id = JSON.parse(body).id;
                            const email = JSON.parse(body).email;

                            const jwt_access_token = generate_access_token({id: id, email: email});
                            const jwt_refresh_token = generate_refresh_token({id: id, email: email});

                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'application/json');
                            return response.end(JSON.stringify({
                                jwt_token: jwt_access_token, jwt_refresh: jwt_refresh_token
                            }));
                        case 'refresh':
                            const jwt_refresh = JSON.parse(body).jwt_refresh;
                            if (!jwt_refresh) {
                                response.statusCode = 401;
                                return response.end("No token provided");
                            }

                            return jwt.verify(jwt_refresh, process.env.JWT_REFRESH_TOKEN, (err, decoded) => {
                                if (err) {
                                    response.statusCode = 403;
                                    return response.end("Invalid token");
                                }
                                response.statusCode = 200;
                                response.setHeader('Content-Type', 'application/json');
                                return response.end(JSON.stringify({
                                    jwt_token: generate_access_token({id: decoded.id, email: decoded.email})
                                }));
                            });
                        default:
                            response.statusCode = 404;
                            return response.end("Not found");
                    }
                });
            }
            if (request.method === "DELETE" && url === "logout") {
                let body = '';
                request.on('data', (chunk) => {
                    body += chunk.toString();
                });
                request.on('end', () => {
                    const jwt_refresh = JSON.parse(body).jwt_refresh;
                    if (!jwt_refresh) {
                        response.statusCode = 401;
                        return response.end("No token provided");
                    }

                    response.statusCode = 200;
                    return response.end("OK");
                });
            }
        }
    } catch (error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        return response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8080, () => console.log('Authentication Server running at http://localhost:8080/'));