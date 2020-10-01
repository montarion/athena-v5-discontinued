$('document').ready(function(){
    $(window).resize(function(){
        //resizeimage("#topimage")
        //resizeimage("#bottomimage")
    });
    $("img").on("load", function(){
        console.log("hey")
        console.log($(this).width())
    });
    addimage();
    //addimage("#bottomimage", "static/files/images/test.jpg")
});

imgwidth = 0;
imgheight = 0;
testimgurl = "static/files/images/test2.jpg";
function addimage(container="#topimage", imgurl=testimgurl){
    imgconheight = $(container).height();
    imgconwidth = $(container).width();
    tmpimg = new Image();
    //tmpimg.onload = imgloaded();
    tmpimg.onload = function() {imgloaded(this, container)}
    tmpimg.src = imgurl;
    imgnamearr = imgurl.split("/");
    imgname = imgnamearr[imgnamearr.length - 1];
    tmpimg.id = imgname;
    $(container + " > .image-image").append(tmpimg);
    imgobj = $(container + " > .image-image > img");
    console.log( imgobj.width())
    //resizeimage(container);
    //$("#topimage > .image-image > img").width(imgconwidth);
    //$("#topimage > .image-image > img").height(imgconheight);
};

function resizeimage(jqimgcon){
    imgconheight = $(jqimgcon).height();
    imgconwidth = $(jqimgcon).width();
    console.log(imgconheight)
    jqimgpath = jqimgcon + " > .image-image > img";

    $(jqimgpath).height(imgconheight);
    $(jqimgpath).width(imgconwidth);
}

function imgloaded(image, container){
    // kay so.. image needs to be sized to width of container, and then strechted/shrunk.
    //

    console.log("yooooooo")
    imgwidth = image.width;
    imgheight = image.height;
    imgconheight = $(container).height();
    imgconwidth = $(container).width();

    console.log(imgwidth)
    console.log(imgconwidth)

    // size image
    $(image).width(imgconwidth);

    ogaspect = imgconwidth/imgwidth;
    
    // then shrink height wise
    $(image).height(imgheight*ogaspect);
    //$(container).width(imgwidth);
    
    imgconheight = $(container).height();
    imgconwidth = $(container).width();

    console.log(imgheight)
    console.log(imgconheight)

}
