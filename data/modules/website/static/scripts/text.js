// pick between bottom text or toptext
//hardcode for now

presetstore = {} // stores ui data
elementstore = {"lock":""} // stores element data

function createurl(store, location, filename){
    //url = "{{ url_for(" + store + ", filename=" + filename + ") }}"
    url = store + "/" + location + "/" + filename;
    return url;
}
function pickelement(data){
    randchoice = Math.floor(Math.random() * 2) + 1;
    if ("image" in Object.keys(data)){
        if (randchoice == 0){
            element = "#bottomimage";
        } else {
            element = "#topimage";
        }
    } else {
        if (randchoice == 0){
            element = "#bottomtext";
        } else {
            element = "#toptext";
        }
    }
    return element
}

function loadImage(path, target) {
    $('<img src="'+ path +'">').on("load", (function() {
      $(this).appendTo(target);
    }));
    return true;
}
imglist = ["icon", "iconurl", "image", "imageurl", "cover", "banner", "art"];
async function fillhtml(data, jsonmap, element){
    
    console.warn("INSIDE FILLHTML")
    console.debug(data)
    console.debug(jsonmap)
    console.debug({element})    
    for (category in jsonmap){
        catentries = jsonmap[category];
        console.warn(catentries[0])
        if (typeof catentries[0] == "object"){
            // dictionary
            console.warn("dictionary")
            Object.values(catentries).forEach(function (dictobj){
                Object.keys(dictobj).forEach(function(key){
                    value = dictobj[key]
                    if(category == "-background"){
                        if(!(key[0] == "-")){ //continue, something we need
                            console.log("working on:", key)
                            if(value =="-ignore"){
                                obj = data[key];
                            } else {
                                obj = data[key][value];
                            }
                            finbackground = 'url("' + obj + '")';
                            // got background info, now check for options
                            if(Object.keys(catentries).includes("-options")){
                                // options object for background found
                                val = catentries["-options"]
                                if (val == "fade"){
                                    fadeelement = "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(3,4,4,0.19929978827468486) 100%)";
                                    bgimgcss = 'url("' + obj + '")';
                                    finbackground = fadeelement + ", " +bgimgcss;
                                    $(element).css('background-image', finbackground);
                                }
                            }
                            $(element).css('background-image', finbackground);
                            updateslider(oldelement)
                            console.debug("added background to: ", element);
                        }
                    };
                });
            });
            console.log("done with dictionary");
        } else {
            console.log("NOT A DICTIONARY")
            catentries.forEach(function(key, index){
                value = data[key]
                updateslider(oldelement);
                containerelement = element + " > ." + category;
                outputelement = containerelement + " > #" + key;
                obj = value;
                console.log("ADDING STUFF")
                console.log(key, value)
                if (imglist.includes(key)){
                    $(outputelement).attr("src", obj);
                    res = loadImage(obj, outputelement);
                    while (!(res)){} // wait for image to load
                } else {
                    $(outputelement).text(obj);
                }
            })
        };
        
    }
};


function setlock(){
    elementstore["lock"] = true;
    console.log("lock set")
}

function releaselock(){
    elementstore["lock"] = false;
    console.log("lock unset")
}

function islocked(){
    return elementstore["lock"];
}

function waitforlock(){
    return new Promise((resolve, reject) => {
        let intid = setInterval(function(){
            if(!(islocked())){ // not locked
                clearInterval(intid);
                console.log("DONE WAITING FOR LOCK")
                resolve(true)
                //changetextbox(data, preset);
            } else {
                console.log("WAITING FOR LOCK TO ELEMENT")
            }
        }, 1000);
    })
}
async function getelementinfo(preset){
    // get preset css
    if (!("url" in presetstore[preset])){
        url = createurl("templates", preset, preset+".css");
        $("head").append("<link rel='stylesheet' id='extracss' href='" + url + "' type='text/css' />");
        presetstore[preset]["url"] = url;
    };

    // get preset html
    presetlist = [];
    if (!("html" in presetstore[preset])){
        presetlist.push(preset+".html");
        /*
        htmldata = {"preset": preset, "filename": preset+".html"}
        msg = msgbuilder("web", "template", htmldata);
        console.debug("started wait")
        htmlmsg = await waitforresult(msg); //.then(console.warn); // func in networking that returns message
        console.debug("done waiting")
        presetstore[preset]["html"] = htmlmsg;
        */
    }
    //htmlmsg = presetstore[preset]["html"];

    // get preset json
    if (!("json" in presetstore[preset])){
        presetlist.push(preset+".json");
        /*
        jsondata = {"preset": preset, "filename": preset+".json"}
        msg = msgbuilder("web", "template", jsondata);
        //console.debug("started wait")
        jsonmap = await waitforresult(msg);
        jsonmap = jsonmap.data;
        console.debug(jsonmap)
        presetstore[preset]["json"] = jsonmap;
        */
    }
    //jsonmap = presetstore[preset]["json"];

    // build msg
    presetdata = {"preset": preset, "filenames": presetlist}
    msg = msgbuilder("web", "template", presetdata);

    // send it, and get result
    templatedata = await waitforresult(msg);
    console.log(templatedata)

    // check if you're missing anything
    basearray = ["json", "html"];
    Object.keys(templatedata.data).forEach(function(key){
        value = templatedata.data[key]
        ext = key.split(".")[1];
        if (basearray.includes(ext)){
            console.log("removing key")
            basearray.splice(basearray.indexOf(ext), 1)
        }
    })
    console.log({basearray})
    // TODO: grab what's left

    // assemble
    while (Object.keys(templatedata.data).length == 0){} 
    let html = templatedata.data[preset+".html"];
    let json = templatedata.data[preset+".json"];

    let findata = {"html": html, "json":json};
    return findata
}
blacklist = ["admin", "web", "template", "text-text", "text-image"];

async function changetextbox(data, preset="message"){
    console.log("IN TEXTBOX")
    // start timer
    console.time("msgtimer")
    console.debug(preset)
    //if(blacklist.includes(preset)){
        //return;
    //}

    console.debug(data)
    element = pickelement(data);
    console.log(element)
    //lockres = await waitforlock() // check that element is editable
    //console.log(lockres)
    setlock(element)
    sametype = false;
    if (!(element in elementstore)){
        elementstore[element] = [];
        multi = false; // flag used for hint
    } else {
        console.log("found multiple, adding carousel")
        multi = true; // flag used for hint
        
        // multiple in element
        console.debug(element)
        if (elementstore[element].includes(preset)){ // multiple of the same, updating
            console.warn("found previous card of type, updating")
            console.log(preset)
            updatetextbox(data, preset, element);
            sametype = true;
            releaselock(element)
            return
        }
    } 
    elementstore[element].push(preset)
    if (!(preset  in presetstore)){
        presetstore[preset] = {}; // allows for the other checks to run properly
    }

    // create new block
    let elementname = preset + "-block";
    newelement = $('<div id="' + elementname + '"></div>');
    $(element).append(newelement)
    oldelement = element
    element = "#" + elementname;
    //$(newelement).css("diplay", "flex");

    console.warn(preset)
    let {html, json} = await getelementinfo(preset);
    console.warn("Done with elementinfo")

    // save those values
    presetstore[preset]["html"] = html;
    presetstore[preset]["json"] = json;

    // get preset css
    /*
    if (!("url" in presetstore[preset])){
        url = createurl("templates", preset, preset+".css");
        $("head").append("<link rel='stylesheet' id='extracss' href='" + url + "' type='text/css' />");
        presetstore[preset]["url"] = url;
    };
    
    // get preset html
    if (!("html" in presetstore[preset])){
        htmldata = {"preset": preset, "filename": preset+".html"}
        msg = msgbuilder("web", "template", htmldata);
        console.debug("started wait")
        htmlmsg = await waitforresult(msg); //.then(console.warn); // func in networking that returns message
        console.debug("done waiting")
        console.debug(htmlmsg)
        presetstore[preset]["html"] = htmlmsg;
    }
    htmlmsg = presetstore[preset]["html"];

    // get preset json
    if (!("json" in presetstore[preset])){
        jsondata = {"preset": preset, "filename": preset+".json"}
        msg = msgbuilder("web", "template", jsondata);
        //console.debug("started wait")
        jsonmap = await waitforresult(msg);
        jsonmap = jsonmap.data;
        console.debug(jsonmap)
        presetstore[preset]["json"] = jsonmap;
    }
    jsonmap = presetstore[preset]["json"];
    */

    // save data
    presetstore[preset]["data"] = data;

    // apply it
    console.log("applying to:", element)
    $(element).html(html);


    // fill in data
    html = await fillhtml(data, json, element)
    $(element).html(html);

    console.warn("FILLED!")
    // add element to slider
    realhtml = $(element)[0].outerHTML; // gets html but includes the "<div id='weather-block'..." bit

    // remove old, unecessary element
    $(element).remove();

    await addslide(oldelement, realhtml);
    //updateslider(oldelement);
    if (preset == "message"){
        msg = data.message;
        $(element).text(msg);
    };
    //addslide(oldelement, htmlmsg.data.data);
    if (multi && !(sametype)){
        if (console.timeLog("msgtimer") > (20 *1000)){
            hintslide(oldelement)
        }
    }
    elementlock = false;
    console.log("end of change text box")
    releaselock(oldelement)
    console.timeEnd("msgtimer");
};


async function updatetextbox(data, preset, element){
    console.log("UPDATING")
    elementname = preset + "-block";

    // get json
    jsonmap = presetstore[preset]["json"];
    elementid = "#" + elementname;
    console.debug({data})
    html = await fillhtml(data, jsonmap, elementid)
    //$(elementid).html(html);

    console.timeLog("msgtimer");

    if (console.timeLog("msgtimer") > (10 *1000)){
            hintslide(oldelement)
    } else if (console.timeLog("msgtimer") > (20 *1000)){
        gotoslide(element, elementid)
    }
    console.timeEnd("msgtimer");
}
