export async function fillCard(data, eltofill){
    
    // fill 
    //$(eltofill).find("#uptime").text("Uptime: " + data["misc"]["uptime"])
    $(eltofill).find("#cpu").text("CPU: " + "processor stuff")

    var res = data["storage"]
    console.log({res})
    var diskel = $(eltofill).find("#disks")
    console.log(diskel)
    // add title
    $(diskel).append("Disk usage:", "<br>")
    // fill data
    Object.keys(res).forEach(function(drivename){
        var used = res[drivename]["disk_used"]
        var newel = $("<span></span>").attr("id", drivename).text(drivename + ": " + used + "%")
        $(diskel).append(newel, "<br>")
    });
    // add event listeners for specific big card stuff? TODO

    // memory
    $(eltofill).find("#memory").text("Memory: " + data["memory"])
    //$(eltofill).find("#uptime").text("Uptime: " + data["misc"]["uptime"])

    // add background // NO BACKGROUND

    //var fadeelement = "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(33,41,54,0) 40%)";
    //var bgimgcss = 'url("' + data['art']['banner'] + '")';
    //var finbackground = fadeelement + ", " +bgimgcss;
    //$(eltofill).css('background-image', finbackground);
    return eltofill
}

function _getdata(data, datatype){
    console.info("MONITOR - GET DATA")
    var res = {}
    console.info({data})
    console.info(data[datatype])

    Object.keys(data[datatype]).forEach(function(k){
        
        console.info({k})
        //var v = k[1]
        var key = k[0]
        var val = data[datatype][k]
        res[k] = val
        console.info({res})
        console.info({key}, {val})
        var test = data[datatype]
        console.info({test})
    })
    console.info(data[datatype]["/"]["disk_used"])
    console.info({res})
    
    return res;
}
