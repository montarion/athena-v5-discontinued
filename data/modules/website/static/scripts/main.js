console.time("LOG")
$('document').ready(function(){
    $(window).resize(function(){
        //resizeimage("#topimage")
        //resizeimage("#bottomimage")
    });
    $("img").on("load", function(){
        console.log("hey")
        console.log($(this).width())
    });
    // start msg handler
    //msghandler()
    setInterval(msghandler, 2000) // msghandler lives in networking.js
    //addimage();
    //addimage("#bottomimage", "static/files/images/test.jpg")
});

