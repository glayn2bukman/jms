
function on_locate(position)
{
    if (document.getElementById("hours").value=="hours" || document.getElementById("mins").value=="mins")
    {
        swal({
            title: "Value Error",
            text: "invalid duration selected",
            type: "error",
            confirmButtonText: "Ok"
          });
          
        return 0;
    }

    stop_connecting(); //close the "getting gps location..." swal

    var lat = ""+position.coords.latitude, lon = ""+position.coords.longitude;
    
    var user = new USER(window.name); //uname -> user.uname

    var now = new Date();
    var date = now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear(); 
    date = change_date(date);
    
    var t = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
    t = change_time(t);

    var mom = document.getElementById("activities");
    var options = mom.children;
    var selected = "";
    
    for (var i=0; i<options.length; i++)
    {
        if (options[i].selected) 
        {
            if (selected=="")
            {
                selected += options[i].value;
            }
            else
            {
                selected += ", "+options[i].value;
            }
        }
    }

/*
    activities = request.form["activities"]
    time_spent = request.form["time_spent"]
*/

    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"technical_report_core", true);
    req.onload = report_handler;

    var form = new FormData();

    form.append("uname", user.uname);
    form.append("date", date);
    form.append("time", t);
    form.append("lat", lat);
    form.append("lon", lon);
    form.append("facility", document.getElementById("facility").value);
    form.append("remark", document.getElementById("remark").value);    
    form.append("personnels_engaged", document.getElementById("engaged_personnel").value);
    form.append("issues_arising", document.getElementById("issues_arising").value);
    form.append("perfomance_against_target", document.getElementById("performance_against_target").value);
    form.append("status_of_engagement", document.getElementById("engagement_status").value);
    form.append("activities", selected);
    form.append("time_spent", document.getElementById("hours").value+"hrs, "+document.getElementById("mins").value+"mins");
    
    req.send(form);
    start_connecting("sending report...");

    // reset-values
    document.getElementById("facility").value = "";
    document.getElementById("remark").value = "";    
    document.getElementById("engaged_personnel").value = "";
    document.getElementById("issues_arising").value = "";
    document.getElementById("performance_against_target").value = "";
    document.getElementById("hours").value = "hours";
    document.getElementById("mins").value = "mins";



}

function send_report() {locate();}

function fetch_data_handler(){
    if (this.status===200)
    {
        results = JSON.parse(this.responseText);
        
        if (results.length==0)
        {
            swal({
                title: "Data Error",
                text: "no "+this.field+" found. please talk to the admin about this!",
                type: "error",
                confirmButtonText: "Logout",
                closeOnConfirm:false
              },
              
              function(){window.location.href="index.html";}
              
              );
            return 0;
        }
        
        stop_connecting();
        
        if (this.field=="activities")
        {
            for (var i=0; i<results.length; i++)
            {
                var support_area = document.createElement("option");
                support_area.value=results[i][0];
                support_area.innerHTML=results[i][0];
                
                document.getElementById("activities").appendChild(support_area);
            }
            
            // fetch the latest data...
            var req = new XMLHttpRequest();
            
            req.open("GET", URL+"statuses", true);
            req.field = "statuses"
            req.onload = fetch_data_handler;

            req.send(null);
            start_connecting("fetching statuses...");

            return 0;
        }

        for (var i=0; i<results.length; i++)
        {
            var support_area = document.createElement("option");
            support_area.value=results[i][0];
            support_area.innerHTML=results[i][0];
            
            document.getElementById("engagement_status").appendChild(support_area);
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


window.onload = function ()
{
    if (window.name==""){window.location.href="index.html"; return 0;}

    // set body size to a fixed value corresponding to the screen...
    document.getElementById("body").style.height = window.innerHeight+"px";
    document.getElementById("body").style.width = window.innerWidth+"px";

    // populate hours and mins dropdowns
    for (var i=0; i<13; i++)
    {
        var option = document.createElement("option");
        option.value = i+"";
        option.innerHTML = i+"";
        
        document.getElementById("hours").appendChild(option);
    }
    for (var i=0; i<60; i+=5)
    {
        var option = document.createElement("option");
        option.value = i+"";
        option.innerHTML = i+"";
        
        document.getElementById("mins").appendChild(option);
    }

    // fetch the latest data...
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"activities", true);
    req.field = "activities"
    req.onload = fetch_data_handler;

    req.send(null);
    start_connecting("fetching activities...");
    
};
