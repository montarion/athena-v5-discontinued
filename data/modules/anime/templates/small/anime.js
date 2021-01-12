export async function fillCard(data, eltofill){
    // fill 
    $(eltofill).find("#episode").text(data["episode"])
    $(eltofill).find("#title").text(data["title"])

    // add background
    var fadeelement = "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(33,41,54,0) 40%)";
    var bgimgcss = 'url("' + data['art']['banner'] + '")';
    var finbackground = fadeelement + ", " +bgimgcss;
    $(eltofill).css('background-image', finbackground);
    return eltofill
}
