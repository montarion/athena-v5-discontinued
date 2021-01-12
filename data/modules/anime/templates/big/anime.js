export async function onClick(element, newhtml){
    console.warn("INSIDE ANIME: ", element)
    var size = "big"
    var elementid = element.delegateTarget.id
    var elementname = elementid.split("-")[0]
    elementid = "#" + elementid
    console.log(elementid)
    console.log({elementname})
    // perform network request for list(already have image and text saved)

    data = {"title":JSON.parse(ls.anime)["title"]}
    console.info(data)
    msg = msgbuilder("anime", "eplist", data)
    var result = await waitforresult(msg)
    console.info({result})
    console.info("DID IT!")
    console.info(newhtml)
    var finelement = fillelement(result.data, newhtml, elementid)
    return finelement
}
// js specially for the big stuff, so..

function fillelement(data, newelement, oldelement){
    console.info({data})
    var newel = $("<div>");
    $(newel).html(newelement)
    
    var anidict = JSON.parse(ls.anime)

    // grab old info
    var bannerurl = anidict.art.banner
    $(newel).find("#banner").attr("src", bannerurl)
    var coverurl = anidict.art.cover
    $(newel).find("#cover").attr("src", coverurl)

    // get new info
    var title = anidict["title"]
    var tmp = $('<div class="list">');
    data.forEach(function(entry) {
        console.info(entry)
        // build element
        var tmpitem = $('<div class="listitem">');
        $(tmpitem).append('<span class="title">' + title + '</span>')
        $(tmpitem).append('<span class="episode">' + entry.episode + '</span>')
        $(tmpitem).append('<span class="compressed">' + entry.compressed + '</span>')
        $(tmpitem).append('<span class="size">' + entry.size + '</span>')
        $(tmp).append(tmpitem)
        console.info($(tmp).html())
    })
    $(newel).find(".details").append(tmp)
    console.info($(newel).find(".details"))
    console.info($(newel).html())
 
    console.info(newel.children().toArray())
    return newel.children().toArray()        // return list of elements
}
