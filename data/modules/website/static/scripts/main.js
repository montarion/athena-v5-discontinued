$('document').ready(function(){
    $(window).resize(function(){
        //resizeimage("#topimage")
        //resizeimage("#bottomimage")
    });
    $("img").on("load", function(){
        console.log("hey")
        console.log($(this).width())
    });
/*    $('.main-carousel').flickity({
      // options
      cellAlign: 'left',
      contain: true
    });
    addimage();*/
    //addimage("#bottomimage", "static/files/images/test.jpg")
});

