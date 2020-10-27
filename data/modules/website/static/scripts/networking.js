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
        //console.log({state})
        readytosend = ws.readyState === ws.OPEN;
        while (!(ws.readyState === ws.OPEN)){
            readytosend = ws.readyState === ws.OPEN;
            await sleep(0.1)
        }

        msg = {"category":"test", "type":"web"};
        sendmsg(msg);
    };

    ws.onmessage = async function (event) {
        console.time("receive");
        await msghandler(event.data);
    };

    ws.onclose = function (event){
        console.log("connection closed, opening new one. \nclosed because: " , event.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };

};
alert("Waitforresult( in networking) has an error with the template gathering")
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
    readytosend = ws.readyState === ws.OPEN;
    i = 0;
    ws.send(msg)
}

async function checkguidobj(guid){
    while (!(guid in guidobj)){
        console.log("waiting for guid: " + guid)
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
    smsg.metadata["copy"] = {"guid":guid};
    sendmsg(smsg);
    id = false;
    msg = await checkguidobj(guid);
    return msg;
}
blacklist = ["admin", "web", "template", "text-text", "text-image"];
async function msghandler(message){
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
            return;
        }
    }
    //console.log(data)
    //console.log(category);
    //console.log(type)
    console.time("message")
    console.log({category})
    if(!(blacklist.includes(category))){
        lockres = await waitforlock() // check that element is editable
        console.log(lockres)
        changetextbox(data, category);
    }
    // eventually remove this filtering and just error nicely
    /*
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

    }*/
}
