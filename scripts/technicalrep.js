
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

function fetch_training_topics_handler()
{
    if (this.status===200)
    {
        topics = JSON.parse(this.responseText);
        
        if (topics.length==0)
        {
            swal({
                title: "Data Error",
                text: "no training topics found. please talk to the admin about this!",
                type: "error",
                confirmButtonText: "Logout",
                closeOnConfirm:false
              },
              
              function(){window.location.href="index.html";}
              
              );
            return 0;
        }

        stop_connecting();
        
        for (var i=0; i<topics.length; i++)
        {
           //"area_trained"
           var option = document.createElement("option");
           option.value = topics[i][0];
           option.innerHTML = topics[i][0];
           document.getElementById("area_trained").appendChild(option);
        }
        
    }
    else
    {
        swal({
            title: "Server Error",
            text: "error: "+this.status+"; "+this.responseText,
            type: "error",
            confirmButtonText: "Ok"
          });
    }

}

window.onload = function(){
    if (window.name==""){window.location.href="index.html"; return 0;}

    // fetch the latest training topics...
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"training_topics_full", true);

    req.onload = fetch_training_topics_handler;

    req.send(null);
    start_connecting("fetching training topics...");

    // set body size to a fixed value corresponding to the screen...
    document.getElementById("body").style.height = window.innerHeight+"px";
    document.getElementById("body").style.width = window.innerWidth+"px";
}






