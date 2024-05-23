const router = require('./routes.js');
const fs = require('fs');
const path = require('path');

// Load all the api files
const apiFiles = '../api';
fs.readdirSync(path.join(__dirname, apiFiles)).forEach(file => require(`${apiFiles}/${file}`));

// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
    return router.apply(request, response);
}

module.exports = {manage: manageRequest}