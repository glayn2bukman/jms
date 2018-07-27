
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
    if(position.gps_failed==true)
    {
        var old_remark = PAYLOAD.get("remark");
        PAYLOAD.delete("remark")
        PAYLOAD.append("remark", old_remark+"\ngps failed, sent HQ coordinates")
    }
    
    var user = new USER(window.name); //uname -> user.uname

    if (EDITING.length>0)
    {
        var date = EDITING[1], t = EDITING[2];
    }
    else
    {
        var now = new Date();
        var date = now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear(); 
        date = change_date(date);
        
        var t = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
        t = change_time(t);
    }

    PAYLOAD.append("uname", user.uname);
    PAYLOAD.append("date", date);
    PAYLOAD.append("time", t);
    PAYLOAD.append("lat", lat);
    PAYLOAD.append("lon", lon);
    
    if (EDITING.length>0)
        send_request("POST",URL+"edit_trc_report",report_handler, PAYLOAD);
    else
        send_request("POST",URL+"technical_report_core",report_handler,PAYLOAD);

    // reset-values
    document.getElementById("facility").value = "";
    document.getElementById("remark").value = "";    
    document.getElementById("engaged_personnel").value = "";
    document.getElementById("issues").value = "";
    document.getElementById("PAT").value = "";
    document.getElementById("hours").value = "0";
    document.getElementById("mins").value = "0";

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
                support_area.value=results[i];
                support_area.innerHTML=results[i];
                
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

function submit_report()
{
    var facility = document.getElementById("facility").value;
    if(!facility.length)
    {
        flag_error("facility?");
        return;
    }

    var activities = document.getElementById("activities").children,
        selected_activities="";

    for (var i=0; i<activities.length; i++)
    {
        if (activities[i].selected) 
        {
            if (selected_activities=="")
            {
                selected_activities += activities[i].value;
            }
            else
            {
                selected_activities += ", "+activities[i].value;
            }
        }
    }
    if(!selected_activities.length)
    {
        flag_error("please select atleast one activity");
        return;
    }

    var engaged_personnel = document.getElementById("engaged_personnel").value;
    if(!engaged_personnel.length)
    {
        flag_error("engaged personnel?");
        return;
    }    
    if(isNaN(engaged_personnel))
    {
        flag_error("engaged personnel must be a figure");
        return;
    } engaged_personnel = parseInt(engaged_personnel);

    var hrs=document.getElementById("hours").value, mins=document.getElementById("mins").value;
    if(hrs=="0"&&mins=="0")
    {
        flag_error("please specify the activity duration");
        return;
    }
    
    var time_spent = hrs+"hrs, "+mins+"mins";

    var status = document.getElementById("engagement_status").value;
    
    var issues = document.getElementById("issues").value;
    if(!issues.length)
    {
        flag_error("issues arissing?");
        return;
    }

    var pat = document.getElementById("PAT").value;
    if(!pat.length)
    {
        flag_error("performance against target?");
        return;
    }

    var remark = document.getElementById("remark").value;
    if(!remark.length)
    {
        flag_error("remark?");
        return;
    }

    PAYLOAD = new FormData()

    PAYLOAD.append("facility", facility);
    PAYLOAD.append("remark", remark);    
    PAYLOAD.append("personnels_engaged", engaged_personnel);
    PAYLOAD.append("issues_arising", issues);
    PAYLOAD.append("perfomance_against_target", pat);
    PAYLOAD.append("status_of_engagement", status);
    PAYLOAD.append("activities", selected_activities);
    PAYLOAD.append("time_spent", time_spent);

    locate();

}

function fetched_specific_report()
{
    stop_connecting();
    
    if (this.status===200)
    {
        report = JSON.parse(this.responseText);

        document.getElementById("facility").value = report[1];

        var activities = report[6].split(", ");
        var options = document.getElementById("activities").children;
        for (var i=0; i<options.length; ++i)
        {
            if (activities.indexOf(options[i].innerHTML)>=0)
                options[i].selected = true;
            else
                options[i].selected = false;
        }

        document.getElementById("engaged_personnel").value = report[7];
        document.getElementById("issues").value = report[8];

        var time_spent = report[9].split(" ");
        document.getElementById("hours").value = time_spent[0].slice(0,time_spent[0].indexOf("h"));
        document.getElementById("mins").value = time_spent[1].slice(0,time_spent[1].indexOf("m"));
        
        document.getElementById("engagement_status").value = report[10];
        document.getElementById("PAT").value = report[11];
        document.getElementById("remark").value = report[12];
        
        if (parseInt(CURRENT_REPORT_DATE)>parseInt(change_date(EDIT_REPORT_STOP_DATE)))
        {
        /* report::
            0  uname varchar(30),
            1  facility varchar(50),
            2  date varchar(8),
            3  time varchar(8),
            4  lat varchar(12),
            5  lon varchar(12),
            6  activities varchar(200),
            7  personnels_engaged int,
            8  issues_arising varchar(300),
            9  time_spent varchar varchar(6),
            10 status_of_engagement varchar(50),
            11 perfomance_against_target varchar(200),
            12 remark varchar(300)
        */

            EDITING = [report[0], report[2], report[3],report[4], report[5]];

        }
        else
        {        
        }
        
        hide_modal('my-reports-modal');

        document.getElementById("send").innerHTML = "Update";
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
    EDITING = [];
    ACCOUNT = "trc";

    if (window.name==""){window.location.href="index.html"; return 0;}


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

    // fill in other report date (upto 7 days)
    var mom = document.getElementById("report_date");
    var today = new Date();
    today.setDate(today.getDate()-1);

    for (var i=0; i<28; i++)
    // view reports upto a month back!
    {
        today.setDate(today.getDate()-1);
        var date = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
        var option = document.createElement("option");
        option.setAttribute("value", date);
        option.innerHTML=date;
        
        mom.appendChild(option);
        
        if (i==4) // mark the end of the editable reports... 
        {
            EDIT_REPORT_STOP_DATE = date;
        }
    }

    // fetch the latest data...
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"activities", true);
    req.field = "activities"
    req.onload = fetch_data_handler;

    req.send(null);
    start_connecting("fetching activities...");

    var user = new USER(window.name);
    __BRE__setup("chat-container",user.uname,"JMS",CHAT_DIV_DIMENSIONS);
    
};
