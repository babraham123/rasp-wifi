// Socket.io server to collect and send light commands to the light table
// Sits on the raspberry pi between the client and arduino microcontroller
// 
// Bereket Abraham

var Server    = require('socket.io'),
    exec      = require('child_process').exec;

var port      = 8002,
    debug     = false,
    stats     = {
                    'sysdesc': 'uname -a',
                    'filesys': 'df -h',
                    'cpu': 'lscpu',
                    'usb': 'lspci',
                    'memory': 'free -h',
                    'hardware': 'lshw'
                };

function init() {
    processCmdLineParams();
    openSocketIOConnection();
}

function processCmdLineParams() {
    console.log("Starting socket.io server...");
    var idx = process.argv.indexOf("--port");
    if (idx >= 0 && idx < process.argv.length-1) {
        port = parseInt( process.argv[idx + 1] );
        console.log("Port " + port.toString());
    }
    idx = process.argv.indexOf("--debug");
    if (idx >= 0 && idx < process.argv.length) {
        debug = true;
        console.log("Debug mode");
    }
}

// Communication API
// 'get_stat' => cmd_name
function openSocketIOConnection() {
    io = new Server(port);
    io.on('connection', function(socket) {
        // request for initial set of data
        socket.on('get_stat', function(data) {
            console.log('get_stat: ' + data);
            processStat( data, function(stat_type, result) {
                socket.emit(stat_type, result);
            });
        });

        socket.on('disconnect', function(id, data) {
            console.log("disconnected: " + JSON.stringify(id));
        });
        socket.on('error', function(data) {
            console.log("errored: " + JSON.stringify(data));
        });
        console.log('connected');
    });
}

function processStat(stat_type, callback) {
    var command = stats[stat_type];
    if (command) {
        exec(command, function(error, stdout, stderr) {
            callback(stat_type, convertToHtml(stdout, stderr));
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    } else {
        callback('Command not found.');
    }
}

function convertToHtml(str1, str2) {
    var msg = '<p>';
    str1 = str1.replace(/\n/g, '</p><p>');
    msg = msg + str1 + '</p><br>' + str2;
    return msg;
}

init();
