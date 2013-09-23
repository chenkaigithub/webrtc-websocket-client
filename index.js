var port = process.env.port || 8080;
var wss = new (require('ws').Server)({ port: port });
var sockets = [];

var redis = require('redis'),
    redisSubscriber, redisPublisher;



function listenToWebSockets() {
    wss.on('connection', function(ws) {
        sockets.push(ws);

        ws.on('message', function(msg) {
            // broadcast the message over Redis to the other
            // sockets on this and other servers
            redisPublisher.publish('webrtc', msg);
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
}

function listenToRedis() {
    // subscribe on the subscriber client to all messages,
    // and then post these messages over to the web sockets
    redisSubscriber.on('message', function(channel, msg) {
        console.log('redis subscriber: ' + msg);
        sockets.forEach(function(s) {
            try {
                s.send(msg); 
            } catch (e) {
                console.log('error');
                console.dir(e);
            }
        });
    });
    redisSubscriber.subscribe('webrtc');
}

if (process.env.NODE_ENV === 'production') {
    redisSubscriber = redis.createClient(parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST, {no_ready_check: true});
    redisPublisher = redis.createClient(parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST, {no_ready_check: true});

    redisSubscriber.auth(process.env.REDIS_KEY, function(err) {
        if (err) {
            console.error("Unable to connect to redis");
            return;
        }
        console.log('a');

        redisPublisher.auth(process.env.REDIS_KEY, function(err) {
            if (err) {
                console.error("Unable to connect to redis");
                return;
            }
        console.log('a');
            listenToRedis();
            listenToWebSockets();
        });
    });

} else {
    redisSubscriber = redis.createClient();
    redisPublisher = redis.createClient();
    listenToRedis();
    listenToWebSockets();

    // start the file server on localhost:8081
    require('./fileClient');
}
