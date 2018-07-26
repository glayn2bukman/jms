var SEARCH_DURATION = "";

var DATA_SECTION = {category:null, title: null}

REPORT_DETAILS = {
    names: {
        "salesreps":"Sales Reps",
        "technicalreps":"Technical Reps",
        "trc":"Technical Reps-Core",
        "trtp": "Technical Reps-TP",
        "client-segments":"Clients Segments",
        "clients-visited":"Clients Visited",
        "debts-collected":"Debts Collected",
        "new-clients":"New Clients",
        "orders":"Orders",
        "products-promoted":"Products Promoted",
        "topics-taught":"Topics Taughed",
        "reports":"Agent's Peports",
    },

    titles: {
        "salesreps":["Date","Time","Agent","Client","Category","Old Client","O.G","O.R","D.C"],
        "technicalreps":["Date","Time","Agent","Facility","CMEs","Topic Trained"],
        "trc":["Date","Time","Agent","Facility","Duration","Status","Activities"],
        "trtp": ["Date","Time","Agent","Facility","Incharge","Support Areas"],
        "client-segments":["Date","Time","Agent","Client","Segment"],
        "clients-visited":["Date","Time","Agent","Client"],
        "debts-collected":["Date","Time","Agent","Client","Debt Collected"],
        "new-clients":["Date","Time","Agent","Client"],
        "orders":["Date","Time","Agent","Client","O Generated","O Recieved"],
        "products-promoted":["Date","Time","Agent","Item","Qty","Amount"],
        "topics-taught":["Date","Time","Agent","Facility","Topic"],
        "reports":["Date","Time","Agent","Client"],
    },
    
    urls: {
        "salesreps":"agents_report_all_data",
        "technicalreps":"agents_report_all_data",
        "trc":"agents_report_all_data",
        "trtp": "agents_report_all_data",
        "client-segments":"clients_segments_report",
        "clients-visited":"clients_visited_report",
        "debts-collected":"debts_collected_report",
        "new-clients":"new_clients_report",
        "orders":"orders_report",
        "products-promoted":"products_promoted_report",
        "topics-taught":"topics_taughed_report",
        "reports":"agents_report",
    },

    url_special_keys: {
        "salesreps":[["account_type", "salesrep"]],
        "technicalreps":[["account_type", "technicalrep"]],
        "trc":[["account_type", "technicalrep_core"]],
        "trtp": [["account_type", "technicalrep_tp"]],
        "client-segments":[],
        "clients-visited":[],
        "debts-collected":[],
        "new-clients":[],
        "orders":[],
        "products-promoted":[],
        "topics-taught":[],
        "reports":[],    
    }
}

var REPORT_DATA;

var CURRENT_SEARCH_CATEGORY;

var CURRENT_MAP_DIV;

function set_duration()
{
    var from = document.getElementById("duration_from").value;
    var to = document.getElementById("duration_to").value;
    
    if(!from.length || !to.length)
    {
        flag_error("please provide both dates!");
        return;
    }

    from = from.split("-")
    to = to.split("-")

    from = from[0] + (from[1].length>1?from[1]:"0"+from[1]) + (from[2].length>1?from[2]:"0"+from[2]);
    to = to[0] + (to[1].length>1?to[1]:"0"+to[1]) + (to[2].length>1?to[2]:"0"+to[2]);

    if(from>=to)
    {
        flag_error("'from' must be an earlier date than 'to'");
        return;
    }

    SEARCH_DURATION = from+":"+to;
    
    hide_modal("duration-modal");
}

function show_reports()
{
    stop_connecting();
    
    if(this.status===200)
    {
        var data = JSON.parse(this.responseText);

        if (!data.length)
        {
            show_info("no results found!");
            return;
        }
        
        clear("reports_tbody");
        
        var tr, td, tbody = document.getElementById("reports_tbody");
        
        var totals = [], got_totals_row=false;
        
        for(var i=0; i<data.length; i++)
        {
            tr = document.createElement("tr");
            
            if(CURRENT_SEARCH_CATEGORY=="products-promoted")
                data[i] = data[i].slice(0,3).concat(data[i][3].split(":"));
            
            for (var j=0; j<data[i].length; ++j)
            {
                td = document.createElement("td");
                
                if(totals[j]==undefined)
                    totals.push(0);
                
                if(!j)
                    td.innerHTML = data[i][j].slice(0,4)+"-"+data[i][j].slice(4,6)+"-"+data[i][j].slice(6,8);
                else if(!isNaN(data[i][j]))
                {
                    td.innerHTML = convert_figure_to_human_readable(data[i][j],0);
                    
                    if(data[i][j]!="")
                    {
                        totals[j] += data[i][j];
                        
                        // this line should not be necessary but turns out data[i][j] is a number when its an empty string!
                        totals[j] = parseFloat(totals[j]); 
                        
                        got_totals_row = true;
                    }
                }    
                else
                    td.innerHTML = data[i][j];

                if(CURRENT_SEARCH_CATEGORY=="reports" && j==(data[i].length-1))
                {
                    td.style.color="blue";
                    td.setAttribute("class","hovers");
                    td.data = data[i].slice(0,3);
                    td.onclick = fetch_full_report;
                }
                
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        }
        
        if(got_totals_row)
        {
            tr = document.createElement("tr");

            for(var i=0; i<totals.length; ++i)
            {
                td = document.createElement("td");
                
                if(totals[i])
                {
                    td.innerHTML = convert_figure_to_human_readable(totals[i],0);
                    td.style.fontWeight = "bold";
                    td.style.backgroundColor = "black";
                    td.style.color = "white";
                }

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }
        
        REPORT_DATA = data;
        
        show_modal("reports-modal");
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}


function fetched_report_span()
{
    stop_connecting();
    
    if(this.status===200)
    {
        var time_data = JSON.parse(this.responseText);

        var form = new FormData();
        form.append("from", time_data.from);
        form.append("to", time_data.to);
        form.append("target", document.getElementById("search-target").value);
        
        var user = new USER(window.name);
        
        form.append("category", user.account_type);
        
        for(var i=0; i<REPORT_DETAILS.url_special_keys[CURRENT_SEARCH_CATEGORY].length; ++i)
        {
            form.append(
                REPORT_DETAILS.url_special_keys[CURRENT_SEARCH_CATEGORY][i][0],
                REPORT_DETAILS.url_special_keys[CURRENT_SEARCH_CATEGORY][i][1]
            );
        }
        
        send_request("POST",URL+REPORT_DETAILS.urls[CURRENT_SEARCH_CATEGORY],show_reports, form);

    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function prepare_report_table(category)
{
    if(!SEARCH_DURATION.length)
    {
        show_info("please select a search duration first");
        return;
    }
    
    CURRENT_SEARCH_CATEGORY = category;

    var titles = REPORT_DETAILS.titles[category]
    
    clear("reports_thead_tr")
    var tr = document.getElementById("reports_thead_tr");
    
    var td;
    
    for (var i=0; i<titles.length; ++i)
    {
        td = document.createElement("td")
        td.innerHTML = titles[i];
        
        tr.appendChild(td);
    }
    
    var form = new FormData();
    form.append("time-data", SEARCH_DURATION);

    send_request("POST",URL+"generate_report_span",fetched_report_span,form);
    
    //show_modal("reports-modal");
}

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


function fetched_users()
{
    stop_connecting();
    
    if(this.status===200)
    {
        var users = JSON.parse(this.responseText);

        clear("accounts_tbody");

        var tbody = document.getElementById("accounts_tbody");

        var tr, td;

        for (var i=0; i<users.length; i++)
        {
            tr = document.createElement("tr");
                td = document.createElement("td");
                td.innerHTML = (i+1);
                td.style.fontWeight = "bold";
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = users[i][0];
                td.uname = users[i][0];
                td.onclick = delete_user;
                td.style.color = "#00d";
                td.setAttribute("class", "hovers");
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = users[i][1];
                tr.appendChild(td);
            
            tbody.appendChild(tr);
        }

        show_modal("accounts-modal");

    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function fetch_users()
{
    send_request("GET",URL+"users",fetched_users);
}

function delete_user()
{
        
    var user = new USER(window.name);
    if (user.uname!="admin")
    {
        return;
    }

    if(this.uname=="admin")
    {
        show_info("this account can not be deleted!");
        return;
    }

    DELETE_TARGET_ACCOUNT = this.uname;
    swal({
          title: "Delete Account",
          text: "delete user account <"+DELETE_TARGET_ACCOUNT+">?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Delete",
          closeOnConfirm: true
        },
        
        function()
        {
            var form = new FormData();
            form.append("uname", DELETE_TARGET_ACCOUNT);

            send_request("POST", URL+"delete_account",fetch_users,form);
        }
    );

}

function add_user()
{
    stop_connecting();
    
    if(this.status===200)
    {
        if (this.responseText=="1")
        {
            flag_error("username already in system!");
            return;
        }

        var new_user_uname = document.getElementById("new_user_uname").value;
        var new_user_pswd = document.getElementById("new_user_pswd").value;
            new_user_pswd = new_user_pswd.length?new_user_pswd:"123";
        
        var new_user_category = document.getElementById("new_user_category").value;


        var form = new FormData();
        form.append("uname", new_user_uname);
        form.append("pswd", new_user_pswd);
        form.append("account_type", new_user_category);

        send_request("POST", URL+"register", function(){
            stop_connecting();show_success('user added to system!')}, 
        form);
        
        hide_modal('new-user-modal');
        hide_modal('accounts-modal');
        
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function user_in_system()
{
    var new_user_uname = document.getElementById("new_user_uname").value;
    if (!new_user_uname.length)
    {
        flag_error("new username?");
        return;
    }

    var form = new FormData();
    form.append("target", new_user_uname);

    send_request("POST", URL+"user_in_system", add_user,form);

}

function delete_promotion_item_row()
{
    document.getElementById("promotional_items_tbody").removeChild(this.mom);
}

function new_promotional_item(_item="",_from="",_to="",_price="")
{
    var tr = document.createElement("tr"),
        td;
    
    var _delete_row = document.createElement("div");
    _delete_row.setAttribute("class","col-xs-1 delete_row hovers");
    _delete_row.innerHTML = "x";
    _delete_row.mom = tr;
    _delete_row.onclick = delete_promotion_item_row;

    var td = document.createElement("td");
        td.appendChild(_delete_row);
        tr.appendChild(td);

    var item = document.createElement("input");
    item.style.height = "100%"
    item.style.border = "0px";
    item.style.borderRadius = "5px";
    item.style.borderBottom = "1px solid #ddd";
    item.setAttribute("placeholder","item");
    item.setAttribute("class","form-control");
    item.value = _item;

        td = document.createElement("td");
        td.appendChild(item);
        tr.appendChild(td);

    var from = document.createElement("input");
    from.style.height = "100%"
    from.style.border = "0px";
    from.style.borderRadius = "5px";
    from.style.borderBottom = "1px solid #ddd";
    from.setAttribute("type","date");
    from.setAttribute("class","form-control");
    from.value = _from;

        td = document.createElement("td");
        td.appendChild(from);
        tr.appendChild(td);

    var to = document.createElement("input");
    to.style.height = "100%"
    to.style.border = "0px";
    to.style.borderRadius = "5px";
    to.style.borderBottom = "1px solid #ddd";
    to.setAttribute("type","date");
    to.setAttribute("class","form-control");
    to.value = _to;

        td = document.createElement("td");
        td.appendChild(to);
        tr.appendChild(td);

    var price = document.createElement("input");
    price.style.height = "100%"
    price.style.border = "0px";
    price.style.borderRadius = "5px";
    price.style.borderBotpricem = "1px solid #ddd";
    price.setAttribute("type","number");
    price.setAttribute("class","form-control");
    price.value = _price;

        td = document.createElement("td");
        td.appendChild(price);
        tr.appendChild(td);


    document.getElementById("promotional_items_tbody").appendChild(tr);
}

function fetched_promotional_items()
{
    stop_connecting();
    
    if(this.status===200)
    {
        var data = JSON.parse(this.responseText);
        
        clear("promotional_items_tbody");
        
        var from,to;
        for(var i=0; i<data.length; ++i)
        {
            from = data[i][1];
            to = data[i][2];
            from = from.slice(0,4)+"-"+from.slice(4,6)+"-"+from.slice(6,8);
            to = to.slice(0,4)+"-"+to.slice(4,6)+"-"+to.slice(6,8);
            new_promotional_item(data[i][0], from, to, data[i][3]);
        }
        show_modal('promotion-items-modal');
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function fetch_promotional_items()
{
    send_request("GET", URL+"promotional_items_all",fetched_promotional_items); 
}

function updated_promotional_items()
{
    stop_connecting();
    
    if(this.status===200)
    {
        show_success("updated romotional items!");
        hide_modal('promotion-items-modal');
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);

}

function update_promotional_items()
{
    var items = "";
    var rows = document.getElementById("promotional_items_tbody").getElementsByTagName("tr");
    var inputs, from, to;
    for (var i=0; i<rows.length; ++i)
    {
        inputs = rows[i].getElementsByTagName("input");
        for (var j=0; j<inputs.length; ++j)
        {
            if (!inputs[j].value.length)
            {
                flag_error("please fill all data for all items!");
                return;
            }            
        }

        if(isNaN(inputs[3].value))
        {
            flag_error("please provide a figure or all prices!");
            return;
        }
        
        if(items.length)
            items += ";"
        
        from = inputs[1].value.split("-");
        to = inputs[2].value.split("-");
        
        from = from[0] + (from[1].length>1?from[1]:"0"+from[1]) + (from[2].length>1?from[2]:"0"+from[2])
        to = to[0] + (to[1].length>1?to[1]:"0"+to[1]) + (to[2].length>1?to[2]:"0"+to[2])
        
        items += inputs[0].value+":"+from+":"+to+":"+parseFloat(inputs[3].value);

    }
    
    var form = new FormData();
    form.append("data", items);
    form.append("category", "promotional_items");

    send_request("POST", URL+"reset_data",updated_promotional_items,form);
}

function delete_row()
{
    document.getElementById("data_div").removeChild(this.mom);
    document.getElementById("data_div").removeChild(this.mom_br);
}

function new_data_entry(entry="")
{
    var row = document.createElement("div");
    var row_br = document.createElement("br");

    row.setAttribute("class","row");
    
    var _delete_row = document.createElement("div");
    _delete_row.setAttribute("class","col-xs-1 delete_row hovers");
    _delete_row.innerHTML = "x";
    _delete_row.mom = row;
    _delete_row.mom_br = row_br;
    _delete_row.onclick = delete_row;
    
    var seg = document.createElement("input");
    seg.value = entry;
    seg.style.height = "25px"
    seg.style.border = "0px";
    seg.style.borderRadius = "5px";
    seg.style.borderBottom = "1px solid #ddd";
    seg.setAttribute("class","col-xs-4");
    seg.setAttribute("placeholder",DATA_SECTION.title);

    row.appendChild(_delete_row);
    row.appendChild(seg);
    
    document.getElementById("data_div").appendChild(row);
    document.getElementById("data_div").appendChild(row_br);
}

function fetched_data()
{
    stop_connecting();
    
    if(this.status===200)
    {
        var data = JSON.parse(this.responseText);
        
        clear("data_div");
        
        for(var i=0; i<data.length; ++i)
            new_data_entry(data[i]);
        
        document.getElementById("data-title").innerHTML = DATA_SECTION.title;
        show_modal('data-modal');
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function fetch_data()
{
    var url;
    
    if(DATA_SECTION.category=="client_categories")
        url = "client_segments";
    else if(DATA_SECTION.category=="training_topics")
        url = "training_topics";
    else if(DATA_SECTION.category=="support_areas")
        url = "support_areas";
    else if(DATA_SECTION.category=="activities")
        url = "activities";
    else if(DATA_SECTION.category=="email_recepients")
        url = "mail_recepients";
    
    send_request("GET",URL+url,fetched_data);
}

function updated_data()
{
    stop_connecting();
    
    if(this.status===200)
    {
        show_success("updated "+DATA_SECTION.title+"!");
        hide_modal('data-modal');
    }
    else
        flag_error("error: "+this.status+"; "+this.responseText);
}

function update_data()
{
    var segment_divs = document.getElementById("data_div").getElementsByClassName("row"),
        segment,
        segments="";

    for(var i=0; i<segment_divs.length; ++i)
    {
        segment = segment_divs[i].getElementsByTagName("input")[0].value;
        
        if (!segment.length)
        {
            flag_error("one or more "+DATA_SECTION.title+" left blank!");
            return;
        }

        if (segments.length)
            segments += ";";
        
        segments += segment;
    }

    var form = new FormData();
    form.append("data", segments);
    form.append("category", DATA_SECTION.category);

    send_request("POST",URL+"reset_data", updated_data,form);

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

function fetched_full_report()
{
    stop_connecting();
    
    if (this.status===200)
    {
        reply = JSON.parse(this.responseText);

        var modal = document.getElementById(reply.account_type+"-report-modal");
        var entries = modal.getElementsByClassName("e");
        CURRENT_MAP_DIV = modal.getElementsByClassName("map")[0];

        if (reply.account_type=="SalesRep")
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
            entries[0].innerHTML = reply.data[0]
            entries[1].innerHTML = 
                reply.data[1].slice(0,4)+"-"+
                reply.data[1].slice(4,6)+"-"+
                reply.data[1].slice(6,8)+" "+reply.data[2]
            
            entries[2].innerHTML = reply.data[3];
            entries[3].innerHTML = reply.data[6];
            entries[4].innerHTML = reply.data[7];
            
            if(reply.data[8].indexOf(";")>=0)
            {
                var cps = reply.data[8].split(";");
                cp = cps[0].split(":");
                entries[5].innerHTML = cp[0]+" ("+cp[1]+(cp[2].length?", ":"")+cp[2]+")";
                
                cp = cps[1].split(":");
                entries[6].innerHTML = cp[0]+" ("+cp[1]+(cp[2].length?", ":"")+cp[2]+")";
            }
            else
            {
                var cp = reply.data[8].split(":");
                entries[5].innerHTML = cp[0]+" ("+cp[1]+(cp[2].length?", ":"")+cp[2]+")";
                entries[6].innerHTML = "-";
            }

            entries[7].innerHTML = reply.data[9]?convert_figure_to_human_readable(reply.data[9], 0):"-";
            entries[8].innerHTML = reply.data[10]?convert_figure_to_human_readable(reply.data[10], 0):"-";
            entries[9].innerHTML = reply.data[11]?convert_figure_to_human_readable(reply.data[11], 0):"-";

            var _PIs = reply.data[12].split(";");
            entries[10].innerHTML = "";
            for(var i=0; i<_PIs.length; ++i)
            {
                if(!_PIs[i].length)
                {
                    entries[10].innerHTML = "-"
                    break;
                }
                entries[10].innerHTML += _PIs[i].split(":")[0]+" ("+_PIs[i].split(":")[1]+")<br>";
            }

            entries[11].innerHTML = reply.data[13].replace("\n",".<br>");
            
            initMap(parseFloat(reply.data[4]), parseFloat(reply.data[5]));
        }
        else if (reply.account_type=="TechnicalRep")
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

            if (reply.data==null)
            {
                show_info("sorry, report can't seem to be found in the system");
                return;
            }
            
            entries[0].innerHTML = reply.data[0];
            entries[1].innerHTML = 
                reply.data[3].slice(0,4)+"-"+
                reply.data[3].slice(4,6)+"-"+
                reply.data[3].slice(6,8)+" "+reply.data[4]

            entries[2].innerHTML = reply.data[1];
            entries[3].innerHTML = reply.data[7];
            entries[4].innerHTML = reply.data[8].replace("\n",".<br>");

            initMap(parseFloat(reply.data[5]), parseFloat(reply.data[6]));
        }
        else if (reply.account_type=="TechnicalRep-TP")
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
            if (reply.data==null)
            {
                show_info("sorry, report can't seem to be found in the system");
                return;
            }
            
            entries[0].innerHTML = reply.data[0];
            entries[1].innerHTML = 
                reply.data[2].slice(0,4)+"-"+
                reply.data[2].slice(4,6)+"-"+
                reply.data[2].slice(6,8)+" "+reply.data[3]

            entries[2].innerHTML = reply.data[1];
            entries[3].innerHTML = reply.data[7];
            entries[4].innerHTML = reply.data[6];

            var trainees = (reply.data[8]).split(";");
            var _trainees = "";
            for (var i=0; i<trainees.length; i++)
            {
                var trainee = trainees[i].split(":");
                _trainees += (trainee[0]+" ("+trainee[1]+")"+"<br>");
            }
            entries[5].innerHTML = _trainees.length?_trainees:"-";

            entries[6].innerHTML = reply.data[9].replace("\n",".<br>");

            initMap(parseFloat(reply.data[4]), parseFloat(reply.data[5]));

        }
        else if (reply.account_type=="TechnicalRep-Core")
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

            if (reply.data==null)
            {
                show_info("sorry, report can't seem to be found in the system");
                return;
            }
            
            entries[0].innerHTML = reply.data[0];
            entries[1].innerHTML = 
                reply.data[2].slice(0,4)+"-"+
                reply.data[2].slice(4,6)+"-"+
                reply.data[2].slice(6,8)+" "+reply.data[3]

            entries[2].innerHTML = reply.data[1];
            entries[3].innerHTML = reply.data[6];
            entries[4].innerHTML = reply.data[7];
            entries[5].innerHTML = reply.data[9];
            entries[6].innerHTML = reply.data[10];
            entries[7].innerHTML = reply.data[11];
            entries[8].innerHTML = reply.data[8].replace("\n",".<br>");
            entries[9].innerHTML = reply.data[12];

            initMap(parseFloat(reply.data[4]), parseFloat(reply.data[5]));

        }

        show_modal(reply.account_type+"-report-modal");

    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }

}

function fetch_full_report()
{
    var form = new FormData();
    form.append("date", this.data[0]);
    form.append("time", this.data[1]);
    form.append("target", this.data[2]);
    
    send_request("POST", URL+"full_report",fetched_full_report,form);    
}

function send_mail_handler()
{
    stop_connecting();
    if (this.status===200)
    {
        show_success("email sent sucessfully");
    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }

}

function mail_results()
{

    var subject = document.getElementById("mail_subject").value,
        email = document.getElementById("mail_destination").value, 
        message = document.getElementById("mail_body").value;
    
    if(!email.length)
    {
        show_info("please provide destination email");
        return;
    }
    if(email.indexOf("@")<0)
    {
        show_info("invalid email provided");
        return;
    }

    if(!subject.length)
    {
        show_info("please provide email subject");
        return;
    }

    if(!message.length)
    {
        show_info("please provide email body");
        return;
    }

    hide_modal("email-modal");

    var mail_data = REPORT_DATA;

    var old_dates = [];
    for (var i=0; i<mail_data.length; i++)
    {
        var date = mail_data[i][0];
        old_dates[i] = date;
        mail_data[i][0]=date.slice(6,8)+"/"+date.slice(4,6)+"/"+date.slice(0,4);
    }
    
    
    var mail_cols = REPORT_DETAILS.titles[CURRENT_SEARCH_CATEGORY];

    var mail_field = REPORT_DETAILS.names[CURRENT_SEARCH_CATEGORY];
    
    var data = ["JMS-Report("+mail_field+")", mail_cols, mail_data, mail_field, subject,email, message];
    var form = new FormData();
    form.append("data", JSON.stringify(data));

    send_request("POST", URL+"send_mail",send_mail_handler,form);

    // reconvert the dates into old format...just in case another function will use this data
    for (var i=0; i<mail_data.length; i++)
    {
        mail_data[i][0] = old_dates[i];
    }

                                
}

function initMap(lat=null, lng=null) {
    
    if(lat==null)
        return;

    var myLatLng = {lat: lat, lng: lng};

    var map = new google.maps.Map(CURRENT_MAP_DIV, {
    zoom: 18,
    center: myLatLng
    });

    <!-- set map type to satellite
    map.setMapTypeId(google.maps.MapTypeId.HYBRID); 

    var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'map'
    });

    // Add circle overlay and bind to marker
    var circle = new google.maps.Circle({
    map: map,
    radius: 50,    // metres
    fillColor: '#AA0000'
    });
    circle.bindTo('center', marker, 'position');
}

function sent_last_months_reports()
{
    stop_connecting();
    if (this.status===200)
    {
        if(this.responseText=="1")
            show_success("email sent sucessfully");
        else
            show_info("no reports were found for the last month!");
    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
    }
}

function send_last_months_reports()
{
    var user = new USER(window.name);

    var email = document.getElementById("get-email-modal").getElementsByTagName("input")[0].value;
    if(!email.length)
    {
        if(!user.email.length)
        {
            flag_error("please provide the destination email or go to Edit->Email and set your default email address");
            return;
        }
        
        email = user.email
    }
    
    if(email.indexOf("@")<=0)
    {
        flag_error("invalid email provided!");
        return;
    }
    
    hide_modal("get-email-modal");
    
    var form = new FormData();
    form.append("category", user.account_type);
    form.append("destination", email);

    send_request("POST",URL+"send_last_months_reports",sent_last_months_reports,form)
}



window.onload = function() 
{
    if (window.name==""){window.location.href="index.html"; return 0;}
    
    document.getElementsByTagName("object")[0].data = bug_report_url();
    
    // deactivate adding new user if not super-user
    var user = new USER(window.name);
    if (user.uname!="admin")
    {
        if(user.uname="Admin")
        {
            swal({
              title: "Account Upgrade Needed",
              text: "you're account does not have a category. please talk to the admin about this as its most likely to be caused by the system upgrade",
              type: "warning",
              showCancelButton: false,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Ok",
              closeOnConfirm: false
            },
            function(){
              window.location.href="index.html";
              return;
            });
        }
        
        var super_previlages = document.getElementsByClassName("__super__");
        var salesreps_previleges = document.getElementsByClassName("__sr__");
        var technicalreps_previleges = document.getElementsByClassName("__tr__");
        var trc_previleges = document.getElementsByClassName("__trc__");
        var trtp_previleges = document.getElementsByClassName("__trtp__");
        
        var not_previlaged = [];
        
        if(user.account_type.indexOf("Sales")>=0) // salesrep
        {
            not_previlaged = [super_previlages,technicalreps_previleges,trc_previleges,trtp_previleges];
        }
        
        else if(user.account_type.indexOf("Core")>=0) // TRC
        {
            not_previlaged = [super_previlages,technicalreps_previleges,salesreps_previleges,trtp_previleges];
        }

        else if(user.account_type.indexOf("Third")>=0) // TRTP
        {
            not_previlaged = [super_previlages,technicalreps_previleges,salesreps_previleges,trc_previleges];
        }

        else // TR
        {
            not_previlaged = [super_previlages,trtp_previleges,salesreps_previleges,trc_previleges];
        }

        for(var i=0; i<not_previlaged.length; ++i)
        {
            for (var j=0; j<not_previlaged[i].length; ++j)
                not_previlaged[i][j].style.display = "none";
        }

    }
    
    if (user.email.length)
        document.getElementById("get-email-modal").getElementsByTagName("input")[0].setAttribute("placeholder", user.email);
    
    stop_connecting();

}