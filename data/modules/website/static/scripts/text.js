// pick between bottom text or toptext
//hardcode for now


presetstore = {} // stores ui data
elementstore = {} // stores element data

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
function fillhtml(data, jsonmap){
    console.warn("INSIDE FILLHTML")
    console.log(data)
    console.log({element})
    for (x in jsonmap){
        curarray = jsonmap[x];
        console.log(curarray)
        for (innercontainer in curarray){
            containerelement = element + " > ." + innercontainer;
            console.log(containerelement)
            item = curarray[innercontainer];
            console.log(item)
            for (i in item){
                finitem = item[i];
                console.trace(finitem)
                if (typeof finitem == "object"){
                    // dictionary
                    console.warn("dictionary")
                    console.log({finitem})
                    console.log({innercontainer})
                    Object.keys(finitem).forEach(function (key){
                        console.log(key)
                        value = finitem[key];
                        console.log(value)
                        if(innercontainer == "-background"){

                            if(!(key[0] == "-")){ //continue, something we need
                                console.log({data})
                                console.log("working on:", key)
                                obj = data[key][value]
                                console.log({obj})
                                // got background info, now check for options
                                if(Object.keys(finitem).includes("-options")){
                                    // options object for background found
                                    val = finitem["-options"]
                                    if (val == "fade"){
                                        fadeelement = "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(3,4,4,0.19929978827468486) 100%)";
                                        bgimgcss = 'url("' + obj + '")';
                                        finbackground = fadeelement + ", " +bgimgcss;
                                        console.log({finbackground})
                                        $(element).css('background-image', finbackground);
                                    } else{
                                        finbackground = 'url("' + obj + '")';
                                    }
                                    $(element).css('background-image', finbackground);
                                    console.warn("added background to: ", element);
                                }
                            }
                        }
                        console.warn("done with background");
                    })
                    console.warn("done with dictionary");
                }else{
                    key = Object.keys(finitem).map(function(key){return key})
                    newdata = data[key]
                    console.log({newdata})
                    value = Object.keys(finitem).map(function(key){return finitem[key]})
                    console.log(key, value)
                    /*
                        if(innercontainer == "-background"){
                            
                            console.log("TEST")
                            console.log(element)
                            console.warn("changing background")
                            
                            $(element).css('background-image', 'url("' + obj + '")');
                            // change background for element inside
                            $(element + " > div").css("background", "transparent");
                            //$(outputelement).load(obj);
                            //loadImage(obj, element);

                            //continue

                        }
                        if (imglist.includes(finitem)){
                            // TODO: add option for background(if finitem == "background" or "bg"
                            $(outputelement).attr("src", obj);
                            //$(outputelement).load(obj);
                            loadImage(obj, outputelement);
                        } else {
                            $(outputelement).text(obj);
                        }
                    }*/
                    updateslider(oldelement);

                    outputelement = containerelement + " > #" + finitem;
                    obj = data[finitem];
                    console.log(finitem)
                    console.log(outputelement)
                    console.log(obj)
                    if (imglist.includes(finitem)){
                        $(outputelement).attr("src", obj);
                        //$(outputelement).load(obj);
                        res = loadImage(obj, outputelement);
                        while (!(res)){} // wait for image to load
                        

                    } else {
                        $(outputelement).text(obj);
                    }
                }
            };
        };
    };

    // get html of element
    html = $(element).html();
    console.warn(element)
    return html;
}
async function changetextbox(data, preset="message"){
    console.log(preset)
    console.log(data)
    element = pickelement(data);
    console.log(elementstore)
    if (!(element in elementstore)){
        elementstore[element] = [];
        multi = false; // flag used for hint
    } else {
        console.log("found multiple, adding carousel")
        multi = true; // flag used for hint
        // save previous element
        console.log($(element).children())
        child = $(element).children()[0];
        
        // multiple in element
        console.log(element)
        
    } 
    elementstore[element].push(preset)
    if (!(preset  in presetstore)){
        presetstore[preset] = {}; // allows for the other checks to run properly
    }

    // create new block
    elementname = preset + "-block";
    newelement = $('<div id="' + elementname + '"></div>');
    $(element).append(newelement)
    oldelement = element
    element = "#" + elementname;
    //$(newelement).css("diplay", "flex");
    console.log($(newelement))
    // get preset css
    if (!("url" in presetstore[preset])){
        url = createurl("templates", preset, preset+".css");
        $("head").append("<link rel='stylesheet' id='extracss' href='" + url + "' type='text/css' />");
        presetstore[preset]["url"] = url;
    };

    // get preset html
    if (!("html" in presetstore[preset])){
        htmldata = {"preset": preset, "filename": preset+".html"}
        msg = msgbuilder("web", "template", htmldata);
        console.log("started wait")
        htmlmsg = await waitforresult(msg); //.then(console.warn); // func in networking that returns message
        console.log("done waiting")
        console.log(htmlmsg)
        presetstore[preset]["html"] = htmlmsg;
    }
    htmlmsg = presetstore[preset]["html"];

    // get preset json
    if (!("json" in presetstore[preset])){
        jsondata = {"preset": preset, "filename": preset+".json"}
        msg = msgbuilder("web", "template", jsondata);
        console.log("started wait")
        jsonmap = await waitforresult(msg);
        jsonmap = jsonmap.data;
        console.log(jsonmap)
        presetstore[preset]["json"] = jsonmap;
    }
    jsonmap = presetstore[preset]["json"];

    // save data
    presetstore[preset]["data"] = data;
    console.log("end of change text box")

    // apply it
    console.log("applying to:", element)
    $(element).html(htmlmsg.data.data);


    // fill in data
    console.log({oldelement})
    html = fillhtml(data, jsonmap)
    $(element).html(html);

    // add element to slider
    console.trace($(element)[0].outerHTML)
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
    if (multi){
        hintslide(oldelement);
    }

};


