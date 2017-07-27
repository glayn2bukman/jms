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
                entry.type="text";
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
    else {SEARCH_DURATION=[];}

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
    
    req.open("GET", URL+url, true);
    req.target_field = this.value;

    req.onload = edit_field_handler;

    req.send(null);
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
        // clear "results_cols" and "results_data" then populate data...
        clear("results_cols");
        clear("results_data");
        
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
                div.style.top = (row*RESULTS_ROW_HEIGHT)+"%";
                div.style.left = xpos+"%";
                div.style.width = this.cols[col][1]+"%";
                xpos += this.cols[col][1];
                
                results_data.appendChild(div);
            }
        }
        
        document.getElementById("n_results_found").innerHTML = "<b>"+results.length+"</b> result(s) found";
        
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

    clear("n_results_found");

    // create request and send it...
    var req = new XMLHttpRequest();
    var url = "";
    
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
    else if (search_category=="Field Agents")
    {
        req.cols = [
            // [col_title, %width]
            ["Date", 20],
            ["Time", 20],
            ["Agent", 60]
        ];
        
        url = "agents_report";
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
    

    req.onload = search_db_handler;

    req.open("POST", URL+url, true);

    var form = new FormData();
    var search_from = change_date(SEARCH_DURATION[0]), search_to = change_date(SEARCH_DURATION[1]);
    form.append("target", document.getElementById("target").value);
    form.append("from", search_from);
    form.append("to", search_to)

    req.send(form);

    start_connecting("searching...");

}

window.onload = function() 
{
    // hide edit_div
    document.getElementById("edit_div").style.visibility = "hidden";

    // edit options ...
    var edit_options = ["Edit","Promotional Items", "Client Segments", "Training Topics", "Email Recepients"];

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
                            "Field Agents","Client Segments","Orders"];
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

    // bind "search" button
    document.getElementById("search_btn").onclick = search_db;

}




