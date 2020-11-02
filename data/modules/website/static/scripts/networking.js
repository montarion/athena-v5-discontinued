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
alert("Messages after the first aren't parsed anymore, perhaps disable the lock system in text.js?")
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
    console.trace("SENT MESSAGE: ", msg)
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
    console.trace(smsg)
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
    console.debug("GOT RESULT")
    console.info({msg})
    return msg;
}
blacklist = ["admin", "web", "template", "text-text", "text-image"];
msgqueue = []
async function msghandler(message){
    if (typeof message === "undefined"){
        return;
    }
    msg = JSON.parse(message);
    console.info('Message from server ', msg);
    category = msg.category;
    type = msg.type;
    data = msg.data;
    // in case there are callbacks
    if ("metadata" in msg){
        if ("guid" in msg.metadata){
            guid = msg.metadata.guid;
            guidobj[guid] = msg;
            return;
        } else if ("copy" in msg.metadata){
            guid = msg.metadata.copy.guid;
            guidobj[guid] = msg;
            return;
        }
    }
    //console.log(category);
    console.time("message")
    let inblacklist = (blacklist.includes(category) || blacklist.includes(type))
    console.info({category})
    console.info({inblacklist}, {data})
    if(inblacklist){
        console.debug("skipping..")
        console.debug({data})
    } else {
        /*if (!(islocked())){
            setlock()
        }*/
        // if editlock
        if (islocked){
            console.log("locked, waiting..")
            msgqueue.push(message)
        } else {
            console.log("Working on message: ", message)
            setlock()
        }

        console.info("running!")
        console.info({msg})
        //lockres = await waitforlock() // check that element is editable
        //console.log({lockres})
        console.info(data)
        console.info({msg})
        console.info(category)
        changetextbox(data, category);
        releaselock()
    }
}
