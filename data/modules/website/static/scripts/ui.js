$("document").ready(function(){
    elementarray = ["#toptext", "#bottomtext", "#topimage", "#bottomimage"];
    elementarray.forEach(initslider);
});

slideobj = {};
function initslider(element){
    console.warn("initializing")
    base = '.swiper-container';
    target = element + base;
    console.log("target is", target)
    // add wrapper
    wrapper = $('<div class="swiper-wrapper"></div>');
    $(target).append(wrapper);

    // add pagination
    pagination = $('<div class="swiper-pagination"></div>');
    $(target).append(pagination);

    swiper = new Swiper(target, {
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
    console.info("HANDLER ", {target}, {element})
    addhover(target, element)

    // hide pagination
    //$(target + ".swiper-pagination").css("visibility", "hidden");

}

function addhover(target, element){
    console.info("registering hover")
    $(target).hover(
        function(){
            elname = element + " > .swiper-pagination";
            $(elname).fadeIn(400);
        }, function(){
            elname = element + " > .swiper-pagination";
            $(elname).fadeOut(400);
        }
    );

}
function addslide(element, htmldata){
    console.warn("Adding slide.")
    base = '.swiper-container > .swiper-wrapper';
    target = element + base;
    swiper = getslider(element);



    // add necessary class to html
    console.warn(htmldata)
    tmpdata = $(htmldata);
    $(tmpdata).addClass("swiper-slide");

    // make sure that it's flex
    $(tmpdata).css("display", "flex")

    htmldata = $(tmpdata)[0].outerHTML;
    console.log({htmldata})

    swiper.appendSlide(htmldata);
}

function removeslide(target, element){

}
function reloadImage(target) {
    console.warn("this func lives in ui.js")
    path = target.attr("src");
    $('<img src="'+ path +'">').on("load", (function() {
      $(this).appendTo(target);
    }));
}

function updateslider(element){
    try{
        swiper = getslider(element);
        swiper.update()
    } catch (error) {
        console.warn("Couldn't update swiper object for element: ", element, "\nError: ", error)
    }
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
    //swiper = document.querySelector(element).swiper; //+'.swiper-container').swiper;
    try{
        swiper = slideobj[element];
    } catch (error) {
        console.warn("Couldn't find swiper object for element: ", element, "\nError: ", error)
        swiper = undefined
    }
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

function getparentcontainer(blockname){
    var parent = ""
    name = blockname.split("-")[0].substring(1)
    Object.keys(elementstore).forEach(function(blockname){
        target = elementstore[blockname]
        if (Array.isArray(target)){
            if ((target).includes(name)) {
                parent = blockname
            }
        }
    });
    return parent
}
async function transition(targetel, datael){
    // PLAN: remove other grid elements(fade out) DONE(no fade)
    //     : change grid to be 1row - 1 collumn and remove other element in slider DONE
    //     : update to new size
    //     : while growing, transition to new element
    
    var main = $(".maincontent")
    console.info("parent", {targetel}) // e.g. #anime-block
    var parentcontainer = getparentcontainer(targetel)
    console.info("parent", {parentcontainer})
    var posdata = $(parentcontainer).position()
    console.log("animation - ", {posdata})
    var parent = $(parentcontainer)
    pheight = parent.height()
    pwidth = parent.width()

    // remove other blocks
    var removearray = elementarray.filter(function(element){
        return !(element === parentcontainer);
    });
    console.info("block", {removearray})


    // animate old element //

    // find headerheight

    $(datael).css("display", "none") 
    $("<div/>").attr("id", "wrapper").appendTo(parentcontainer)
    $(parentcontainer).find("#wrapper").html(datael.html())
    var headerheight = $(parentcontainer).find("#wrapper").find(".bigheader").css("height")
    $(parentcontainer).find("#wrapper").remove()
    console.info("animation - height: ", headerheight)

    headerheight = $(parentcontainer).css("height") // just use element height
    heightinpercent = (parseInt(headerheight, 10)/window.innerHeight*100) + "%"
    invheightinpercent = (100-parseInt(heightinpercent, 10)) + "%" 
    console.info("animation - height: ", {heightinpercent})

    var animoriginsmobile = {
        "#toptext":{
            "1":{"rows": "60% 40% 0% 0%" },
            "2":{"rows": "100% 0% 0% 0%"}
        },
        "#bottomtext":{
            "1":{"rows": "0% 0% 40% 60%"},
            "2":{"rows": "0% 0% 0% 100%"}
        }
    }
    var animoriginsdesktop = {
        "#toptext":{
            "1":{"columns": "100% auto", "rows": heightinpercent + " auto"},
            "2":{"columns": "100% auto", "rows": "100% auto"}
        },
        "#bottomtext":{
            "2":{"columns": "0% 100%", "rows": "0% 0%"},
            //"1":{"columns": "0% 100%", "rows": "0% "+ -parseInt(headerheight, 10)},
            "1":{"columns": "0% 100%", "rows": "0% " + invheightinpercent} //+ -parseInt(headerheight, 10)},
        },
      }

    $.keyframe.define([{
        name: "go-fs-1",
        media: "screen and (max-width: 768px)",
        "0%": { // mobile
            //"grid-template-rows": animoriginsmobile[parentcontainer][1]["rows"]
            "opacity": "100%"
        },
        "100%": {
            //"grid-template-rows": animoriginsmobile[parentcontainer][1]["rows"],
            "opacity": "0%"
        },
        
        media: "screen and (min-width: 767px)", // desktop
        "0%": {
            "grid-template-columns": "40% auto", //"repeat(2, minmax(40%, auto))",
            "grid-template-rows":  animoriginsdesktop[parentcontainer][1]["rows"] //"repeat(2, minmax(10%, auto))"
        },
        "100%": {
            // OLD: "grid-template-columns": "repeat(2, minmax(" + animorigins[parentcontainer][1]["columns"]+ "))",
            "grid-template-columns": animoriginsdesktop[parentcontainer][1]["columns"],
            "grid-template-rows": animoriginsdesktop[parentcontainer][1]["rows"]
        }
        
    }]);

    $.keyframe.define([{
        name: "go-fs-2",
        media: "screen and (max-width: 768px)",
        "0%": { // mobile
            "grid-template-rows": animoriginsmobile[parentcontainer][1]["rows"],
            "opacity": "0%"
        },
        "50%":{
            "grid-template-rows": animoriginsmobile[parentcontainer][2]["rows"],
        },
        "100%": {
            "opacity": "100%"

        },
        
        media: "screen and (min-width: 768px)", // desktop
        "0%": {
            "grid-template-columns": animoriginsdesktop[parentcontainer][1]["columns"],
            "grid-template-rows": animoriginsdesktop[parentcontainer][1]["rows"]
        },
        "100%": {
            "grid-template-columns": animoriginsdesktop[parentcontainer][2]["columns"],
            "grid-template-rows": animoriginsdesktop[parentcontainer][2]["rows"]
        }
        
    }]);
    var stopupdate = false;

    // register animation start handler
    $(".maincontent").one("animationstart", function(){
        $(targetel).css("background-size", "cover")
        var animtarget = ""
        if ($(window).width() >= 768){ //desktop
            animtarget = animoriginsdesktop
            $(".maincontent").css("grid-template-rows",  animtarget[parentcontainer][1]["rows"])

        } else {
            animtarget = animoriginsmobile
            // get current heights and convert to percentage
            var tmpdict = {}
            elementarray.forEach(function(element){
                var elname = element.substring(1)
                var percentheight = parseInt(window.getComputedStyle(document.getElementById(elname)).height) / $(window).height() * 100
                tmpdict[elname] = percentheight + "%"
            })
            var fintext = tmpdict.toptext + " " + tmpdict.topimage + " " + tmpdict.bottomimage +  " " + tmpdict.bottomtext;
            console.log("FINTEXT: ", fintext)
            $(".maincontent").css("grid-template-rows",  fintext)

        }

        animationid = setInterval(function(){
            updateslider(parentcontainer) // e.g. "#toptext"
            console.log("animation - updating..")

            if (stopupdate) {
                clearInterval(animationid);
            }
        }, 10);
    })

    // register animationend handler
    $(".maincontent").one("animationend", function(){
        // set new grid-template-areas
        if ($(window).width() >= 768){ //desktop
            $(".maincontent").css("grid-template-areas", "'" + parentcontainer + "'")
            $(".maincontent").css("grid-template-columns", "repeat(2, minmax(" + animorigins[parentcontainer][1]["columns"]+ "))")
            $(".maincontent").css("grid-template-columns", animoriginsdesktop[parentcontainer][1]["columns"])
            $(".maincontent").css("grid-template-rows",  animoriginsdesktop[parentcontainer][1]["rows"])
        } else { // mobile
            //$(".maincontent").css("grid-template-areas", "'" + parentcontainer + "'")
            //$(".maincontent").css("grid-template-rows", animoriginsmobile[parentcontainer][1]["rows"])
        }
        $(".maincontent").css("overflow", "hidden")

        $(".maincontent").css("color", "green")


        stopupdate = true
    })
    console.log("animation - ", "registered")
    var duration = ""
    if ($(window).width() >= 768){ //desktop
        duration = "2s"
    } else {
        duration = "1.5s"
    }
    $(".maincontent").css("overflow", "hidden")
    $(".maincontent").trigger("animationstart")
    $(".maincontent").css("animation", "go-fs-1 3s")
    
    //$(".maincontent").trigger("animationstart")
    //$(".maincontent").playKeyframe({name:'go-fs-1', duration: duration, complete: _playsecondanimation})
    // remove other slides from remaining block
    getslider(parentcontainer).slides.forEach(function(slide, index){
        console.info("slide - trying to keep", (targetel.substring(1)))
        if (!(targetel.substring(1) === slide.id)){
            console.info("slide - trying to remove", parentcontainer + " #" + slide.id)
            console.info("slide index: ", index)
            //getslider(parentcontainer).removeSlide(index)
            getslider(parentcontainer).allowTouchMove = false
            updateslider(parentcontainer)
        }
    });


    $(datael).css("visibility", "none")
    $(datael).css("opacity", "0")
    $(datael).css("display", "block")

    var header = $("." + datael.prop("class") + " > .bigheader")
    console.info("animation", header.height())
    console.info("animation", parent.position().top)
    hheight = header.height() //+ 40
    hwidth = header.width() //- 20


                                // animate new element //

    //alert("ready")

    

    function _playsecondanimation(){
        //$(".maincontent").trigger("secondanimationstart")
        //$(parentcontainer).prepend(datael.html()) //prepend was html
        $(parentcontainer).children().fadeOut(500)
        $(parentcontainer).addClass(datael.prop("class"))
        $(parentcontainer).prepend(datael.html())
        console.info("animation 2 ", $(parentcontainer).children())

        $(".maincontent").playKeyframe('go-fs-2 1s', function() {
            //$(".maincontent").css("grid-template-columns",  animoriginsdesktop[parentcontainer][2]["columns"])
            //$(".maincontent").css("grid-template-rows",  animoriginsdesktop[parentcontainer][2]["rows"])
            if ($(window).width() >= 768){ //desktop
                $(".maincontent").css("grid-template-columns", animoriginsdesktop[parentcontainer][2]["columns"])
                $(".maincontent").css("grid-template-rows",  animoriginsdesktop[parentcontainer][2]["rows"])
            } else { // mobile
                $(".maincontent").css("grid-template-rows", animoriginsmobile[parentcontainer][2]["rows"])
            }

            // finally, remove other elements
            removearray.forEach(function(element){
                $(element).hide() //fadeOut(5000*0.6)
                //$("#bottomimage").hide() //fadeOut(5000*0.6)
                //$("#bottomtext").hide()
            });

        })
    }
    updateslider(parentcontainer)
}

function growelement(elementlist, origin){ //element is what is shown, origin is for animations
    //TODO: have element take up the whole page(on phone, a la material design cards), or a large part on desktop
    //save html state
    ls.setItem("MAINCONTENT", JSON.stringify($(".maincontent")[0].outerHTML))

    console.info({origin})
    // remove previous html
    emptyhtml = $('<div class="maincontent focus">'); // focus gets rid of the grid stuff
    var parent = $(".maincontent").parent()
    // hide old maincontent
    //$(".maincontent").css("display", "none")
    // add new version of maincontent
    //parent.append(emptyhtml)

    //insert card
    newcard = $('<div class="bigcard">');
    //$(newcard).css("height", "calc(100% - 40px)") // 40px is 20px margin x2

    //apend contents to card
    //contents = $(element)
    elementlist.forEach(function(element){
        $(newcard).append($(element))
    });

    transition(origin, newcard)
    //append new, filled element to maincontent(focus edition)
    //$(".maincontent.focus").append(newcard)
    
}
function gohome(origin){ // "#toptext"
    // unhide other elements
    var removearray = elementarray.filter(function(element){
        return !(element === origin);
    });

    console.log({removearray})
    removearray.forEach(function(element){
        $(element).show()
    })

    var stopupdate = false
    var duration = ""
    if ($(window).width() >= 768){ //desktop
        duration = "2s"
    } else {
        duration = "0.5s"
    }


    // play first(second) animation in reverse
    if (!animationid){
        animationid = setInterval(function(){
            elementarray.forEach(function(element){
                console.log("Animation - updating element: ", element)

                updateslider(element)
            })
            //updateslider(origin) // e.g. "#toptext"
            console.log("animation - updating..")
            console.log("animation 1 - ", stopupdate, animationid)
            if (stopupdate) {
                clearInterval(animationid);
                animationid = false
            }
        }, 10);
    };

    $(".maincontent").playKeyframe({
        name:'go-fs-2', 
        duration:"1s", 
        direction:"reverse", 
        complete:function(){

            stopupdate = true;
            // unhide old slider elements, and remove big elements
            $(origin).children().toArray().forEach(function(element){
                if ($(element).attr("class").includes("swiper")){
                    $(element).show()
                } else {
                    $(element).hide()
                }
            });

            // restore grid state
            if ($(window).width() >= 768){ //desktop
                $(".maincontent").css("grid-template-columns", "repeat(2, minmax(40%, auto))")
                $(".maincontent").css("grid-template-rows", "repeat(2, minmax(10%, auto))")
            } else{
                $(".maincontent").css("grid-template-rows", "repeat(4, minmax(10%, auto))")
            }

            // play second(first) animation in reverse
            stopupdate = false
            console.log({animationid})
            animationid = false;
            if (!animationid){
                animationid = setInterval(function(){
                    elementarray.forEach(function(element){
                        console.log("Animation - updating element: ", element)
                        updateslider(element)
                    })

                    //updateslider(origin) // e.g. "#toptext"
                    console.log("animation - updating..")
                    console.log("animation 1 - ", stopupdate, animationid)
                    if (stopupdate) {
                        clearInterval(animationid);
                        animationid = false
                    }
                }, 10);
            };

            $(".maincontent").playKeyframe({
                name:'go-fs-1',
                duration:"duration",
                direction:"reverse",
                complete:function(){
                    stopupdate = true;

                    // allow slider movement
                    getslider(origin).allowTouchMove = true
                    stopupdate = true

                    elementarray.forEach(function(element){
                        console.log("Animation - updating element: ", element)
                        updateslider(element)
                    })

                }

            })
        }
    })


    // allow slider movement
    getslider(origin).allowTouchMove = true

    //updateslider(origin)

    // restore onclick listeners

    // restore old maincontent.
    $(".maincontent").css("display", "grid")
}



