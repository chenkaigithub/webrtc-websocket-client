var port = process.env.port || 8080;
var wss = new (require('ws').Server)({ port: port });

var sockets = [];

wss.on('connection', function(ws) {
    sockets.push(ws);

    ws.on('message', function(msg) {
        console.log(msg);
        // broadcast the message over to the other sockets
        sockets.forEach(function(s) {
            try {
                s.send(msg); 
            } catch (e) {
                console.log('error');
                console.dir(e);
            }
        });
    });

    ws.on('close', function() {
        // remove the socket from the list of sockets
        var id = sockets.indexOf(ws);
        if (id >= 0) {
            sockets.splice(id, 1);
        }

        console.log('socket closed');
    });

    console.log('connected');
});


// static file serving... not important
var staticServer = new (require('node-static').Server)('./client');
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        staticServer.serve(request, response);
    }).resume();
}).listen(8081);
