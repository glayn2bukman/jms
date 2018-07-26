
function fetched_specific_report()
{
    stop_connecting();
    
    if (this.status===200)
    {
        report = JSON.parse(this.responseText);

        document.getElementById("facility").value = report[2];
        document.getElementById("CMEs").value = report[1];
        document.getElementById("remark").value = report[8];

        var topics = report[7].split(", ");
        var options = document.getElementById("topics").children;
        for (var i=0; i<options.length; ++i)
        {
            if (topics.indexOf(options[i].innerHTML)>=0)
                options[i].selected = true;
            else
                options[i].selected = false;
        }
        
        if (parseInt(CURRENT_REPORT_DATE)>parseInt(change_date(EDIT_REPORT_STOP_DATE)))
        {
        /* report::
            0 uname varchar(30),
            1 CMEs int,
            2 facility varchar(50),
            3 date varchar(8),
            4 time varchar(8),
            5 lat varchar(12),
            6 lon varchar(12),
            7 area_trained varchar(30),
            8 remark varchar(300)
        */

            EDITING = [report[0], report[3], report[4],report[5], report[6]];

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

function on_locate(position) {
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
        send_request("POST",URL+"edit_technical_report",report_handler, PAYLOAD);
    else
        send_request("POST",URL+"technical_report",report_handler,PAYLOAD);

    // reset-values
    document.getElementById("facility").value = "";
    document.getElementById("remark").value = "";
}

function submit_report()
{
    var facility = document.getElementById("facility").value;
    if(!facility.length)
    {
        flag_error("facility?");
        return;
    }

    var CMEs = document.getElementById("CMEs").value;

    var topics = document.getElementById("topics").children,
        selected_topics="";

    for (var i=0; i<topics.length; i++)
    {
        if (topics[i].selected) 
        {
            if (selected_topics=="")
            {
                selected_topics += topics[i].value;
            }
            else
            {
                selected_topics += ", "+topics[i].value;
            }
        }
    }
    if(!selected_topics.length)
    {
        flag_error("please select atleast one activity");
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
    PAYLOAD.append("area_trained", selected_topics);
    PAYLOAD.append("CMEs", CMEs);    

    locate();

}

function fetch_training_topics_handler()
{
    stop_connecting();
    
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

    ACCOUNT = "technicalrep";

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


    document.getElementsByTagName("object")[0].data = bug_report_url();

    // fetch the latest training topics...
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"training_topics_full", true);

    req.onload = fetch_training_topics_handler;

    req.send(null);
    start_connecting("fetching training topics...");

}






