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

    console.log('socket connected');
});

if (process.env.NODE_ENV !== 'production') {
    require('./fileClient');
}
