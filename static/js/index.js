var socket = new io.Socket();
socket.on('connect', function(){ console.log('connect') });
socket.on('message', function(){ console.log('message') });
socket.on('disconnect', function(){ console.log('disconnect') });
socket.connect();
