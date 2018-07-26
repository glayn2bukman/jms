var PROMOTIONAL_ITEMS = [];

function delete_PI_row()
{
    document.getElementById("promoted_items_div").removeChild(this.mom);
    document.getElementById("promoted_items_div").removeChild(this.mom_br);
}

function new_promotional_item()
    // unlike v1, v2 fetches all data (including promotional items)
    // b4 the user can actually start using the system. This means
    // we dont have to fetch promotional items everytime we are adding 
    // one
{
    if(!PROMOTIONAL_ITEMS.length)
    {
        show_info("no promotional items!");
        return;
    }
    
    var row = document.createElement("div");
    var row_br = document.createElement("br");

    row.setAttribute("class","row");
    
    var delete_row = document.createElement("div");
    delete_row.setAttribute("class","col-xs-1 delete_promotion_item");
    delete_row.innerHTML = "x";
    delete_row.mom = row;
    delete_row.mom_br = row_br;
    delete_row.onclick = delete_PI_row;
    

    var pi = document.createElement("select");
    pi.style.height = "25px"
    pi.style.border = "0px";
    var pi_option;
    pi.setAttribute("class","col-xs-8");
    for(var i=0; i<PROMOTIONAL_ITEMS.length; ++i)
    {
        pi_option = document.createElement("option");
        pi_option.innerHTML = PROMOTIONAL_ITEMS[i][0];
        pi.appendChild(pi_option);
    }

    var pi_qty = document.createElement("input");
    pi_qty.setAttribute("type","number");
    pi_qty.setAttribute("class","col-xs-2");
    pi_qty.setAttribute("placeholder","qty");
    pi_qty.style.height = "25px";
    pi_qty.style.border = "0px";
    pi_qty.style.borderRadius = "5px";
    pi_qty.style.borderBottom = "1px solid #ddd";

    row.appendChild(delete_row);
    row.appendChild(pi);
    row.appendChild(pi_qty);
    
    document.getElementById("promoted_items_div").appendChild(row);
    document.getElementById("promoted_items_div").appendChild(row_br);
}

function submit_report()
{
    var cdp = document.getElementById("clinet_details_panel");
    var cdp_inputs = cdp.getElementsByTagName("input");
    
    var client = cdp_inputs[0].value, client_known = cdp_inputs[1].checked?"yes":"no";
    var segment = cdp.getElementsByTagName("select")[0].value;

    var _CPDs = document.getElementById("contact_personnel_panel").getElementsByTagName("input");
    var cp1 = [_CPDs[0].value, _CPDs[1].value, _CPDs[2].value],
        cp2 = [_CPDs[3].value, _CPDs[4].value, _CPDs[5].value],
        cp;

    var op = document.getElementById("orders_panel").getElementsByTagName("input");
    var orders = [op[0].value, op[1].value, op[2].value];

    remark = document.getElementById("remark").value;

    if(!client.length)
    {
        flag_error("client?");
        return;
    }
    
    if(!segment.length)
    {
        flag_error("client segment?");
        return;
    }
    
    if((!cp1[0].length) || (!cp1[1].length))
    {
        flag_error("please fill all contact personnel-1 details");
        return;
    } cp = cp1[0]+":"+cp1[1]+":"+cp1[2];

    if(cp2[0].length&&cp2[1].length)
        cp += ";"+cp2[0]+":"+cp2[1]+":"+cp2[2];
    
    var order;
    for (var o=0; o<orders.length; ++o)
    {
        order = orders[o];
        order = order.split(","); order = order.join()
        order = order.length?order:"0";
        if(isNaN(order))
        {
            flag_error("invalid figure given for an order");
            return;
        }
        else
            orders[o] = parseFloat(order)
    }

    var _PI_divs = document.getElementById("promoted_items_div").getElementsByClassName("row"),
        _pi, _pi_qty, unit_price,
        _PIs="";

    for(var i=0; i<_PI_divs.length; ++i)
    {
        _pi = _PI_divs[i].getElementsByTagName("select")[0].value;
        _pi_qty = _PI_divs[i].getElementsByTagName("input")[0];
        
        if (!_pi_qty.value.length)
        {
            flag_error(_pi+" has no quantity!");
            return;
        }

        if (_PIs.length)
            _PIs += ";";
        
        unit_price = 0;    
        for(var j=0; j<PROMOTIONAL_ITEMS.length; ++j)
        {
            if(PROMOTIONAL_ITEMS[i][0]==_pi)
            {
                unit_price = PROMOTIONAL_ITEMS[j][3];
                break;
            }
        }
        
        _PIs += _pi+":"+_pi_qty.value+":"+(parseFloat(_pi_qty.value)*unit_price);
    }

    if(!remark.length)
    {
        flag_error("remark?");
        return;
    }

    PAYLOAD = new FormData();
    
    PAYLOAD.append("client", client);
    PAYLOAD.append("remark", remark);
    PAYLOAD.append("order_generated", orders[0]);
    PAYLOAD.append("order_received", orders[1]);
    PAYLOAD.append("debt_collected", orders[2]);
    PAYLOAD.append("client_category", segment);
    PAYLOAD.append("client_old", client_known);
    PAYLOAD.append("contact_people", cp);
    PAYLOAD.append("products_promoted", _PIs);

    locate();
}

