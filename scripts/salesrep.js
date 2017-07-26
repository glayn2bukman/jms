
function check_known_client(){
    document.getElementById("known_client").checked = true;
}
function check_new_client(){
    document.getElementById("new_client").checked = true;
}

function on_locate(position) {
    var lat = ""+position.coords.latitude, lon = ""+position.coords.longitude;
    swal.close();

    var user = new USER(window.name); //uname -> user.uname

    var now = new Date();
    var date = now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear(); 
    date = change_date(date);
    
    var t = now.getHours()+":"+now.getMinutes();
    t = change_time(t);
    
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
    form.append("products_promoted", "");

    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"report", true);

    req.home_link = "technicalrep.html";
    req.onload = report_handler;

    req.send(form);

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
}


function submit_report(){locate();}

window.onload = function()
                {
                    document.getElementById("known_client_label").onclick = check_known_client;
                    document.getElementById("new_client_label").onclick = check_new_client;
                };
