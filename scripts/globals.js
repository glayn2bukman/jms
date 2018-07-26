// this file contains variables that are global to all html files of this project
var URL = "http://139.162.235.29:8123/" /*uname:<root>, pswd:<jmsrt123#>*/
//var URL = "http://0.0.0.0:8123/"
var CHAT_URL = "http://45.33.74.38:60101/";

var GPS_FETCH_TIMEOUT = 2; // seconds
var GOT_GPS = false;

var EDIT_REPORT_STOP_DATE = "";
var EDITING = []; // empty if not editing report, otherwise [uname,date,time,lat,lon]

var PAYLOAD = null;

var ACCOUNT;

function clear(mom)
{
    var element = document.getElementById(mom);
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convert_figure_to_human_readable(value, dp)
{
    try{
        value/2.3;
        
        if (!isNaN(dp))
            value = value.toFixed(dp);
        else
            value = value.toString();
    }
    catch(e){
        // value already a string as we want it!
    }
    
    if (isNaN(parseFloat(value)))
    {
        return value;
    }

    dp_index = value.indexOf(".");
    dp_index = dp_index<0 ? value.length-1 : dp_index-1;
        
        // array to contain new human-readable value format...
    value_reverse = [];
    for (var i=value.length-1; i!=dp_index; --i)
        value_reverse.push(value[i]);
    
    for (var i=dp_index, counter=1; i>=0; --i)
    {
        value_reverse.push(value[i]);
        if (counter==3 && i)
        {
            value_reverse.push(",");
            counter = 0;
        }

        counter++;
    }

    value_reverse.reverse();

    if (!isNaN(dp) && !dp)
    {
        value = value_reverse.join("");
        if (value.indexOf(".")>=0)
            return value.slice(0, value.indexOf("."));
    }
    
    return value_reverse.join("");

    
}


function logout()
{
/*    if(confirm("Logout?")) {window.location.href="index.html";}
    else {}
*/
    swal({
      title: "Logout",
      text: "Close this session?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    },
    function(){
      window.location.href="index.html";
    });
}

function quit()
{
    swal({
      title: "Quit",
      text: "Close this session?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    },
    function(){
      window.location.href="index.html";
    });
}

function USER(user)
// create a user pbject to be used when changin the account password...
{
    user = user.split(";")

    this.uname = user[0];
    this.pswd = user[1];
    this.account_type = user[2];
    this.email = user[3];
    
     
}

function edit_account_handler()
{
    stop_connecting();
    
    if (this.status===200)
    {    
        //stop_connecting(); // not needed as slat(...) will close any exixsting sweetalert first..
        
        swal({
            title: "Password reset info",
            text: "password set sucessfully!",
            type: "success",
            confirmButtonText: "Ok"
        });
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

function _edit_account()
{

    hide_modal("edit-account-modal");

    var user = new USER(window.name); 

    var form = new FormData();

    var new_pswd = document.getElementById("account_pswd").value;
    var new_email = document.getElementById("account_email").value;

    // our form is built in such a way that we only edit the user's password
    form.append("old_uname", user.uname);
    form.append("new_uname", user.uname);
    form.append("pswd", new_pswd.length?new_pswd:user.pswd);
    form.append("email", new_email.length?new_email:user.email);
    form.append("account_type", user.account_type);

    send_request("POST", URL+"edit_account",edit_account_handler,form);

    document.getElementById("account_pswd").value = "";
    document.getElementById("account_email").value = "";
}

function edit_account()
{
    show_modal("edit-account-modal");
}

function change_date(date)
// change date from DD/MM/YYYY to YYYYMMDD
{
    var dmy = date.split("/");
    var changed_date = dmy[2];
    
    if (dmy[1].length==1){changed_date += "0"+dmy[1];}
    else {changed_date += dmy[1];}

    if (dmy[0].length==1){changed_date += "0"+dmy[0];}
    else {changed_date += dmy[0];}

    return changed_date;
}

function change_time(time)
// change date from H:M to HH:MM
{
    var hm = time.split(":");
    var changed_time = "";
    
    if (hm[0].length==1){changed_time += "0"+hm[0];}
    else {changed_time += hm[0];}

    if (hm[1].length==1){changed_time += ":0"+hm[1];}
    else {changed_time += ":"+hm[1];}

    if (hm[2].length==1){changed_time += ":0"+hm[2];}
    else {changed_time += ":"+hm[2];}

    return changed_time;
}

function change_figure(figure)
// change money from xx,xxx,xxx,.... to xxxxxxxxxxx...
{
    var figures = figure.split(",");
    var changed_figure = "";
    for (var i=0; i<figures.length; i++) {changed_figure += figures[i];}
    
    return changed_figure;
}

function stop_connecting()
{
    document.getElementById("loading_div").style.display = "none";
}

function start_connecting()
{
    document.getElementById("loading_div").style.display = "block";
}


function gps_failed_for_long()
{
    stop_connecting();
    if(!GOT_GPS)
    {
        // gps spent too long before fetching
        on_locate({ // simulate a sucess in fetching gps location ...
            coords:{latitude:0.2958474, longitude:32.5953291},
            gps_failed:true
            });
        return;
    }
}

function locate() 
{
    try
    //EDITING is not defined for technicalrep... 
    {
        if (EDITING.length>0)
        // if salesrep is editing an existing report, EDITING=[uname,date,time,lat,lon]
        {
            on_locate({ // simulate a sucess in fetching gps location ...
                coords:{latitude:EDITING[3], longitude:EDITING[4]}
                });
            return;
        }
    }
    catch (error){;}// do nara....simply proceed to normal gps location
    
    if (navigator.geolocation) 
    {
        // function <on_locate> is defined wherever locate will be called (salesrep.js and technicalrep.js for our case)
        GOT_GPS=false;
        setTimeout(gps_failed_for_long, GPS_FETCH_TIMEOUT*1000);
        navigator.geolocation.getCurrentPosition(function(lov){GOT_GPS=true; on_locate(loc);});

        start_connecting("getting gps location...");
                
    } else 
    {
        on_fail_to_locate();
    }
}

function on_fail_to_locate()
{
    swal({
        title: "gps info!",
        text: "Failed to get gps location...",
        type: "error",
        confirmButtonText: "easy..."
    });
}

function report_handler()
{
    stop_connecting();

    if (this.status===200)
    {
        if (EDITING.length)
            show_success("report updated sucessfully");
        else
            show_success("report sent sucessfully");
    
        document.getElementById("send").innerHTML = "Submit";
    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }

}

function send_request(mtd,url,handler,payload=null)
{
    var req = new XMLHttpRequest();
    
    req.open(mtd, url, true);
    
    req.onload = handler;
    
    req.send(payload);
    
    start_connecting();

}

function show_modal(modal_id){$('#'+modal_id).modal('show');}
function hide_modal(modal_id){$('#'+modal_id).modal('hide');}

function flag_error(error)
{
    swal({
        title: "Error!",
        text: error,
        type: "error",
        confirmButtonText: "Ok"
    });
}

function show_info(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "info",
        confirmButtonText: "Ok"
    });
}

function show_success(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "success",
        confirmButtonText: "Ok"
    });
}

function fetched_my_reports()
{
    stop_connecting();

    if (this.status===200)
    {
        stop_connecting();
        reports = JSON.parse(this.responseText);

        clear("my_reports_tbody");

        var tbody = document.getElementById("my_reports_tbody");

        var tr, td;

        for (var i=0; i<reports.length; i++)
        {
            tr = document.createElement("tr");
                td = document.createElement("td");
                td.innerHTML = reports[i][0];
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = reports[i][1];
                td.style.color = "#00d";
                td.time_stamp = reports[i][0];
                td.onclick = fetch_specific_report;
                tr.appendChild(td);
            
            tbody.appendChild(tr);
        }
    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }
}


function fetch_my_reports(select)
{
    var date = select.value;
    
    if (date=="-- select date --")
        return;
    
    if (date=="Today's Reports")
    {
        var today = new Date();
        date = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
    }
    else if (date=="Yesterday's Reports")
    {
        var today = new Date();
        today.setDate(today.getDate()-1);
        date = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
    }
    
    
    date = change_date(date);
    
    CURRENT_REPORT_DATE = date;
    
    var user = new USER(window.name);

    // generate and send request
    var form = new FormData();
    form.append("agent", user.uname);
    form.append("date", date);
    form.append("account", ACCOUNT);

    send_request("POST",URL+"agent_reports",fetched_my_reports,form);
}

function fetch_specific_report()
{
    var user = new USER(window.name);
    
    var form = new FormData();
    form.append("time", this.time_stamp);
    form.append("agent", user.uname);
    form.append("account", ACCOUNT);

    send_request("POST",URL+"agent_specific_report",fetched_specific_report,form);

}

function bug_report_url()
{
    var user = new USER(window.name);
    
    return CHAT_URL+user.uname+"/JMS";
}

function attempt_password_reset()
{
    stop_connecting();
    if(this.status===200)
    {
        reply = this.responseText;
        
        if(reply[0]=="0")
        {
            flag_error(reply.slice(2,reply.length));
            return
        }
        
        hide_modal("forgot-password-modal");
        show_success("reset code sent to <"+reply.slice(2,reply.length)+">");
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function reset_password()
{
    var uname = document.getElementById("reset_username").value;
    if(!uname.length)
    {
        flag_error("please enter your username!");
        return;
    }

    var form = new FormData();
    form.append("resetting","yes");
    form.append("uname",uname);
    
    document.getElementById("reset_username").value = "";
    
    send_request("POST",URL+"edit_account",attempt_password_reset,form);

}


// Disable the 'back' button on droid in phonegap..
//Deviceready function
document.addEventListener('deviceready', function(){
    document.addEventListener("backbutton",function(){},false);
}, false);
