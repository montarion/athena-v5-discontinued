
hostname = window.location.hostname;
port = "8000";
ws = new WebSocket("ws://" + hostname + ":" + port)
$(window).on('beforeunload', function(){
        ws.close();
    });

ws.addEventListener('open', function (event) {
    console.log("connection opened!");
    msg = {"category":"test", "type":"web"};
    ws.send(JSON.stringify(msg));
});

ws.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});
