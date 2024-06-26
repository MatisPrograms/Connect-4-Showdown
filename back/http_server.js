// Get the environment variables from the .env file.
require('dotenv').config();

// The http module contains methods to handle http queries.
const http = require('http');

// Let's import our logic.
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');
const { addCors } = require("./queryManagers/cors");
const database = require('./mongoDB.js').disconnect;

// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
    console.log('Shutting Down...');
    database().then(() => console.log('Database disconnected')).catch(console.dir);
    process.exit();
});

/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
const httpServer = http.createServer((request, response) => {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    if (request.url === "/") {
        console.log('redirecting to Home/home.html');
        response.writeHead(301, { Location: '/Home/home.html' });
        return response.end();
    }

    addCors(response);
    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
        }
    } catch (error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        return response.end(`Something in your request (${request.url}) is strange...`);
    }
    // For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(process.env.PORT || 8000, () => console.log('Api and Webpage Server running at ' + httpServer.address().address + ":" + httpServer.address().port));

exports.server = httpServer;