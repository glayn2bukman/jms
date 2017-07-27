
function on_locate(position) {
    var lat = ""+position.coords.latitude, lon = ""+position.coords.longitude;
    stop_connecting(); //close the "getting gps location..." swal

    var user = new USER(window.name); //uname -> user.uname

    var now = new Date();
    var date = now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear(); 
    date = change_date(date);
    
    var t = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    t = change_time(t);
    
    var form = new FormData();
    form.append("uname", user.uname);
    form.append("CMEs", parseInt(document.getElementById("CMEs").value));
    form.append("facility", document.getElementById("facility").value);
    form.append("date", date);
    form.append("time", t);
    form.append("lat", lat);
    form.append("lon", lon);
    form.append("area_trained", document.getElementById("area_trained").value);
    form.append("remark", document.getElementById("remark").value);

    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"technical_report", true);

    req.home_link = "technicalrep.html";
    req.onload = report_handler;

    req.send(form);

    // clear widgets
    document.getElementById("facility").value = "";
    document.getElementById("remark").value = "";
}

function submit_report(){locate();}

window.onload = function(){}






