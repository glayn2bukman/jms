var REPORT_ROW_HEIGHT = 8; // used when salesrep wants to edit their existing report
var EDITING = []; // empty if not editing report, otherwise [uname,date,time,lat,lon]
var PROMOTIONAL_ITEMS_HEIGHT = 40;
var PROMOTIONAL_ITEMS_YPOS = 0;

function check_known_client(){
    document.getElementById("known_client").checked = true;
}
function check_new_client(){
    document.getElementById("new_client").checked = true;
}

function on_locate(position) {
    var lat = ""+position.coords.latitude, lon = ""+position.coords.longitude;
    
    stop_connecting(); //close the "getting gps location..." swal

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
    
    // known-client ...
    var known_client = "";
    if (document.getElementById("known_client").checked) {known_client="yes";}
    else {known_client="no";}

    // contact-personnel ...
    var cp = document.getElementById("cp1_names").value+":"+document.getElementById("cp1_contact").value+":"+document.getElementById("cp1_email").value;
    if (document.getElementById("cp2_names").value!="")
    {
        cp += ";"+document.getElementById("cp2_names").value+":"+document.getElementById("cp2_contact").value+":"+document.getElementById("cp2_email").value;
    } 

    var form = new FormData();
    form.append("uname", user.uname);
    form.append("client", document.getElementById("client").value);
    form.append("date", date);
    form.append("time", t);
    form.append("lat", lat);
    form.append("lon", lon);
    form.append("remark", document.getElementById("remark").value);
    form.append("order_generated", document.getElementById("og").value);
    form.append("order_received", document.getElementById("or").value);
    form.append("debt_collected", document.getElementById("dc").value);
    form.append("client_category", document.getElementById("client_category").value);
    form.append("client_old", known_client);
    form.append("contact_people", cp);

    // for now, do without items promoted
    var mom  = document.getElementById("promoted_items_items");
    var p_items = "";
    if (mom.hasChildNodes) 
    {
        var divs = mom.childNodes;
        var p_item, qty, amount;
        for (var i=0; i<divs.length; i++)
        {
            p_item = divs[i].childNodes[0].value;
            qty = divs[i].childNodes[1].value;
            if (isNaN(qty))
            {
                swal({
                    title: "Error",
                    text: "invalid quantity (qty) given -> "+qty,
                    type: "error",
                    confirmButtonText: "Ok"
                  });            
            }
            amount = document.getElementById(p_item).unit_price*parseInt(qty);
            
            if (p_items==""){p_items += p_item+":"+qty+":"+amount;}
            else{p_items += ";"+p_item+":"+qty+":"+amount;}
        }
        
    }

    form.append("products_promoted", p_items);


    var req = new XMLHttpRequest();
    
    if (EDITING.length>0) {req.open("POST", URL+"edit_report", true);}
    else {req.open("POST", URL+"report", true);}

    req.onload = report_handler;

    req.send(form);
    start_connecting("sending report...");

    // clear widgets
    document.getElementById("client").value = "";

    document.getElementById("cp1_names").value = "";
    document.getElementById("cp1_contact").value = "";
    document.getElementById("cp1_email").value = "";
    document.getElementById("cp2_names").value = "";
    document.getElementById("cp2_contact").value = "";
    document.getElementById("cp2_email").value = "";
    document.getElementById("og").value = "";
    document.getElementById("or").value = "";
    document.getElementById("dc").value = "";
    document.getElementById("remark").value = "";
    // clear the "items-promoted section too" here
    
    document.getElementById("send_report").value = "Send Report";

    EDITING = [];
}

function submit_report(){locate();}

function fetch_specific_report_handler()
{
    if (this.status===200)
    {
        stop_connecting();
        report = JSON.parse(this.responseText);

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

        // populate fields...
        document.getElementById("client").value = report[3];
        document.getElementById("client_category").value = report[6];
        if (report[7]=="yes") 
        {
            document.getElementById("known_client").checked = true;
            document.getElementById("new_client").checked = false;
        }
        else 
        {
            document.getElementById("known_client").checked = false;
            document.getElementById("new_client").checked = true;
        }
        document.getElementById("og").value = report[9];
        document.getElementById("or").value = report[10];
        document.getElementById("dc").value = report[11];
        document.getElementById("remark").value = report[13];

        var cp1="::", cp2="::";
        if (report[8].indexOf(";")>=0)
        // we got two contact people...
        {
          var cps = report[8].split(";");
          cp1 = cps[0]; 
          cp2 = cps[1];  
        }
        else 
        // one contact person...
        {cp1 = report[8];}
        
        var cp1_details = cp1.split(":"), cp2_details = cp2.split(":");
        
        document.getElementById("cp1_names").value = cp1_details[0];
        document.getElementById("cp1_contact").value = cp1_details[1];
        document.getElementById("cp1_email").value = cp1_details[2];
        document.getElementById("cp2_names").value = cp2_details[0];
        document.getElementById("cp2_contact").value = cp2_details[1];
        document.getElementById("cp2_email").value = cp2_details[2];

        // load "items-promoted" too

        document.getElementById("my_reports_div").style.visibility = "hidden";

        document.getElementById("send_report").value = "Update Report";
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

function fetch_specific_report()
{
    var user = new USER(window.name);
    
    // generate and send request to fetch the report...
    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"agent_specific_report", true);

    req.onload = fetch_specific_report_handler;

    var form = new FormData();
    form.append("time", this.time_stamp);
    form.append("agent", user.uname);

    req.send(form);
    start_connecting("fetching report...");
}

function load_reports_handler()
{
    if (this.status===200)
    {
        stop_connecting();
        reports = JSON.parse(this.responseText);

        clear("loaded_reports_div");

        for (var i=0; i<reports.length; i++)
        {
            var time_value = document.createElement("div");
            time_value.setAttribute("class", "time_value");
            time_value.innerHTML = reports[i][0];
            time_value.style.top = (i*REPORT_ROW_HEIGHT)+"%";

            var client_value = document.createElement("div");
            client_value.setAttribute("class", "client_value");
            client_value.innerHTML = reports[i][1];
            client_value.style.top = (i*REPORT_ROW_HEIGHT)+"%";
            
            client_value.time_stamp = reports[i][0]; //used when fetching this report...
            client_value.onclick = fetch_specific_report;

            document.getElementById("loaded_reports_div").appendChild(time_value);
            document.getElementById("loaded_reports_div").appendChild(client_value);

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

function load_reports()
{
    var date = this.value;
    if (date=="todays")
    {
        var today = new Date();
        date = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
    }
    else if (date=="yesterdays")
    {
        var today = new Date();
        today.setDate(today.getDate()-1);
        date = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
    }

    date = change_date(date);
    var user = new USER(window.name);

    // generate and send request
    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"agent_reports", true);

    req.onload = load_reports_handler;

    var form = new FormData();
    form.append("agent", user.uname);
    form.append("date", date);

    req.send(form);
    start_connecting();

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
           option.value = segments[i][0];
           option.innerHTML = segments[i][0];
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
    if (isNaN(this.qty.value))
    {
        swal({
            title: "Error",
            text: "invalid quantity(qty) provided -> "+this.qty.value,
            type: "info",
            confirmButtonText: "Ok",
          });    
    }

    this.amount.innerHTML = convert_figure_to_human_readable(document.getElementById(this.value).unit_price*this.qty.value);

}

function add_promotional_item_handler()
{
    if (this.status===200)
    {
        items = JSON.parse(this.responseText);
        
        if (items.length==0)
        {
            swal({
                title: "Data Info",
                text: "no promotional items found",
                type: "info",
                confirmButtonText: "Ok",
              });
            return 0;
        }

        stop_connecting();
        
        // create div t contain the item, qty n amount
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = "0%";
        div.style.width = "100%";
        div.style.height = PROMOTIONAL_ITEMS_HEIGHT+"%";
        div.style.top = PROMOTIONAL_ITEMS_YPOS+"%";

        //item...
        var p_item = document.createElement("select");
        p_item.className = "round_corners";
        p_item.style.position = "absolute";
        p_item.style.left = "0%";
        p_item.style.width = "58%";

        for (var i=0; i<items.length; i++)
        {
            var option = document.createElement("option");
            option.setAttribute("id", items[i][0]);
            option.value = items[i][0];
            option.innerHTML = items[i][0];
            option.style.textIndent = "5px";
            option.unit_price = items[i][3];
            p_item.appendChild(option);
        }        


        // qty...
        var qty = document.createElement("input");
        qty.className = "round_corners";        
        qty.type = "number";
        qty.setAttribute("min", "1");
        qty.value = "1";
        qty.style.position = "absolute";
        qty.style.textIndent = "0px";
        qty.style.textIndent = "5px";
        qty.style.left = "60%";
        qty.style.width = "13%";
                                
        // amount ...
        var amount = document.createElement("div")
        amount.style.position = "absolute";
        amount.style.left = "75%";
        amount.style.top = "5%";
        amount.innerHTML = "";
            
        p_item.qty = qty;
        p_item.amount = amount; 

        div.appendChild(p_item);
        div.appendChild(qty);
        div.appendChild(amount);

        document.getElementById("promoted_items_items").appendChild(div);
        
        p_item.onchange = update_amount;
        
        PROMOTIONAL_ITEMS_YPOS += PROMOTIONAL_ITEMS_HEIGHT;
        
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

function add_promotional_item()
{
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"promotional_items", true);

    req.onload = add_promotional_item_handler;

    req.send(null);
    start_connecting("fetching promotional items...");
    
}

window.onload = function()
{
    document.getElementById("known_client_label").onclick = check_known_client;
    document.getElementById("new_client_label").onclick = check_new_client;

    // fill in other report date (upto 7 days)
    var mom = document.getElementById("report_date");
    var today = new Date();
    today.setDate(today.getDate()-1);

    for (var i=0; i<5; i++)
    {
        today.setDate(today.getDate()-1);
        var date = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
        var option = document.createElement("option");
        option.setAttribute("value", date);
        option.innerHTML=date;
        
        mom.appendChild(option);
    }
        
    mom.onchange = load_reports;

    // bind the "My Reports" btn...
    document.getElementById("my_reports").onclick = function (){
        clear("loaded_reports_div"); // clear any previously fetched reports..
        document.getElementById("my_reports_div").style.visibility = "visible";
    };

    // hide "my_reports_div" by default...
    document.getElementById("my_reports_div").style.visibility = "hidden";

    // bind promotional-items btns...
    document.getElementById("add_promotional_item").onclick = add_promotional_item;
    document.getElementById("remove_promotional_item").onclick = remove_promotional_item;

    // fetch the latest client segments...
    var req = new XMLHttpRequest();
    
    req.open("GET", URL+"client_segments", true);

    req.onload = fetch_client_segments_handler;

    req.send(null);
    start_connecting("fetching client segments...");

    // set body size to a fixed value corresponding to the screen...
    //var dpi = window.devicePixelRatio;
    document.getElementById("body").style.height = window.innerHeight+"px";
    document.getElementById("body").style.width = window.innerWidth+"px";
    

};
                
                
                
                
                
                
