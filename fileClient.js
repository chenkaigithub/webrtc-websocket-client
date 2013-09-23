// static file serving... not important
var staticServer = new (require('node-static').Server)('./client');
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        staticServer.serve(request, response);
    }).resume();
}).listen(8081);
