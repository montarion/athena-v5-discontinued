$("document").ready(function(){
    elementarray = ["#toptext", "#bottomtext", "#topimage", "#bottomimage"];
    elementarray.forEach(initslider);
});

slideobj = {};
function initslider(element){
    //console.warn("initializing")
    base = '.swiper-container';
    target = element + base;
    //console.log("target is", target)
    // add wrapper
    wrapper = $('<div class="swiper-wrapper"></div>');
    $(target).append(wrapper);

    // add pagination
    pagination = $('<div class="swiper-pagination"></div>');
    $(target).append(pagination);

    swiper = new Swiper(target, {
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        watchOverflow: true, 
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
        },
        navigation:{
            nextE1: '.swiper-button-next',
            prevE1: '.swiper-button-prev',
            hideOnClick: true,
        },
    });
    slideobj[element] = swiper;

    // add navbuttons
    //$(target).append($('<div class="swiper-button-prev"></div>'));
    //$(target).append($('<div class="swiper-button-next"></div>'));


    // on hover handler
    $(target).hover(
        function(){
            elname = element + " > .swiper-pagination";
            $(elname).fadeIn(400);
        }, function(){
            elname = element + " > .swiper-pagination";
            $(elname).fadeOut(400);
        }
    );

    // hide them
    $(target + '.swiper-button-prev').hide()
    $(target + '.swiper-button-next').hide()

    // hide pagination
    //$(target + ".swiper-pagination").css("visibility", "hidden");

}

function addslide(element, htmldata){
    console.warn("Adding slide.")
    base = '.swiper-container > .swiper-wrapper';
    target = element + base;
    swiper = getslider(element);



    // add necessary class to html
    //console.warn($(htmldata))
    tmpdata = $(htmldata);
    $(tmpdata).addClass("swiper-slide");

    // make sure that it's flex
    $(tmpdata).css("display", "flex")

    htmldata = $(tmpdata)[0].outerHTML;
    //console.log(htmldata)

    swiper.appendSlide(htmldata);
}
/*
function reloadslider(element){
    $(element).slick("refresh");
}
*/
function reloadImage(target) {
    console.warn("this func lives in ui.js")
    path = target.attr("src");
    $('<img src="'+ path +'">').on("load", (function() {
      $(this).appendTo(target);
    }));
}

function updateslider(element){
    swiper = getslider(element);
    swiper.update()
}

function hintslide(element){
    // TODO:
    swiper = getslider(element);

    // turn element blue, for contrast
    // register eventhandler

    // half slide element to show that there's more
    currentpos = swiper.getTranslate();
    swiper.translateTo(currentpos-200, 400, true, false)

    // fade blink pageination circles to hint at what else just arrived
    elname = element + " > .swiper-pagination";
    $(elname).fadeIn(300);

    // slideback with timeout
    setTimeout(function(){
        swiper.translateTo(currentpos, 200, false, false);
        swiper.update()
        // blink
        $(elname).fadeOut(300);
     }, 600);

}
function getslider(element){
    swipercontainerid = "#"+$(element).attr("id");
    console.warn(element)
    console.warn(swipercontainerid)
    swiper = document.querySelector(swipercontainerid+'.swiper-container').swiper;
    return swiper
}
function gotoslide(element, target){
    swiper = getslider(element);
    swiper.slides.forEach(function(element, index){
        if(element == $(target)[0]){
            swiper.slideTo(index);
        }
    });
}
