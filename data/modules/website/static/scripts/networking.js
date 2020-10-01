
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
    msghandler(event.data);
});

function msghandler(message){
    msg = JSON.parse(message);
    category = msg.category;
    type = msg.type;
    data = msg.data;
    console.log(data)
    console.log(category);
    console.log(type)
    if (category == "weather") {
        if (type == "current") {
            city = data.location;
            temp = data.temp;
            iconurl = data.iconurl;
            findata = {"city":city, "temp":"temp", "iconurl":iconurl};
            
            changetextbox(findata, "weather");
        }
    }
}
