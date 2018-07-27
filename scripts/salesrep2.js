var REPORT_ROW_HEIGHT = 8; // used when salesrep wants to edit their existing report
var PROMOTIONAL_ITEMS_HEIGHT = 40;
var PROMOTIONAL_ITEMS_YPOS = 0;

var EDIT_REPORT_STOP_DATE = "";
var CURRENT_REPORT_DATE = "";

function check_known_client(){
    document.getElementById("known_client").checked = true;
}
function check_new_client(){
    document.getElementById("new_client").checked = true;
}

function on_locate(position) {
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
        send_request("POST",URL+"edit_report",report_handler, PAYLOAD);
    else
        send_request("POST",URL+"report",report_handler, PAYLOAD);

    EDITING = [];
}

function fetched_specific_report()
{
    stop_connecting();
    
    if (this.status===200)
    {
        report = JSON.parse(this.responseText);

        var cdp = document.getElementById("clinet_details_panel");
        var cdp_inputs = cdp.getElementsByTagName("input");
        
        cdp_inputs[0].value=report[3]
        if(report[7]=="yes")
        {
            cdp_inputs[1].checked = true;
            cdp_inputs[2].checked = false;
        }
        else
        {
            cdp_inputs[1].checked = false;
            cdp_inputs[2].checked = true;
        }

        cdp.getElementsByTagName("select")[0].value = report[6];

        var _CPDs = document.getElementById("contact_personnel_panel").getElementsByTagName("input");
        
        var cp1,cp2;
        if(report[8].indexOf(";")>=0)
        {
            var cp = report[8].split(";");
            cp1 = cp[0].split(":");
            cp2 = cp[1].split(":");
        }
        else
        {
            cp1 = report[8].split(":");
            cp2 = "::";
        }
        
        _CPDs[0].value=cp1[0]; _CPDs[1].value=cp1[1]; _CPDs[2].value=cp1[2];
        _CPDs[3].value=cp2[0]; _CPDs[4].value=cp2[1]; _CPDs[5].value=cp2[2];

        var op = document.getElementById("orders_panel").getElementsByTagName("input");
        op[0].value=report[9]; 
        op[1].value=report[10]; 
        op[2].value=report[11];
        
        document.getElementById("remark").value = report[13];

        clear("promoted_items_div");
        var pi_divs;
        
        var pis = report[12].split(";");
        for (var i=0; i<pis.length; ++i)
        {
            if(pis[i].indexOf(":")<0)
                continue;
            
            new_promotional_item();
            pi_divs = document.getElementById("promoted_items_div").getElementsByClassName("row");
            pi_divs[pi_divs.length-1].getElementsByTagName("select")[0].value = pis[i].split(":")[0];
            pi_divs[pi_divs.length-1].getElementsByTagName("input")[0].value = parseInt(pis[i].split(":")[1]);

        }
        
        if (parseInt(CURRENT_REPORT_DATE)>parseInt(change_date(EDIT_REPORT_STOP_DATE)))
        {
        /* report::
              0   uname varchar(30),
              1   date varchar(8),
              2   time varchar(8),
              3   client varchar(50),
              4   lat varchar(12),
              5   lon varchar(12),
              6   client_category varchar(15),
              7   client_old varchar(3),
              8   contact_people varchar(120),
              9   order_generated int,
              10  order_received int,
              11  debt_collected int,
              12  products_promoted varchar(500),
              13  remark varchar(300)
        */

            EDITING = [report[0], report[1], report[2],report[4], report[5]];

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


function fetch_client_segments_handler()
{
    if (this.status===200)
    {
        segments = JSON.parse(this.responseText);
        
        if (segments.length==0)
        {
            swal({
                title: "Data Error",
                text: "no client segments found. please talk to the admin about this!",
                type: "error",
                confirmButtonText: "Logout",
                closeOnConfirm:false
              },
              
              function(){window.location.href="index.html";}
              
              );
            return 0;
        }

        stop_connecting();
        
        for (var i=0; i<segments.length; i++)
        {
           //"area_trained"
           var option = document.createElement("option");
           option.value = segments[i];
           option.innerHTML = segments[i];
           document.getElementById("client_category").appendChild(option);
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

function remove_promotional_item()
{
    // if no items, just chill...
    var mom  = document.getElementById("promoted_items_items");
    if (!mom.hasChildNodes) {return 0;}
    
    var divs = mom.childNodes;
    mom.removeChild(divs[divs.length-1]);

    PROMOTIONAL_ITEMS_YPOS -= PROMOTIONAL_ITEMS_HEIGHT;

}

function update_amount()
{
    if (this.qty)
    {
        if (isNaN(this.qty.value))
        {
            swal({
                title: "Error",
                text: "invalid quantity(qty) provided -> "+this.qty.value,
                type: "info",
                confirmButtonText: "Ok",
              }); 
              
              return;  
        }

        this.amount.innerHTML = convert_figure_to_human_readable(document.getElementById(this.value).unit_price*this.qty.value);
    }
    else
    // qty istelf has triggered the event
    {
        if (isNaN(this.value))
        {
            swal({
                title: "Error",
                text: "invalid quantity(qty) provided -> "+this.qty.value,
                type: "info",
                confirmButtonText: "Ok",
              });    
            
            return;
        }

        this.amount.innerHTML = convert_figure_to_human_readable(document.getElementById(this.p_item.value).unit_price*this.value);

    }

}

function fetched_promotional_items()
{
    stop_connecting();
 
    if (this.status===200)
    {
        items = JSON.parse(this.responseText);
        
        if (!items.length)
        {
            return 0;
        }
        
        PROMOTIONAL_ITEMS = items
    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }

}

function fetch_promotional_items()
{
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"promotional_items", true);

    req.onload = fetched_promotional_items;

    req.send(null);
    start_connecting("fetching promotional items...");
    
}

window.onload = function()
{
    EDITING = [];
    ACCOUNT = "salesrep";
    
    if (window.name==""){window.location.href="index.html"; return 0;}

    // bind new/old-client radiobuttons labels
    /*
    document.getElementById("known_client_label").onclick = check_known_client;
    document.getElementById("new_client_label").onclick = check_new_client;
    */
    
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
        
    //mom.onchange = fetch_reports;


    // fetch the latest client segments...
    // #########################################3
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"client_segments", true);

    req.onload = fetch_client_segments_handler;

    req.send(null);
    start_connecting("fetching client segments...");
    // #########################################3

    fetch_promotional_items();

    var user = new USER(window.name);
    __BRE__setup("chat-container",user.uname,"JMS",CHAT_DIV_DIMENSIONS);

};
