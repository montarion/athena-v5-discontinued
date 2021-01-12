var ws = "";

$(window).on('beforeunload', function(){
        ws.close();
        ss.hasconnection = false
});
var shouldopen = false
ss = sessionStorage
ss.hasconnection = false
async function connect() { // structure from https://stackoverflow.com/a/23176223
    hostname = window.location.hostname;
    port = "8000";
    
    shouldopen = JSON.parse(ss.hasconnection) == false
    console.info(shouldopen)
    if (shouldopen){
        ws = new WebSocket("ws://" + hostname + ":" + port);
    
        ws.onopen = async function() {
            console.log("connection opened!");
            state = ws.readyState;
            readytosend = ws.readyState === ws.OPEN;
            while (!(ws.readyState === ws.OPEN)){
                readytosend = ws.readyState === ws.OPEN;
                await sleep(0.1)
            }

            msg = {"category":"test", "type":"web"};
            sendmsg(msg);
        }
        ss.hasconnection = true
    }

    ws.onmessage = async function (event) {
        console.time("receive");
        // add to queue
        msgqueue.push(event.data);
        console.timeLog("LOG")
        console.info("Added message to queue:", event.data)
        //await msghandler(event.data);

        // check for metadata  in case there are callbacks since the main msgqueue will block
        tmpmsg = JSON.parse(event.data)
        if ("metadata" in tmpmsg){
            if ("guid" in tmpmsg.metadata){
                guid = tmpmsg.metadata.guid;
                guidobj[guid] = tmpmsg;
                //return;
            } else if ("copy" in tmpmsg.metadata){
                guid = tmpmsg.metadata.copy.guid;
                guidobj[guid] = tmpmsg;
                //return;
            }
        }
    };

    ws.onclose = function (event){
        console.log("connection closed, opening new one. \nclosed because: " , event.reason);
        setTimeout(function() {
            connect();
        }, 500);
    };

    ws.onerror = function(event){
        console.log("Connection errored out. \nReason: ", event.reason);
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
    console.trace("sleeping")
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
        await sleep(0.2)
    }
    msg = guidobj[guid];
    return msg;
}
async function waitforresult(smsg, guid=false){
    console.trace(smsg)
    waitlock = true;
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
    waitlock = false;
    return msg;
}
blacklist = ["admin", "web", "template", "text-text", "text-image"];
msgqueue = []
intervalID = false
async function msghandler(){ // gets started in main.js
    if (msgqueue.length < 1){
        if (!intervalID){
            console.debug("Message queue is empty!")
            //intervalID = setInterval(await msghandler, 2000);
        }
        return;
    } // check if populated, if not set interval
    console.info("QUEUE - ", {msgqueue})
    //clearInterval(intervalID);
    intervalID = false;
    console.warn("running!");
    console.warn("checking for metadata")
    console.info("QUEUE - ", {msgqueue})
    for (index in msgqueue){
        message = msgqueue[index];
        if (typeof message === "undefined"){
            return;
        }
        msg = JSON.parse(message);
        console.info('Message from queue ', msg);
        console.timeLog("LOG")
        category = msg.category;
        type = msg.type;
        data = msg.data;
        // in case there are callbacks
        
        if ("metadata" in msg){
            if ("guid" in msg.metadata){
                guid = msg.metadata.guid;
                guidobj[guid] = msg;
                msgqueue.splice(index, 1)
                return;
            } else if ("copy" in msg.metadata){
                guid = msg.metadata.copy.guid;
                guidobj[guid] = msg;
                msgqueue.splice(index, 1)
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
            console.info("running!")
            changetextbox(data, category);
            console.log("Done WITH TEXTBOX")
            //releaselock()
        }
        // remove message from array
        console.warn(msgqueue)
        msgqueue.splice(index, 1)
        console.log("removed: ", {msg})
        console.warn(msgqueue)
        console.log(msgqueue.length)
        await waitforlock()
        console.info("DONE WITH: ", category)
         
        // clean up
        data = ""
        msg = ""
        category = ""
        
    };
    console.warn("Done with queue")
    console.info("QUEUE - RESTARTING")
    //setTimeout(await msghandler, 500)
}
