var TRAINEE_HEIGHT = 25;
var TRAINEE_YPOS = 0;

function fetched_support_areas(){
    stop_connecting();
    
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
        
        for (var i=0; i<results.length; i++)
        {
            var support_area = document.createElement("option");
            support_area.value=results[i];
            support_area.innerHTML=results[i];
            
            document.getElementById("areas_supported").appendChild(support_area);
        }
        
    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }
}

function send_report()
{
    var facility = document.getElementById("facility").value
    if(!facility.length)
    {
        flag_error("facility?");
        return;
    }

    var support_areas = document.getElementById("areas_supported").children,
        selected_areas="";

    for (var i=0; i<support_areas.length; i++)
    {
        if (support_areas[i].selected) 
        {
            if (selected_areas=="")
            {
                selected_areas += support_areas[i].value;
            }
            else
            {
                selected_areas += ", "+support_areas[i].value;
            }
        }
    }
    if(!selected_areas.length)
    {
        flag_error("please select atleast one support area");
        return;
    }

    if (!document.getElementById("incharge_names").value.length)
    {
        flag_error("incharge names?");
        return;
    }
    if (document.getElementById("incharge_contact").value.length<9)
    {
        flag_error("incharge contact?");
        return;
    }
    var incharge = document.getElementById("incharge_names").value+" ("+document.getElementById("incharge_contact").value+")";

    var trainees_divs = document.getElementById("trainees_div").getElementsByClassName("row"),
        trainee_names, trainee_contact,
        trainees="";

    for(var i=0; i<trainees_divs.length; ++i)
    {
        trainee_names = trainees_divs[i].getElementsByTagName("input")[0].value;
        trainee_contact = trainees_divs[i].getElementsByTagName("input")[1].value;
        
        if (!trainee_names.length)
        {
            flag_error("please provide all trainee names!");
            return;
        }
        if (trainee_contact.length<9)
        {
            flag_error("please correct trainee contact(s)");
            return;
        }

        if (trainees.length)
            trainees += ";";
                
        trainees += trainee_names+":"+trainee_contact;
    }

    if (!trainees.length)
    {
        flag_error("please provide atleast one trainee");
        return;
    }

    var remark = document.getElementById("remark").value;
    if(!remark.length)
    {
        flag_error("remark?");
        return;
    }

    PAYLOAD = new FormData();
    PAYLOAD.append("facility", facility);
    PAYLOAD.append("remark", remark);
    PAYLOAD.append("trainees", trainees);
    PAYLOAD.append("incharge", incharge);
    PAYLOAD.append("support_areas", selected_areas);
    

    locate();
}

function on_locate(position)
{
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
        send_request("POST",URL+"edit_trtp_report",report_handler, PAYLOAD);
    else
        send_request("POST", URL+"technical_report_tp",report_handler,PAYLOAD);

    // reset values
    document.getElementById("facility").value = "";
    document.getElementById("remark").value = "";
    clear("trainees_div");
    document.getElementById("incharge_names").value = ""
    document.getElementById("incharge_contact").value = "";
    
}

function delete_trainee_row()
{
    document.getElementById("trainees_div").removeChild(this.mom);
    document.getElementById("trainees_div").removeChild(this.mom_br);
}

function new_trainee()
{
    
    var row = document.createElement("div");
    var row_br = document.createElement("br");

    row.setAttribute("class","row");
    
    var delete_row = document.createElement("div");
    delete_row.setAttribute("class","col-xs-1 delete_trainee");
    delete_row.innerHTML = "x";
    delete_row.mom = row;
    delete_row.mom_br = row_br;
    delete_row.onclick = delete_trainee_row;
    

    var names = document.createElement("input");
    names.style.height = "25px"
    names.style.border = "0px";
    names.style.borderRadius = "5px";
    names.style.borderBottom = "1px solid #ddd";
    names.setAttribute("class","col-xs-8");
    names.setAttribute("placeholder","names");

    var contact = document.createElement("input");
    contact.setAttribute("type","number");
    contact.setAttribute("class","col-xs-2");
    contact.setAttribute("placeholder","contact");
    contact.style.height = "25px";
    contact.style.border = "0px";
    contact.style.borderRadius = "5px";
    contact.style.borderBottom = "1px solid #ddd";

    row.appendChild(delete_row);
    row.appendChild(names);
    row.appendChild(contact);
    
    document.getElementById("trainees_div").appendChild(row);
    document.getElementById("trainees_div").appendChild(row_br);
}

function fetched_specific_report()
{
    stop_connecting();
    
    if (this.status===200)
    {
        report = JSON.parse(this.responseText);

        document.getElementById("facility").value = report[1];

        document.getElementById("remark").value = report[9];
        document.getElementById("incharge_names").value = report[7].slice(0,report[7].indexOf("("));
        document.getElementById("incharge_contact").value = report[7].slice(report[7].indexOf("(")+1,report[7].indexOf(")"));

        clear("trainees_div");

        clear("trainees_div");
        var trainees_divs;
        
        var trainees = report[8].split(";");
        for (var i=0; i<trainees.length; ++i)
        {
            if(trainees[i].indexOf(":")<0)
                continue;
            
            new_trainee();
            trainees_divs = document.getElementById("trainees_div").getElementsByClassName("row");
            trainees_divs[trainees_divs.length-1].getElementsByTagName("input")[0].value = trainees[i].split(":")[0];
            trainees_divs[trainees_divs.length-1].getElementsByTagName("input")[1].value = parseInt(trainees[i].split(":")[1]);

        }


        var support_areas = report[6].split(", ");
        var options = document.getElementById("areas_supported").children;
        for (var i=0; i<options.length; ++i)
        {
            if (support_areas.indexOf(options[i].innerHTML)>=0)
                options[i].selected = true;
            else
                options[i].selected = false;
        }
        
        if (parseInt(CURRENT_REPORT_DATE)>parseInt(change_date(EDIT_REPORT_STOP_DATE)))
        {
        /* report::
            0 uname varchar(30),
            1 facility varchar(50),
            2 date varchar(8),
            3 time varchar(8),
            4 lat varchar(12),
            5 lon varchar(12),
            6 support_areas varchar(200),
            7 incharge varchar(50),
            8 trainees varchar(300),
            9 remark varchar(300)

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


window.onload = function () {
    EDITING = [];
    ACCOUNT = "trtp";

    if (window.name==""){window.location.href="index.html"; return 0;}

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

    send_request("GET", URL+"support_areas",fetched_support_areas,null);

    var user = new USER(window.name);
    __BRE__setup("chat-container",user.uname,"JMS",CHAT_DIV_DIMENSIONS);

};
