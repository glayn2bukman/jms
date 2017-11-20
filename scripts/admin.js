var SEARCH_DURATION = [];
var ROW_HEIGHT = 10; //value(%) of each row in edit_div...
var DELETE_ROW_WIDTH = 5; // value(%) of the delete-row-button in edit_div
var COL_TOP = 8; //value(%) to act as the "top" of the column titles in edit_div
var BUTTON_HEIGHT = 10; //value(%) update n add-row(bottom buttons) height
var _ROW_HEIGHT = 13; // row height in the items_div inside edit_div

var ITEMS_ADDED = 0; /* when updating items(emails, training topics, etc) they are added sequentially
                        rather than all at once*/

var RESULTS_ROW_HEIGHT = 8; // height of each row in "results_div"->"results_data"

function leave_edit()
{
    swal.close(); // close any open sweetalerts
    
    document.getElementById("edit_div").style.visibility = "hidden";
    // ******************************************************************
    var underneath = document.getElementsByClassName("underneath");
    for (var i=0; i<underneath.length;i++)
    {
        //underneath[i].style.visibility="hidden";
        underneath[i].style.visibility="visible";
    }

}

function delete_entire_row()
{
    mom = document.getElementById("items_div");
    var children = mom.childNodes;
    
    for (var i=0; i<children.length; i++)
    {
        if(children[i]==this)
        {
            // delete row...
            for (var j=0; j<this.row_length; j++)
            {
                mom.removeChild(children[i+1]);
            }
            mom.removeChild(this);
            
            //shift(move up) all rows below by 1 row
            for (var below=i; below<children.length; below++)
            {
                var top = children[below].style.top;
                children[below].style.top = (parseInt(top.slice(0,top.length-1))-_ROW_HEIGHT)+"%";
            }
            
            // decrement ROWS by 1
            mom.rows -= 1;
        }
    }
}

function add_item_handler()
{
    if (this.status===200)
    {
        ITEMS_ADDED += 1;
        if (ITEMS_ADDED==this.total_items_to_send)
        {
            // stop_connecting(); called automaticaly when new swal is called...            
            swal({
                title: "Data Update",
                text: "sucessfully updated "+this.title,
                type: "success",
                confirmButtonText: "Ok",
                closeOnConfirm: false
                },
                leave_edit
                );
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

function delete_item_handler()
{
    if (this.status===200)
    {
        console.log("Deleted "+this.title);
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

function update_data()
{
    // reset value of items added...
    ITEMS_ADDED = 0;

    // check if all fields are filled
    var mom = document.getElementById("items_div");
    var children = mom.childNodes;
    for (var i=0; i<children.length; i++)
    {
        if (children[i].type=="button"){continue;} // delete-row btn...
        if (children[i].value=="")
        // empty field found
        {
            swal({
                title: "Input Error",
                text: "please fill all fields!",
                type: "error",
                confirmButtonText: "Ok"
              });

            return 0;
        }        
    }

    // *_url -> [url, param-name1, param-name2,...]
    // the param-name* values are what will be used when sending requests to the server
    var delete_url = [], add_url = [];

    if (this.field.title=="Promotional Items")
    {
        delete_url=["delete_promotional_item","name"]; 
        add_url=["add_promotional_item", "name", "from", "to", "unit_price"];
    }
    else if (this.field.title=="Client Segments")
    {
        delete_url=["delete_client_segments","name"]; 
        add_url=["add_client_segments","name"];
    }
    else if (this.field.title=="Training Topics")
    {
        delete_url=["delete_training_topics", "name"];
        add_url=["add_training_topics", "name"]; 
    }
    else if (this.field.title=="Email Recepients")
    {
        delete_url=["delete_mail_recepients","email"]; 
        add_url=["add_mail_recepients","email"];
    }
    else if (this.field.title=="Support Areas(TRTP)")
    {
        delete_url=["delete_support_areas","name"]; 
        add_url=["add_support_areas","name"];
    }
    else if (this.field.title=="Activities(TRC)")
    {
        delete_url=["delete_activities","name"]; 
        add_url=["add_activities","name"];
    }
    else if (this.field.title=="Engagement Statuses(TRC)")
    {
        delete_url=["delete_statuses","name"]; 
        add_url=["add_statuses","name"];
        url="";
    }


    // first delete all items ...(consumes data i admit, look at it when upgrading the JMS HTML app!)
    start_connecting("reaching server...");
    for (var i=0; i<this.field.data.length; i++)
    {
        var req = new XMLHttpRequest();
        
        req.open("POST", URL+delete_url[0], false); /* request is blocking...
             this will ensure that we leave this for-block
             only when all items have been deleted from db...
             if we dont make it blocking, an item might be deleted while also 
             being added at the same time in the db as both deleting $ adding 
             would be async. you dont want this, trust me!
                                                     */

        req.total_items_to_send = children.length/L;
        req.title = this.field.data[i][0];
        req.onload = delete_item_handler;

        var form = new FormData();
        form.append(delete_url[1], this.field.data[i][0]);
        req.send(form);
    }

    stop_connecting();
    
    // add items...
    var form = new FormData();
    var L = this.field.cols.length+1; // we add one coz there is an excess col(delete-row btn)
    var row = 0;
    for (var item_index=0; item_index<children.length; item_index++)
    {
        if (item_index%L==0){continue;} // delete-row button

        // add data to form object...
        if (this.field.cols[item_index%L-1][2]=="date")
        {
            var changed_date = change_date(children[item_index].value);
            form.append(add_url[item_index%L], changed_date);
        }
        else if (this.field.cols[item_index%L-1][2]=="num")
        {
            var changed_figure = change_figure(children[item_index].value);
            if (parseInt(changed_figure)==NaN)
            {
                swal({
                    title: "Invalid Type",
                    text: "invalid figure found in <Price> column",
                    type: "error",
                    confirmButtonText: "Ok"
                  });
                return 0;                
            }
            form.append(add_url[item_index%L], parseInt(changed_figure));
        }
        else 
        {
            form.append(add_url[item_index%L], children[item_index].value);
        }

        if ( (item_index+1)%L== 0) // row-completion logic...
        // submit the generated form to the add_url
        {
            var req = new XMLHttpRequest();
            
            req.open("POST", URL+add_url[0], true);

            req.total_items_to_send = children.length/L;
            req.title = this.field.title;
            req.onload = add_item_handler;

            req.send(form);

            start_connecting("updating database...");

            form = new FormData();
        }
        
    }

}

function populate_edit_div(field)
// function to be called as a handler after creating an <edit> object
// see "edit_field_handler"
{
    clear("edit_div");
    
    var mom = document.getElementById("edit_div");
    
    // title
    var title = document.createElement("div");
    title.innerHTML = "Edit -> "+field.title;
    title.className = "section_heading";
    title.style.textIndent = "10px";

    mom.appendChild(title);

    // update button...
    var update = document.createElement("input");
    update.type="button";
    update.value = "Update";
    update.className = "round_corners black";
    update.style.position = "absolute";
    update.style.left = "78%";
    update.style.top = "90%";
    update.style.width = "20%";
    update.style.height = BUTTON_HEIGHT+"%";

    update.field = field;
    update.onclick = update_data;
    
    mom.appendChild(update);

    // add-row btn
    var new_row = document.createElement("input");
    new_row.type="button";
    new_row.value = "+";
    new_row.className = "round_corners green";
    new_row.style.position="absolute";
    new_row.style.left="72%";
    new_row.style.top="90%";
    new_row.style.width="5%";
    new_row.style.height="10%";
    new_row.style.textIndent = "0px";
    new_row.style.fontWeight="bold";
    new_row.style.fontSize="1.2em";
    
    new_row.field = field;
    new_row.onclick = function(){
        for (var col=0, xpos=DELETE_ROW_WIDTH; col<this.field.cols.length; col++)
        {
            if (col==0)
            // draw delete-row btn
            {
                // delete-row btn
                var delete_row = document.createElement("input");
                delete_row.type="button";
                delete_row.value = "X";
                delete_row.className = "round_corners red";
                delete_row.style.position = "absolute";
                delete_row.style.left = "0%";
                delete_row.style.top = (
                    (_ROW_HEIGHT*document.getElementById("items_div").rows)
                        +
                     document.getElementById("items_div").rows
                    )+"%";
                delete_row.style.width = DELETE_ROW_WIDTH+"%";
                delete_row.style.height = _ROW_HEIGHT+"%";
                delete_row.style.textIndent = "0px";
                delete_row.style.fontWeight="bold";
                delete_row.style.fontSize="1.2em";
                
                delete_row.row_length = field.cols.length;
                delete_row.onclick = delete_entire_row;
                
                document.getElementById("items_div").appendChild(delete_row);
            }

            var entry = document.createElement("input")
            
            entry.setAttribute("class","round_corners");
            entry.style.textIndent = "5px";
            
            // modify entry depending on if its to contain a string,number or date
            if (field.cols[col][2]=="str") {entry.type="text";}
            else if (field.cols[col][2]=="num") {entry.type="number";}
            else if (field.cols[col][2]=="date") 
            {
                entry.setAttribute("type","text");
                entry.setAttribute("placeholder", "DD/MM/YYYY");
                //entry.setAttribute("readonly",true);
                entry.setAttribute("class","round_corners auto-kal");
            }

            entry.setAttribute("value","");

            entry.style.position="absolute";
            entry.style.left = xpos+"%";
            entry.style.top = (
                (_ROW_HEIGHT*document.getElementById("items_div").rows)
                    +
                 document.getElementById("items_div").rows)+"%";
            entry.style.width = (this.field.cols[col][1]-1)+"%";
            entry.style.height = _ROW_HEIGHT+"%";

            document.getElementById("items_div").appendChild(entry);
            xpos += field.cols[col][1];
        }
        document.getElementById("items_div").rows += 1;

    };
    
    mom.appendChild(new_row);

    // back button...
    var back = document.createElement("input");
    back.type="button";
    back.value = "Back";
    back.className = "round_corners black";
    back.style.position = "absolute";
    back.style.left = "51%";
    back.style.top = "90%";
    back.style.width = "20%";
    back.style.height = BUTTON_HEIGHT+"%";
    
    back.onclick = leave_edit;
    
    mom.appendChild(back);

    // column titles...
    for (var i=0, xpos=DELETE_ROW_WIDTH; i<field.cols.length; i++)
    {
        var col = document.createElement("div")
        col.innerHTML = field.cols[i][0];
        col.style.position="absolute";
        col.style.left = xpos+"%";
        col.style.top = COL_TOP+"%";
        col.style.width = field.cols[i][1]+"%";
        col.style.height = ROW_HEIGHT+"%";

        col.style.color="#111111";
        col.style.borderLeft="1px solid";
        col.style.borderLeftColor="#ffffff";
        col.style.fontSize="1.4em";

        mom.appendChild(col);
        xpos += field.cols[i][1];
    }

    // items-div
    var items_div = document.createElement("div");
    items_div.setAttribute("id", "items_div");
    items_div.style.position="absolute";
    items_div.style.left = "0%";
    items_div.style.top = COL_TOP+ROW_HEIGHT+"%";
    items_div.style.width = "100%";
    items_div.style.height = (100-ROW_HEIGHT-COL_TOP-BUTTON_HEIGHT-1)+"%";

    items_div.style.border="1px solid";
    items_div.style.borderColor="#ffffff";
    items_div.style.borderRadius="20px";
    items_div.style.overflow = "auto";

    items_div.row = 0;

    mom.appendChild(items_div);

    // now draw real data...
    for (items_div.rows=0; items_div.rows<field.data.length; items_div.rows++)
    {
        for (var col=0, xpos=DELETE_ROW_WIDTH; col<field.cols.length; col++)
        {
            if (col==0)
            // draw delete-row btn
            {
                // delete-row btn
                var delete_row = document.createElement("input");
                delete_row.type="button";
                delete_row.value = "X";
                delete_row.className = "round_corners red";
                delete_row.style.position = "absolute";
                delete_row.style.left = "0%";
                delete_row.style.top = ((_ROW_HEIGHT*items_div.rows)+items_div.rows)+"%";
                delete_row.style.width = DELETE_ROW_WIDTH+"%";
                delete_row.style.height = _ROW_HEIGHT+"%";
                delete_row.style.textIndent = "0px";
                delete_row.style.fontWeight="bold";
                delete_row.style.fontSize="1.2em";

                delete_row.row_length = field.cols.length;
                delete_row.onclick = delete_entire_row;
                
                items_div.appendChild(delete_row);
            }

            var entry = document.createElement("input")
            
            entry.setAttribute("class","round_corners");
            entry.style.textIndent = "5px";
            
            // modify entry depending on if its to contain a string,number or date
            if (field.cols[col][2]=="str") {entry.type="text";}
            else if (field.cols[col][2]=="num") {entry.type="number";}
            else if (field.cols[col][2]=="date") 
            {
                entry.type="text";
                //entry.setAttribute("readonly",true);
                entry.setAttribute("placeholder","DD/MM/YYYY");
                entry.setAttribute("class","round_corners auto-kal");
            }

            entry.value = field.data[items_div.rows][col];
            entry.style.position="absolute";
            entry.style.left = xpos+"%";
            entry.style.top = ((_ROW_HEIGHT*items_div.rows)+items_div.rows)+"%";
            entry.style.width = (field.cols[col][1]-1)+"%";
            entry.style.height = _ROW_HEIGHT+"%";

            items_div.appendChild(entry);
            xpos += field.cols[col][1];
        }
    }

}

function set_date()
{
    // ["Search Duration","Today", "Past Week", "Past Month", "Other"]
    if (this.value=="Search Duration"){return 0;}
    
        // make dates in DD/MM/YYYY style
        // i did this because the datepicker i used has this as default...
    if (this.value=="Today")
    {
        var today = new Date();
        SEARCH_DURATION[0] = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear(); 
        SEARCH_DURATION[1] = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear(); 
    }
    else if (this.value=="Past Week")
    {
        var today = new Date(), pastweek = new Date();
        pastweek.setDate(pastweek.getDate()-7);
        SEARCH_DURATION[0] = pastweek.getDate()+"/"+(pastweek.getMonth()+1)+"/"+pastweek.getFullYear(); 
        SEARCH_DURATION[1] = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear(); 
    }
    else if (this.value=="Past Month")
    {
        var today = new Date(), pastmonth = new Date();
        pastmonth.setDate(pastmonth.getDate()-30);
        SEARCH_DURATION[0] = pastmonth.getDate()+"/"+(pastmonth.getMonth()+1)+"/"+pastmonth.getFullYear(); 
        SEARCH_DURATION[1] = today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear(); 
    }
    else 
    // other ...
    {
        document.getElementById("date_from").value="";
        document.getElementById("date_to").value="";
        document.getElementById("custom_search_duration").style.visibility="visible";
    }
}

function cancel_set_custon_search_duration()
{
    document.getElementById("custom_search_duration").style.visibility="hidden";
}
function confirm_set_custon_search_duration()
{
    var _from = document.getElementById("date_from").value;
    var _to = document.getElementById("date_to").value;

    if (_from=="" || _to=="")
    {
        swal({
            title: "Date Error",
            text: "please select both dates!",
            type: "error",
            confirmButtonText: "Ok"
          });
        return 0; 
    }

    // convert dates from MM/DD/YYYY to DD/MM/YYYY
    _from = _from.split("/");
    _to = _to.split("/");

    SEARCH_DURATION[0] = _from[1]+"/"+_from[0]+"/"+_from[2];
    SEARCH_DURATION[1] = _to[1]+"/"+_to[0]+"/"+_to[2];

    document.getElementById("custom_search_duration").style.visibility="hidden";
}


function accounts()
{
    window.location.href = "users.html";
}

function deactivate_results_buttons()
{
    var results_btns = ["save_results", "email_results"];
    for (var i=0; i<results_btns.length; i++)
    {
        document.getElementById(results_btns[i]).disabled = true;
        document.getElementById(results_btns[i]).style.color = "#555555";
    }
}

function activate_results_buttons()
{
    var results_btns = ["save_results", "email_results"];
    for (var i=0; i<results_btns.length; i++)
    {
        document.getElementById(results_btns[i]).disabled = false;
        document.getElementById(results_btns[i]).style.color = "#ffffff";
    }
}

function edit_field_handler()
{
    if (this.status===200)
    {    
        stop_connecting();
        var results = JSON.parse(this.responseText);

        // show edit_div $ hide all else
        // ******************************************************************
        var underneath = document.getElementsByClassName("underneath");
        for (var i=0; i<underneath.length;i++)
        {
            underneath[i].style.visibility="hidden";
            //underneath[i].style.visibility="visible";
        }
        //document.getElementById("edit_div").style.visibility = "hidden";
        document.getElementById("edit_div").style.visibility = "visible";
        // ******************************************************************

        var field = {
            title:this.target_field,
            data:results,
            };

        /*
            the field.cols is an array of arrays of the form [col-title, %width, data-type]
        */
        if (field.title=="Promotional Items")
        {
            field.cols = [
                ["Item",40-DELETE_ROW_WIDTH,"str"],
                ["From", 20,"date"],
                ["To", 20-2,"date"],
                ["Unit-Price", 20,"num"],
            ];

            // turn dates into DD/MM/YYYY format
            for(var i=0; i<field.data.length;i++)
            {
                var _from = field.data[i][1];
                var _to = field.data[i][2];
                
                field.data[i][1] = _from.slice(6,8)+"/"+_from.slice(4,6)+"/"+_from.slice(0,4);
                field.data[i][2] = _to.slice(6,8)+"/"+_to.slice(4,6)+"/"+_to.slice(0,4);
            } 

        }
        
        else if(field.title=="Client Segments")
        {
            field.cols = [
                ["Segment", 40-DELETE_ROW_WIDTH, "str"]
            ];
        }

        else if(field.title=="Training Topics")
        {
            field.cols = [
                ["Topic", 40-DELETE_ROW_WIDTH, "str"]
            ];
        }

        else if(field.title=="Email Recepients")
        {
            field.cols = [
                ["Email", 40-DELETE_ROW_WIDTH, "str"]
            ];
        }

        else if(field.title=="Support Areas(TRTP)")
        {
            field.cols = [
                ["Support Area", 40-DELETE_ROW_WIDTH, "str"]
            ];
        }
        
        else if(field.title=="Activities(TRC)")
        {
            field.cols = [
                ["Activity", 40-DELETE_ROW_WIDTH, "str"]
            ];
        }
        
        else if(field.title=="Engagement Statuses(TRC)")
        {
            field.cols = [
                ["Status", 40-DELETE_ROW_WIDTH, "str"]
            ];
        }

        populate_edit_div(field);
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

function edit_field()
{
    if (this.value=="Edit") {return 0;}

    var req = new XMLHttpRequest();
    
    var url = "xxx";
    
    if (this.value=="Promotional Items"){url="promotional_items_all";}
    else if (this.value=="Client Segments"){url="client_segments";}
    else if (this.value=="Training Topics"){url="training_topics_full";}
    else if (this.value=="Email Recepients"){url="mail_recepients";}
    else if (this.value=="Support Areas(TRTP)"){url="support_areas";}
    else if (this.value=="Activities(TRC)"){url="activities";}
    else if (this.value=="Engagement Statuses(TRC)"){url="statuses";}
    
    req.open("GET", URL+url, true);
    req.target_field = this.value;

    req.onload = edit_field_handler;

    req.send(null);
    start_connecting("fetching data...");
}

function load_full_report_handler()
{
    if (this.status===200)
    {
        stop_connecting();
        report = JSON.parse(this.responseText);

        if (report.length==14)
        // salesrep
        {
/*
         0    uname varchar(30),
         1    date varchar(8),
         2    time varchar(8),
         3    client varchar(50),
         4    lat varchar(12),
         5    lon varchar(12),
         6    client_category varchar(15),
         7    client_old varchar(3),
         8    contact_people varchar(120),
         9    order_generated int,
         10   order_received int,
         11   debt_collected int,
         12   products_promoted varchar(500),
         13   remark varchar(300)
*/

            document.getElementById("client_name_value").innerHTML = report[3];
            document.getElementById("client_segment").innerHTML = report[6];         
            document.getElementById("new_client").innerHTML = report[7];
            document.getElementById("remark_value").innerHTML = report[13];        
            document.getElementById("og_value").innerHTML = convert_figure_to_human_readable(report[9]);        
            document.getElementById("or_value").innerHTML = convert_figure_to_human_readable(report[10]);        
            document.getElementById("dc_value").innerHTML = convert_figure_to_human_readable(report[11]);        

            // contact personnel...
            var cp1 = "::", cp2 = "::";
            var cps = (report[8]).split(";");
            if (cps.length>1){cp1 = cps[0]; cps2 = cps[1];}
            else {cp1=cps[0]}
            
            console.log(cp1, report[8], cps);
            
            var _cp1 = cp1.split(":");
            document.getElementById("cp_1_names").innerHTML = _cp1[0];
            document.getElementById("cp_1_contact").innerHTML = _cp1[1];         
            document.getElementById("cp_1_email").innerHTML = _cp1[2];        

            var _cp2 = cp2.split(":");
            document.getElementById("cp_2_names").innerHTML = _cp2[0];
            document.getElementById("cp_2_contact").innerHTML = _cp2[1];
            document.getElementById("cp_2_email").innerHTML = _cp2[2];        

            document.getElementById("salesrep_report_time").innerHTML = report[0]+"("+(report[1]).slice(6,8)+"-"+(report[1]).slice(4,6)+"-"+(report[1]).slice(0,4)+", "+report[2]+")";        
            
            // items promoted...
            if (report[12].length>0)
            {
                var items = (report[12]).split(";");
                var item = [];
                for (var i=0; i<items.length; i++)
                {
                    item = (items[i]).split(":");
                    document.getElementById("items_promoted_value").innerHTML += item[0]+" ("+convert_figure_to_human_readable(item[1])+") -> "+convert_figure_to_human_readable(item[2])+"<br>";                    
                }
            }
            
            document.getElementById("salesrep_map").src = URL+"map/"+report[4]+"/"+report[5];
            document.getElementById("loaded_salesrep_report_div").style.visibility="visible";

        }
        else if (report.length==9)
        // technical rep
        {
/*
       0     uname varchar(30),
       1     CMEs int,
       2     facility varchar(50),
       3     date varchar(8),
       4     time varchar(8),
       5     lat varchar(12),
       6     lon varchar(12),
       7     area_trained varchar(30),
       8     remark varchar(300)

*/
            document.getElementById("CMEs_value").innerHTML = report[1]+"";
            document.getElementById("facility_value").innerHTML = report[2];
            document.getElementById("topic_trained_value").innerHTML = report[7]+"";
            document.getElementById("technical_remark_value").innerHTML = report[8]+"";

            document.getElementById("technicalrep_report_time").innerHTML = report[0]+" ("+(report[3]).slice(6,8)+"-"+(report[3]).slice(4,6)+"-"+(report[3]).slice(0,4)+", "+report[4]+")";        

            document.getElementById("technicalrep_map").src = URL+"map/"+report[5]+"/"+report[6];
            document.getElementById("loaded_technicalrep_report_div").style.visibility="visible";

        }
        else if (report.length==10)
        // technical rep - tp
        {
/*
       0     uname varchar(30),
       1     facility varchar(50),
       2     date varchar(8),
       3     time varchar(8),
       4     lat varchar(12),
       5     lon varchar(12),
       6     support_areas varchar(200),
       7     incharge varchar(50),
       8     trainees varchar(300),
       9     remark varchar(300)
*/
            document.getElementById("facility_tp_value").innerHTML = report[1];
            document.getElementById("support_areas_tp_value").innerHTML = report[6]+"";
            document.getElementById("incharge_tp_value").innerHTML = report[7]+"";
            document.getElementById("technical_tp_remark_value").innerHTML = report[9]+"";

            document.getElementById("technicalrep_tp_report_time").innerHTML = report[0]+" ("+(report[2]).slice(6,8)+"-"+(report[2]).slice(4,6)+"-"+(report[2]).slice(0,4)+", "+report[3]+")";        

            document.getElementById("technicalrep_tp_map").src = URL+"map/"+report[4]+"/"+report[5];
            document.getElementById("loaded_technicalrep_tp_report_div").style.visibility="visible";

            var trainees = (report[8]).split(";");
            var _trainees = "";
            for (var i=0; i<trainees.length; i++)
            {
                var trainee = trainees[i].split(":");
                _trainees += (trainee[0]+" ("+trainee[1]+")"+"\n");
            }
            document.getElementById("trainees_tp_value").innerHTML = _trainees;

        }
        else if (report.length==13)
        // technical rep - tc
        {
/*
       0     uname varchar(30),
       1     facility varchar(50),
       2     date varchar(8),
       3     time varchar(8),
       4     lat varchar(12),
       5     lon varchar(12),
       6     activities varchar(200),
       7     personnels_engaged int,
       8     issues_arising varchar(300),
       9     time_spent varchar varchar(6),
       10     status_of_engagement varchar(50),
       11     perfomance_against_target varchar(200),
       12     remark varchar(300)
*/
            document.getElementById("facility_core_value").innerHTML = report[1];
            document.getElementById("activities_core_value").innerHTML = report[6]+"";
            document.getElementById("personnel_engaged_core_value").innerHTML = report[7]+"";
            document.getElementById("duration_core_value").innerHTML = report[9]+"";
            document.getElementById("engagement_core_value").innerHTML = report[10]+"";
            document.getElementById("issues_arising_core_remark_value").innerHTML = report[8]+"";
            document.getElementById("performance_against_target_core_remark_value").innerHTML = report[11]+"";
            document.getElementById("technical_core_remark_value").innerHTML = report[12]+"";

            document.getElementById("technicalrep_core_report_time").innerHTML = report[0]+" ("+(report[2]).slice(6,8)+"-"+(report[2]).slice(4,6)+"-"+(report[2]).slice(0,4)+", "+report[3]+")";        

            document.getElementById("technicalrep_core_map").src = URL+"map/"+report[4]+"/"+report[5];
            document.getElementById("loaded_technicalrep_core_report_div").style.visibility="visible";

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

function load_full_report()
{
    var req = new XMLHttpRequest();
    
    req.open("POST", URL+"full_report", true);

    req.onload = load_full_report_handler;

    var form = new FormData();
    form.append("date", this.report_data[0]);
    form.append("time", this.report_data[1]);
    form.append("target", this.report_data[2]);
    
    req.send(form);
    start_connecting("fetching report...");

}

function search_db_handler()
{
    if (this.status===200)
    {    
        results = JSON.parse(this.responseText);
        
        if (results.length==0)
        {
            swal({
                title: "Server Reply",
                text: "no results found",
                type: "info",
                confirmButtonText: "Ok"
            });
            
            return 0;
        }

        stop_connecting();
        
        // do some primary processingon the data...
        if (this.search_category=="Products Promoted")
        {
            var _results = [];
            for (var row=0; row<results.length; row++)
            {
                var _row = [];
                for (var col=0; col<results[row].length-1; col++){_row[col]=results[row][col];}
                var items = (results[row][results[row].length-1]).split(";");
                for (var i=0; i<items.length; i++)
                {
                    var item = items[i].split(":");
                    var __row = [];
                    __row[0] = item[0];
                    __row[1] = parseInt(item[1]);
                    __row[2] = parseInt(item[2]);
                    
                    _results[row] = _row.concat(__row);
                }
            }
            
            results = _results;
        }
        
        var results_cols = document.getElementById("results_cols");
        var results_data = document.getElementById("results_data");

        // draw respective column titles...
        if ((this.search_category).indexOf("Reps")>=0)
        // columns are too many and large so we shall need to scroll horizontally...
        {
            for (var col=0, xpos=0; col<this.cols.length; col++)
            {
                var div = document.createElement("div");

                div.innerHTML = this.cols[col][0];
                
                div.style.position = "absolute";
                div.style.top = 0+"%";
                div.style.left = xpos+"%";
                div.style.width = this.cols[col][1]+"%";
                div.style.color = "#111111";
                div.style.fontSize = "1.2em";
                xpos += this.cols[col][1];
                
                results_data.appendChild(div);
            }        
        }
        else
        {
            for (var col=0, xpos=0; col<this.cols.length; col++)
            {
                var div = document.createElement("div");
                div.innerHTML = this.cols[col][0];
                div.style.position = "absolute";
                div.style.left = xpos+"%";
                div.style.width = this.cols[col][1]+"%";
                xpos += this.cols[col][1];
                
                results_cols.appendChild(div);
            }
        }
        // now populate data...
        for (var row=0; row<results.length; row++)
        {
            for (var col=0, xpos=0; col<this.cols.length; col++)
            {
                var div = document.createElement("div");

                if (col==0)
                {
                    var date = results[row][col];
                    div.innerHTML = date.slice(6,8)+"-"+date.slice(4,6)+"-"+date.slice(0,4);
                }
                else 
                {
                    if (!isNaN(results[row][col])) {div.innerHTML = convert_figure_to_human_readable(results[row][col]);}
                    else {div.innerHTML = results[row][col];}
                }
                
                div.style.position = "absolute";
                div.style.top = ((row+1)*RESULTS_ROW_HEIGHT)+"%";
                div.style.left = xpos+"%";
                div.style.width = this.cols[col][1]+"%";
                xpos += this.cols[col][1];
                
                if (this.search_category=="Reports" && col==(this.cols.length-1))
                {
                    div.style.color = "#ffffff";
                    div.class += " clickable";
                    div.style.cursor = "pointer";
                    div.report_data = (results[row]).slice(0,results[row].length-1);
                    div.onclick = load_full_report;
                }
                
                results_data.appendChild(div);
            }
        }
        
        document.getElementById("n_results_found").innerHTML = "<b>"+results.length+"</b> result(s) found";
        activate_results_buttons();
        
        document.getElementById("email_results").cols = this.cols;
        document.getElementById("email_results").data = results;
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

function search_db()
{
    deactivate_results_buttons();
    
    if (SEARCH_DURATION.length==0)
    {
        swal({
        title: "Search Error",
        text: "please select search duration",
        type: "info",
        confirmButtonText: "Ok"
      });
        return 0;
    }

    if (document.getElementById("search_category").value=="Search Category")
    {
        swal({
        title: "Search Error",
        text: "please select a search category",
        type: "info",
        confirmButtonText: "Ok"
      });
        return 0;
    }

    // clear "n_results_found", "results_cols" and "results_data" then populate data...
    clear("results_cols");
    clear("results_data");
    clear("n_results_found");

    // create request and send it...
    var req = new XMLHttpRequest();
    var url = "";
    var form = new FormData();
    
    var search_category = document.getElementById("search_category").value;

    req.search_category = search_category;

    if (search_category=="Clients Visited")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 16],
            ["Agent", 20],
            ["Client",48]
        ];
                
        url = "clients_visited_report";
    }
    else if (search_category=="Debts Collected")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 12],
            ["Agent", 18],
            ["Client",42],
            ["D.C", 12]
        ];
        
        url = "debts_collected_report";
    }
    else if (search_category=="Products Promoted")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 12],
            ["Agent", 18],
            ["Item",32],
            ["Qty", 10],
            ["Amount", 12]
        ];
        
        url = "products_promoted_report";
    }
    else if (search_category=="Client Segments")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 12],
            ["Agent", 18],
            ["Client",42],
            ["Segmnt", 12]
        ];
        
        url = "clients_segments_report";
    }
    else if (search_category=="New Clients")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 16],
            ["Agent", 20],
            ["Client",48],
        ];
        
        url = "new_clients_report";
    }
    else if (search_category=="Orders")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 12],
            ["Agent", 18],
            ["Client",30],
            ["O.G",12],
            ["O.R", 12]
            
        ];
        
        url = "orders_report";
    }
    else if (search_category=="Topics Taught")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 12],
            ["Agent", 18],
            ["Facility",38],
            ["Topic",16]            
        ];
        
        url = "topics_taughed_report";
    }
    else if (search_category=="Sales Reps")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 20],
            ["Time", 12],
            ["Agent", 20],
            ["Client", 30],
            ["Category", 20],
            ["Old Client", 20],
            ["O.G", 20],
            ["O.R", 20],
            ["D.C", 20]
        ];
        
        url = "agents_report_all_data";
        form.append("account_type", "salesrep");
    }
    else if (search_category=="Technical Reps")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 20],
            ["Time", 12],
            ["Agent", 20],
            ["Facility", 30],
            ["CMEs", 10],
            ["Topic Trained", 30],
        ];
        
        url = "agents_report_all_data";
        form.append("account_type", "technicalrep");
    }
    else if (search_category=="Technical Reps(TRTP)")
    {
        // horizontally scrollable ...
        req.cols = [
            // [col_title, %width]
            ["Date", 20],
            ["Time", 12],
            ["Agent", 20],
            ["Facility", 30],
            ["Incharge", 30],
            ["Support Areas", 40],
        ];
        
        url = "agents_report_all_data";
        form.append("account_type", "technicalrep_tp");
    }
    else if (search_category=="Technical Reps(TRC)")
    {
        // scrollable
        req.cols = [
            // [col_title, %width]
            ["Date", 20],
            ["Time", 12],
            ["Agent", 20],
            ["Facility", 30],
            ["Duration", 12],
            ["Status", 15],
            ["Activities", 40]
        ];
        
        url = "agents_report_all_data";
        form.append("account_type", "technicalrep_core");
    }
    else if (search_category=="Reports")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 16],
            ["Time", 16],
            ["Agent", 20],
            ["Client", 48]
        ];
        
        url = "clients_visited_report";
    }
    
    document.getElementById("email_results").search_category = search_category;

    req.onload = search_db_handler;

    req.open("POST", URL+url, true);

    var search_from = change_date(SEARCH_DURATION[0]), search_to = change_date(SEARCH_DURATION[1]);
    form.append("target", document.getElementById("target").value);
    form.append("from", search_from);
    form.append("to", search_to)

    req.send(form);

    start_connecting("searching...");

}

function send_mail_handler()
{
    if (this.status===200)
    {
        swal({
            title: "Email Status",
            text: "email sent sucessfully",
            type: "success",
            confirmButtonText: "Ok"
          });
        
        //window.location.href = "admin.html";
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

function mail_results()
{
    var mail_data = this.data;
    var old_dates = [];
    for (var i=0; i<mail_data.length; i++)
    {
        var date = mail_data[i][0];
        old_dates[i] = date;
        mail_data[i][0]=date.slice(6,8)+"/"+date.slice(4,6)+"/"+date.slice(0,4);
    }
    
    var mail_cols = [];
    for (var i=0; i<this.cols.length; i++)
    {
        mail_cols[i] = this.cols[i][0];
    }
    var mail_field = this.search_category;
    
    swal({
          title: "Email Address",
          text: "enter email address",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "email@example.com"
        },
        
        function(email){
            if (email === false) {return false;} // clicked "cancel"

            if (email === "") 
            {
                swal.showInputError("email address cant be empty!");
                return false
            }
            else if (email.indexOf("@")==-1)
            {
                swal.showInputError("invalid email address!");
                return false
            }

            swal({
                  title: "Subject",
                  text: "type the email subject please",
                  type: "input",
                  showCancelButton: true,
                  closeOnConfirm: false,
                  animation: "slide-from-top",
                  inputPlaceholder: "my subject"
                },
                
                function(subject){
                    if (subject === false) {return false;} // clicked "cancel"

                    if (subject === "") 
                    {
                        swal.showInputError("subject cant be empty!");
                        return false
                    }

                    swal({
                          title: "Message",
                          text: "type a short message please",
                          type: "input",
                          showCancelButton: true,
                          closeOnConfirm: false,
                          animation: "slide-from-top",
                          inputPlaceholder: "message"
                        },
                        
                        function(message){
                            if (message === false) {return false;} // clicked "cancel"

                            if (message === "") 
                            {
                                swal.showInputError("provide a short message please");
                                return false
                            }

                            var data = ["JMS-Report("+mail_field+")", mail_cols, mail_data, mail_field, subject,email, message];
                            
                            // generate request and send it...
                            var req = new XMLHttpRequest();

                            req.open("POST", URL+"send_mail", true);

                            req.onload = send_mail_handler;

                            var form = new FormData();
                            form.append("data", JSON.stringify(data));

                            req.send(form);
                            start_connecting("sending email...");
                            
                            // reconvert the dates into old format...just in case this email z gonna be sent twice
                            for (var i=0; i<mail_data.length; i++)
                            {
                                mail_data[i][0] = old_dates[i];
                            }

                            
                        }
                        );
                }
                );
        }
        );
}

window.onload = function() 
{
    if (window.name==""){window.location.href="index.html"; return 0;}
    
    // hide edit_div
    document.getElementById("edit_div").style.visibility = "hidden";

    // edit options ...
    var edit_options = ["Edit","Promotional Items", "Client Segments", 
                        "Training Topics", "Email Recepients",
                        "Support Areas(TRTP)", "Activities(TRC)", "Engagement Statuses(TRC)"
                       ];

    for (var i=0; i<edit_options.length; i++)
    {
        var option = document.createElement("option");
        option.value = edit_options[i];
        option.innerHTML = edit_options[i];
        if (option.value=="Edit") {option.style.visibility="hidden";}
        document.getElementById("edit_options").appendChild(option);
    }
    document.getElementById("edit_options").onchange = edit_field;
    

    // search categories ...
    var search_categories = ["Reports","Clients Visited", 
                            "New Clients","Products Promoted",
                            "Debts Collected","Topics Taught",
                            "Sales Reps","Technical Reps",
                            "Technical Reps(TRTP)","Technical Reps(TRC)",
                            "Client Segments","Orders"];
    search_categories.sort();
    search_categories.splice(0,0,"Search Category"); // insert item

    for (var i=0; i<search_categories.length; i++)
    {
        var option = document.createElement("option");
        option.value = search_categories[i];
        option.innerHTML = search_categories[i];
        if (option.value=="Search Category") {option.style.visibility="hidden";}
        document.getElementById("search_category").appendChild(option);
    }


    // search duration ...
    var search_duration = ["Search Duration","Today", "Past Week", "Past Month", "Other"];

    for (var i=0; i<search_duration.length; i++)
    {
        var option = document.createElement("option");
        option.value = search_duration[i];
        option.innerHTML = search_duration[i];
        if (option.value=="Search Duration") {option.style.visibility="hidden";}
        document.getElementById("search_duration").appendChild(option);
    }
    document.getElementById("search_duration").onchange = set_date;

    // deactivate "results" buttons ...
    deactivate_results_buttons();
    document.getElementById("email_results").onclick = mail_results;

    // bind "search" button
    document.getElementById("search_btn").onclick = search_db;
    
    // hide custon search_duration div...
    document.getElementById("custom_search_duration").style.visibility="hidden";
    document.getElementById("cancel_custom_duration").onclick=cancel_set_custon_search_duration;
    document.getElementById("confirm_custom_duration").onclick=confirm_set_custon_search_duration;

    // bind "done_veiwing_report" btn...
    document.getElementById("done_viewing_salesrep_report").onclick = function ()
    {
        document.getElementById("loaded_salesrep_report_div").style.visibility="hidden";
    };
    document.getElementById("loaded_salesrep_report_div").style.visibility="hidden";

    document.getElementById("done_viewing_technicalrep_report").onclick = function ()
    {
        document.getElementById("loaded_technicalrep_report_div").style.visibility="hidden";
    };
    document.getElementById("loaded_technicalrep_report_div").style.visibility="hidden";

    document.getElementById("done_viewing_technicalrep_tp_report").onclick = function ()
    {
        document.getElementById("loaded_technicalrep_tp_report_div").style.visibility="hidden";
    };
    document.getElementById("loaded_technicalrep_tp_report_div").style.visibility="hidden";

    document.getElementById("done_viewing_technicalrep_core_report").onclick = function ()
    {
        document.getElementById("loaded_technicalrep_core_report_div").style.visibility="hidden";
    };
    document.getElementById("loaded_technicalrep_core_report_div").style.visibility="hidden";

    // deactivate "edit" and "accounts" section if not super-user
    var user = new USER(window.name);
    if (user.uname!="admin")
    {
        document.getElementById("accounts").innerHTML = "My Account";
        document.getElementById("accounts").onclick = edit_account;
        document.getElementById("edit_options").disabled = true;
    }


    // set body size to a fixed value corresponding to the screen...
    //document.getElementById("body").style.height = window.innerHeight+"px";
    //document.getElementById("body").style.width = window.innerWidth+"px";
}




