// pick between bottom text or toptext
//hardcode for now

presetstore = {} // stores ui data
elementstore = {"lock":""} // stores element data
ls = localStorage
function createurl(store, location, filename, size){
    //url = "{{ url_for(" + store + ", filename=" + filename + ") }}"
    url = window.location + store + "/" + size + "/" + location + "/" + filename;
    console.log({url})
    return url;
}
function pickelement(data){
    randchoice = Math.floor(Math.random() * 2);
    console.info({data})
    if ("image" in Object.keys(data)){
        if (randchoice == 1){
            element = "#bottomimage";
        } else {
            element = "#topimage";
        }
    } else {
        if (randchoice == 1){
            element = "#bottomtext";
        } else {
            element = "#toptext";
        }
    }
    //return "#toptext" //element
    //return "#bottomtext"
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
    for (classtype in jsonmap){
        catentries = jsonmap[classtype];
        if (typeof catentries[0] == "object"){
            // dictionary
            Object.values(catentries).forEach(function (dictobj){
                Object.keys(dictobj).forEach(function(key){
                    value = dictobj[key]
                    if(classtype == "-background"){
                        finbackground = ""
                        if(!(key[0] == "-")){ //grab background first before looking at options
                            console.debug("working on:", key)
                            if(value =="-ignore"){
                                obj = data[key];
                            } else {
                                obj = data[key][value];
                            }
                            finbackground = 'url("' + obj + '")';
                            console.info("dictobj", finbackground)
                            // got background info, now check for options
                            if(Object.keys(catentries[0]).includes("-options")){
                                // options object for background found
                                val = catentries[0]["-options"]
                                if (val == "fade"){
                                    fadeelement = "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(33,41,54,0) 40%)";
                                    bgimgcss = 'url("' + obj + '")';
                                    finbackground = fadeelement + ", " +bgimgcss;
                                    $(element).css('background-image', finbackground);
                                }
                            }
                        $(element).css('background-image', finbackground);
                        updateslider(oldelement)
                        console.debug("added background to: ", element);
                        }
                    }
                });
            });
            console.log("done with dictionary");
        } else {
            console.log("NOT A DICTIONARY")
            console.info({catentries})
            catentries.forEach(function(key, index){
                value = data[key]
                updateslider(oldelement);
                containerelement = element + " > ." + classtype;
                outputelement = containerelement + " > #" + key;
                obj = value;
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



async function releaselock(){
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
            } else {
                console.log("WAITING FOR LOCK")
            }
        }, 1000);
    })
}
async function getelementinfo(preset, size="small"){
    console.info("elementinfo - ", preset)

    // get preset css
    console.log("grabbing css")
    if (!("url" in presetstore[preset][size])){
        url = createurl("templates", preset, preset+".css", size);
        $("head").append("<link rel='stylesheet' id='extracss' href='" + url + "' type='text/css' />");
        presetstore[preset][size]["url"] = url;
    };

    // get preset javascript
    console.log("grabbing js")
    if (!("js" in presetstore[preset][size])){
        url = createurl("templates", preset, preset+".js", size);
        //$('<script>').attr('src', url).appendTo('head');
        //$("head").append("<script src='" + url + "'></script>");
        presetstore[preset][size]["js"] = url;
    };

    // get preset html
    console.log("grabbing html")
    presetlist = [];
    if (!("html" in presetstore[preset][size])){
        presetlist.push(preset+".html");
    }

    // get preset json
    console.log("grabbing json")
    if (!("json" in presetstore[preset][size])){
        presetlist.push(preset+".json");
    }
    // build msg
    presetdata = {"preset": preset, "filenames": presetlist, "size": size}
    msg = msgbuilder("web", "template", presetdata);
    console.info(msg)
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
    //while (Object.keys(templatedata.data).length == 0){} 
    let html = templatedata.data[preset+".html"];
    let json = templatedata.data[preset+".json"];

    let findata = {"html": html, "json":json};
    console.info({findata})
    releaselock()
    return findata
}
blacklist = ["admin", "web", "template", "text-text", "text-image"];

async function changetextbox(data, presettype="message"){
    console.log("IN TEXTBOX")
    let preset = presettype;
    console.info({preset})
    console.info({data})
    // save data
    if (!(ls.preset)){ // not yet in storage
        ls.setItem(preset, JSON.stringify({}))
    }
    existingdict = JSON.parse(ls.getItem(preset))
    Object.keys(data).forEach(function (key){
        //console.log("Working on: ", key)
        val = data[key]
        existingdict[key] = val
    });
    //console.debug({existingdict})

    ls.setItem(preset, JSON.stringify(existingdict))
    //done
    // start timer
    console.time("msgtimer")
    console.info({data})

    //console.debug(data)
    element = pickelement(data);
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
            console.info("found previous card of type, updating")
            console.log(preset)
            updatetextbox(data, preset, element);
            sametype = true;
            //releaselock(element)
            return // was return
        }

    }
    elementstore[element].push(preset)
    if (!(preset in presetstore)){
        presetstore[preset] = {"small":{}, "big":{}}; // allows for the other checks to run properly
    }

    // create new block
    let elementname = preset + "-block";
    newelement = $('<div id="' + elementname + '"></div>');
    $(element).append(newelement)
    oldelement = element
    element = "#" + elementname;
    //$(newelement).css("diplay", "flex");

    setlock()
    let {html, json} = await getelementinfo(preset, "small"); // just the standard element after all.
    console.info({html}, {json})
    if (typeof html == "undefined"){
        console.info("FAILED TO GET ELEMENT INFO FOR:", data)
        //releaselock(element)
        return // was return

    }
    console.debug("Done with elementinfo")

    // save those values
    presetstore[preset]["small"]["html"] = html;
    presetstore[preset]["small"]["json"] = json;


    // save data
    presetstore[preset]["data"] = data;

    // apply it
    console.debug({data})
    preelext = element.split("-");
    elementname = preelext[0].substring(1)
    elext = preelext[preelext.length-1]
    console.log({elext})
    if (elext != "block"){return} // was return
    console.info("applying to:", element)
    console.info({html})
    $(element).html(html);

    // get preset javascript
    console.log("grabbing js")
    url = createurl("templates", elementname, elementname+".js", "small");
    console.log(url)
    let catname = await import(url)
    var realhtml = await catname.fillCard(data, element)
    console.info(realhtml)
    console.info({oldelement}, realhtml)
    //////////////////////////////////OLD STUFF/////////////////////////////////////////////////
    await addslide(oldelement, realhtml); // places realhtml in swiper-container>swiper-wrapper class, so change element accordingly

    //// cleanup ////
    // remove old, unecessary element
    $(oldelement + " > " + element).remove();
    // done //

    element = oldelement + "  " + element // descendent, not child

    if (preset == "message"){
        msg = data.message;
        $(element).text(msg);
    };

    if (multi && !(sametype)){
        hintslide(oldelement)
    }
     // add onclick listener
    $(element).click(onelementclick);

    elementlock = false;
    console.log("end of change text box")
    releaselock()
    console.timeEnd("msgtimer");
    return true;
};


async function updatetextbox(data, preset, element){
    console.log("UPDATING")
    elementname = preset + "-block";

    // get json
    jsonmap = presetstore[preset]["small"]["json"];
    elementid = "#" + elementname;
    console.debug({data})
    html = await fillhtml(data, jsonmap, elementid)
    $(elementid).html(html);

    console.timeLog("msgtimer");
    if (console.timeLog("msgtimer") > (2 *1000)){
            hintslide(oldelement)
    } else if (console.timeLog("msgtimer") > (10 *1000)){
        gotoslide(element, elementid)
    }
    console.timeEnd("msgtimer");
    //releaselock(element)
}

async function onelementclick(element){ // expand
    // register with: $("#anime-block").click(onelementclick);

    console.warn("CLICKED ON ELEMENT: ", element)
    var size = "big"
    var elementid = element.delegateTarget.id
    var elementname = elementid.split("-")[0]
    elementid = "#" + elementid
    console.log(elementid)
    console.log({elementname})

    // create new element
    newelement = $('<div id="' + elementid + '"></div>');
    $(elementid).append(newelement)

    // get additional data, css, html(display loader)
    let {html, json} = await getelementinfo(elementname, "big")

    // /////////////////MOVED TO anime.js in templates/big ///////////////////////////////////////
    console.log({json}) // think about how you write down what to request in the json.
    // {"category":"anime"(preset), "type":"list", "data":showname}
    // where showname is the variable for the last show(save that from previous request?)
    // ask for data
    // trigger anime.js
    console.log(elementname + "onClick")
    // get preset javascript
    console.log("grabbing js")
    url = createurl("templates", elementname, elementname+".js", size);
    console.log(url)
    let catname = await import(url) 
    console.info(catname)
    var filledelement = await catname.onClick(element, html)
    console.info({filledelement})
    // grow element to fullpage
    growelement(filledelement, elementid)
}
