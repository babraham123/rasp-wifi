// Socket.io server to collect and send light commands to the light table
// Sits on the raspberry pi between the client and arduino microcontroller
// 
// Bereket Abraham

var Server     = require('socket.io'),
    serialPort = require('serialport'),
    sleep      = require('sleep');

var port       = 8002,
    debug      = false,
    lenr       = 8,
    lenc       = 13,
    numLed     = lenr * lenc,
    io         = null,
    background = '#22CCCC',
    colorArr   = null,
    serial     = null,  // doesn't attempt serial connection (no LEDs, only console.log)
    colors     = ['#03B589', '#EBBA00', '#E06B0A', '#1F81DC',
                  '#3FD373', '#E2332A', '#8A38AC', '#E7ECEE', '#26374B'],
    users      = {};    // maxUsers = colors.length

function init() {
    processCmdLineParams();
    colorArr = new Array(numLed);
    resetColors(colorArr, background);

    if (debug === false) {
        openSerialConnection( getSerialPortDevice() );
    }
    openSocketIOConnection();
}

function processCmdLineParams() {
    console.log("Starting socket.io server...");
    var idx = process.argv.indexOf("--port");
    if (idx >= 0 && idx < process.argv.length-1) {
        port = parseInt( process.argv[idx + 1] );
        console.log("Port " + port.toString());
    }
    idx = process.argv.indexOf("--row");
    if (idx >= 0 && idx < process.argv.length-1) {
        lenr = parseInt( process.argv[idx + 1] );
        console.log("Number of rows: " + lenr.toString());
    }
    idx = process.argv.indexOf("--col");
    if (idx >= 0 && idx < process.argv.length-1) {
        lenc = parseInt( process.argv[idx + 1] );
        console.log("Number of columns: " + lenc.toString());
    }
    idx = process.argv.indexOf("--num-led");
    if (idx >= 0 && idx < process.argv.length-1) {
        numLed = parseInt( process.argv[idx + 1] );
        console.log("Number of LEDs in chain: " + numLed.toString());
    } else {
        numLed = lenr * lenc;
    }
    idx = process.argv.indexOf("--debug");
    if (idx >= 0 && idx < process.argv.length) {
        debug = true;
        console.log("Debug mode");
    }
}

function getSerialPortDevice() {
    var device = '/dev/ttyACM0';
    var found = false;
    serialPort.list(function (err, ports) {
        ports.forEach(function(p) {
            if (p.pnpId.indexOf('arduino') > -1) {
                device = p.comName;
                found = true;
            }
        });
    });
    if (found === false && debug === false) {
        throw "Arduino serial port not found";
    }

    console.log(JSON.stringify(device));
    return device;
}

function openSerialConnection(device) {
    serial = new serialPort.SerialPort(device, {
      baudrate: 9600
    });

    serial.on('open', function(error) {
        if (error) {
            throw 'RPi: Port failed to open: '+error;
        } else {
            console.log('RPi: Serial port opened');
        }

        // react to arduino sensed events
        serial.on('data', function(data) {
            console.log( 'Arduino: ' + data.toString('ascii') );
        });

        serial.on('close', function(data) {
            console.log( 'RPi: Serial port closed: ' + JSON.stringify(data) );
        });
        serial.on('error', function(error) {
            console.log( 'RPi: Serial port error: ' + JSON.stringify(error) );
        });

    });
}

// Communication API
// 'initial_state' => 'remote_updates'
// 'local_update', 'request_status' => 'remote_update'
// 'request_color' => 'assign_color'
function openSocketIOConnection() {
    console.log('Starting socket.io connection...');
    io = new Server(port);
    io.on('connection', function(socket) {
        // request for initial set of data
        socket.on('initial_state', function(data) {
            console.log('initial_state');
            socket.emit('remote_updates', fullColorSet(colorArr));
        });

        // clear all of the leds
        socket.on('clear_state', function(data) {
            console.log('clear_state');
            resetColors(colorArr, background);
            io.emit('remote_updates', fullColorSet(colorArr));
        });

        // update the color of a particular led
        socket.on('local_update', function(colormsg) {
            console.log('local_update: ' + colormsg);
            // save state
            var ind = parseInt( colormsg.substring(0, 3) );
            colorArr[ind] = colormsg.substring(4, colormsg.length);
            // set color, forward to other clients
            io.emit('remote_update', colormsg);
            sendColor(colormsg);
        });

        // request for status of a particular led
        socket.on('request_status', function(data) {
            console.log('request_status: ' + data);
            socket.emit('remote_update', getColor(data));
        });

        // request a color by user
        socket.on('request_color', function(id, data) {
            //socket.broadcast.to(id).emit('my message', msg);
            socket.emit('assign_color', assignColorByUser(id));
        });

        socket.on('disconnect', function(id, data) {
            console.log("disconnected: " + JSON.stringify(id));
            releaseUser(id);
        });
        socket.on('error', function(data) {
            console.log("errored: " + JSON.stringify(data));
        });
        console.log('connected');
    });
}

function assignColorByUser(id) {
    if (colors.length === 0) {
        return null;
    }
    var color = colors.shift();
    users[id] = color;
    return color;
}

function releaseUser(id) {
    var color = users[id];
    colors.push(color);
    delete users[id];
}

// incoming = '001:#AA44FF'
// outgoing = '^001:AA44FF\n'
// ignore message if out-of-bounds
// don't send over serial if debug mode
function sendColor(colormsg) {
    if (debug === true) {
        console.log(colormsg);
    }
    var index = colormsg.substring(0, 3);
    var colorhex = colormsg.substring(5, colormsg.length);

    if (parseInt(index) < numLed) {
        colorArr[parseInt( index )] = colorhex;
        if (debug === false) {
            serial.write('^' + index + ':' + colorhex + '\n');
            serial.drain();
            sleep.sleep(0.05)
        }
    }
}

function getColor(ind) {
    ind = parseInt(ind);
    var msg = background;
    if (ind < numLed) {
        msg = colorArr[ind];
    }
    return ind.toString() + ':' + msg;
}

function resetColors(arr, backgroundColor) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = backgroundColor;
        sendColor(arr[i]);
    }
}

// zero padding a to b places
function pad(a,b) {
    return(1e15+a+"").slice(-b)
}

function fullColorSet(arr) {
    var msg = '';
    for (var i = 0; i < arr.length; i++) {
        msg += pad(i, 3) + ':' + arr[i] + ',';
    }
    msg = msg.substring(0, msg.length-1);
    return msg;
}


init();

