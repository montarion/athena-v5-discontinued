var ws = "";

$(window).on('beforeunload', function(){
        ws.close();
});
async function connect() { // structure from https://stackoverflow.com/a/23176223
    hostname = window.location.hostname;
    port = "8000";
    ws = new WebSocket("ws://" + hostname + ":" + port);

    ws.onopen = async function() {
        console.log("connection opened!");
        state = ws.readyState;
        console.log({state})
        readytosend = ws.readyState === ws.OPEN;
        while (!(ws.readyState === ws.OPEN)){
            readytosend = ws.readyState === ws.OPEN;
            console.log(readytosend)
            await sleep(0.1)
        }
        console.log(ws.readyState === ws.OPEN)

        msg = {"category":"test", "type":"web"};
        console.warn(ws)
        sendmsg(msg);
    };

    ws.onmessage = function (event) {
        msghandler(event.data);
    };

    ws.onclose = function (event){
        console.log("connection closed, opening new one. \nclosed because: " , event.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };

};
connect();


// save guid : message pairs
guidobj = {} 

function getGuid(){
    var result = '';
    while (!result){
        result = Math.random().toString(36).substring(2, 10);
    }
    return result; 
}

function sleep(seconds){
    ms = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, ms))
}

function msgbuilder(category, type, data={}, metadata={}){
    msg = {"category":category, "type":type, "data":data, "metadata": metadata};
    return msg
}

async function sendmsg(msg){
    if (typeof msg != "string"){
        msg = JSON.stringify(msg);
    }
    console.log(ws.readyState)
    readytosend = ws.readyState === ws.OPEN;
    console.log(readytosend)
    i = 0;
    ws.send(msg)
    /*
    while (true){
        if (readytosend){
            ws.send(msg);
            break
        } else {
            if (i < 3) {
                await sleep(1);
                i++;
            } else {
                i = 0;
                ws.close()
                reopen();
            }
        }
    }*/
}

async function checkguidobj(guid){
    while (!(guid in guidobj)){
        console.log("not yet..") //  turn this into a console log that uses setinterval or settimeout for a log after a bit.
        await sleep(0.5)
    }
    msg = guidobj[guid];
    return msg;
}
async function waitforresult(smsg, guid=false){
    if (typeof smsg != "object"){
        smsg = JSON.parse(smsg);
    }
    if (!guid){
        guid = getGuid();
    }
    smsg.metadata = {"copy": {"guid":guid}};
    sendmsg(smsg);
    id = false;
    msg = await checkguidobj(guid);
    return msg;
}

function msghandler(message){
    msg = JSON.parse(message);
    console.log('Message from server ', msg);
    category = msg.category;
    type = msg.type;
    data = msg.data;
    // in case there are callbacks
    if ("metadata" in msg){
        if ("guid" in msg.metadata){
            guid = msg.metadata.guid;
            guidobj[guid] = msg;
        }
    }
    console.log(data)
    console.log(category);
    console.log(type)
    console.time("message")
    
    // eventually remove this filtering and just error nicely
    if (category == "weather") {
        if (type == "current") {
            city = data.location;
            temp = data.temp;
            iconurl = data.iconurl;
            findata = {"city":city, "temp":temp, "icon":iconurl};
            
            changetextbox(data, "weather");
            console.timeLog("message")
        }
    }
    if (category == "anime"){
        if (type == "lastshow"){
            changetextbox(data, "anime")
        }
    }
    if (category == "question") {

    }
}
