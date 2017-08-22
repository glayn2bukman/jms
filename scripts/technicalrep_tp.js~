var TRAINEE_HEIGHT = 25;
var TRAINEE_YPOS = 0;


function add_trainee(){
    var mom = document.getElementById("trainees_div");
    
    var t_names = document.createElement("input");
    t_names.type = "text"
    t_names.className = "round_corners pabsolute";
    t_names.placeholder = "full names";    
    t_names.required = true;  
    t_names.style.width = "59%";
    t_names.style.left = "0%";
    t_names.style.top = TRAINEE_YPOS+"%";

    var t_contact = document.createElement("input");
    t_contact.type = "number"
    t_contact.className = "round_corners pabsolute";
    t_contact.placeholder = "contact";  
    t_contact.required = true;  
    t_contact.style.width = "39%";
    t_contact.style.left = "60%";
    t_contact.style.top = TRAINEE_YPOS+"%";
    
    mom.appendChild(t_names); mom.appendChild(t_contact);
    
    TRAINEE_YPOS += TRAINEE_HEIGHT + 2;
}

function remove_trainee(){
    var mom = document.getElementById("trainees_div");
    var trainees = document.getElementById("trainees_div").children;
    if (trainees.length>0)
    {
        //remove last two children...
        mom.removeChild(trainees[trainees.length-1]);
        mom.removeChild(trainees[trainees.length-1]);

    TRAINEE_YPOS -= (TRAINEE_HEIGHT + 2);
    }
}

function fetch_support_areas_handler(){
    if (this.status===200)
    {
        results = JSON.parse(this.responseText);
        
        if (results.length==0)
        {
            swal({
                title: "Data Error",
                text: "no support areas found. please talk to the admin about this!",
                type: "error",
                confirmButtonText: "Logout",
                closeOnConfirm:false
              },
              
              function(){window.location.href="index.html";}
              
              );
            return 0;
        }
        
        stop_connecting();
        
        for (var i=0; i<results.length; i++)
        {
            var support_area = document.createElement("option");
            support_area.value=results[i][0];
            support_area.innerHTML=results[i][0];
            
            document.getElementById("areas_supported").appendChild(support_area);
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

function send_report()
{
    locate();
}

function on_locate(position)
{
    if (document.getElementById("trainees_div").children.length==0)
    {
        swal({
            title: "Entry Error",
            text: "please add some trainees",
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


    var mom = document.getElementById("areas_supported");
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

    var trainees = "";
    var trainees_mom = document.getElementById("trainees_div");
    var  _trainees = trainees_mom.children;

    for (var i=0; i<_trainees.length; i++)
    {
        if (trainees=="")
        {
            trainees += _trainees[i].value+":"+_trainees[i+1].value;
        }
        else
        {
            trainees += ";"+_trainees[i].value+":"+_trainees[i+1].value;
        }
        
        i++;
    }
    

    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"technical_report_tp", true);
    req.onload = report_handler;

    var form = new FormData();
/*
    supervision_visits = request.form["supervision_visits"]
*/
    form.append("uname", user.uname);
    form.append("date", date);
    form.append("time", t);
    form.append("lat", lat);
    form.append("lon", lon);
    form.append("facility", document.getElementById("facility").value);
    form.append("remark", document.getElementById("remark").value);
    form.append("trainees", trainees);
    form.append("incharge", document.getElementById("incharge_names").value+" ("+document.getElementById("incharge_contact").value+")");
    form.append("support_areas", selected);
    
    req.send(form);
    start_connecting("sending report...");

    // reset values
    document.getElementById("facility").value = "";
    document.getElementById("remark").value = "";
    clear("trainees_div");
    document.getElementById("incharge_names").value = ""
    document.getElementById("incharge_contact").value = "";
    
}

window.onload = function () {
    // set body size to a fixed value corresponding to the screen...
    document.getElementById("body").style.height = window.innerHeight+"px";
    document.getElementById("body").style.width = window.innerWidth+"px";

    // bind trainnes btns...
    document.getElementById("add_trainee").onclick = add_trainee;
    document.getElementById("remove_trainee").onclick = remove_trainee;

    // bind submit-report btn
    //document.getElementById("send_report").onclick = send_report;

    // fetch the latest support_areas...
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"support_areas", true);

    req.onload = fetch_support_areas_handler;

    req.send(null);
    start_connecting("fetching support areas...");

};
