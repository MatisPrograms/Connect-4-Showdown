/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Referer', 'no-referrer');

//     Add script-src-elem * 'self' gap: 'unsafe-inline';

    response.setHeader('Content-Security-Policy', "script-src-elem * 'self' gap: 'unsafe-inline';");
}

module.exports = {addCors}