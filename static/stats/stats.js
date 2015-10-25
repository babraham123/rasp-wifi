(function(){
    var socket      = null,
        socketUrl   = window.location.protocol + '//rasp.net:8080',
        stats       = [
                        'sysdesc',
                        'filesys',
                        'cpu',
                        'usb',
                        'memory',
                        'hardware'
                      ];
    
    function init() {
        // set debugging
        //localStorage.debug='*';
        localStorage.debug='';
        openConnection();
    }

    // Communication API
    // get_stat => stat_result
    function openConnection() {
        // connect to the host server
        socket = io.connect(socketUrl);

        socket.on('disconnect', function(msg) {
            console.log('disconnected: ' + JSON.stringify(msg));
        });
        socket.on('error', function(msg) {
            console.log('errored: ' + JSON.stringify(msg));
        });

        // get initial state of table
        $.each(stats, function(i, elem) {
            socket.on(elem, function(result) {
                $('#' + elem).html(result);       
            });

            socket.emit('get_stat', elem);
        });
        console.log('connection created');
    }

    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); };
    }

    init();
})();
