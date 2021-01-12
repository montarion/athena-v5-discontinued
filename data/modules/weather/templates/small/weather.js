export async function fillCard(data, eltofill){
    // fill 
    $(eltofill).find("#iconurl").attr("src", data["iconurl"])
    $(eltofill).find("#temp").text(data["temp"])
    $(eltofill).find("#location").text(data["location"])
    // add background
    var fadeelement = "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(33,41,54,0) 40%)";
    var bgimgcss = 'url("' + data['background'] + '")';
    var finbackground = fadeelement + ", " +bgimgcss;
    $(eltofill).css('background-image', finbackground);
    return eltofill
}
