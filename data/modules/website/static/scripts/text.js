// pick between bottom text or toptext
//hardcode for now


weatherpreset = 
    "<div class='text-image'></div>"+
    "<div class='text-text'>" +
        "<span>It's </span>" +
        "<span class='bold' id='temp'></span>"+
        "<span>degrees in </span><span id='city'></span>"+
    "</div>";

function changetextbox(data, preset="message"){
    console.log(preset)
    console.log(data)
    element = "#bottomtext";
    if (preset == "message"){
        msg = data.message;
        $(element).text(msg);
    };
    if (preset == "weather"){
        city = data.city;
        temp = data.temp;
        iconurl = data.iconurl;
        $(element).html(weatherpreset);
        imgcon = element + " > .text-image";
        //addimage(imgelement, iconurl);
        // image first
        tmpimg = new Image();
        tmpimg.src = iconurl;
        imgname = "weather-icon";
        tmpimg.id = imgname;
        $(imgcon).append(tmpimg);
        
        // then the text
        tempastext = "Fiveteen";
        $("#temp").text(tempastext);
        $("#city").text(city);
        // and then change the css
        $(element).css("justify-content", "flex-start");

        // set width
        imgconheight = $(imgcon).css("height");
        $(imgcon).css("width", imgconheight);
        $(imgcon + " > #" + imgname).css("height", "100%");

    };
};
