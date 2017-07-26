NEW_ADMIN_PSWD = "";

function done()
{
    window.location.href="admin.html";
}

function add_user()
{
    window.location.href="add_user.html";
}

function edit_pswd_handler()
{
    if (this.status===200)
    {    
        var user = new USER(window.name);
        window.name = user.uname+";"+NEW_ADMIN_PSWD+";"+user.account_type;

        swal({
            title: "Account Info",
            text: "your password has been reset",
            type: "info",
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
        
        NEW_ADMIN_PSWD = "";
    }
}

function edit_pswd()
{
    var user = new USER(window.name);
    var new_pswd = prompt("New Password", user.pswd);
    
    if (new_pswd!=null) // clicked "OK"
    {
        if (new_pswd=="")
        {
            swal({
                title: "Account Error",
                text: "cant have a blank password!",
                type: "error",
                confirmButtonText: "Ok"
              });
        
            return 0;
        }

        var req = new XMLHttpRequest();

        req.open("POST", URL+"edit_account", true);

        req.onload = edit_pswd_handler;

        var form = new FormData();
        form.append("old_uname", user.uname);
        form.append("new_uname", user.uname);
        form.append("pswd", new_pswd);
        form.append("account_type", user.account_type);
        req.send(form);

        NEW_ADMIN_PSWD = new_pswd;
    }
}

function delete_user_handler()
{
    if (this.status===200)
    {    
        window.location.href="users.html";
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

function delete_user()
{
    if(confirm("Delete User <"+this.uname+">?")) 
    {
        var req = new XMLHttpRequest();

        req.open("POST", URL+"delete_account", true);

        req.onload = delete_user_handler;

        var form = new FormData();
        form.append("uname", this.uname);
        req.send(form);

    }
    else {/*do nothing*/}
}

function get_users_handler(){
    if (this.status===200)
    {
        var users = JSON.parse(this.responseText);

        for (var i=0; i<users.length; i++)
        {
            var p = document.createElement("p");
            p.uname = users[i];
            p.innerHTML = (i+1)+") "+users[i];
            p.style.color = "#001166";

            if (users[i]=="admin"){p.onclick = edit_pswd;}
            else {p.onclick = delete_user;}

            document.getElementById("results_div").appendChild(p);
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


function get_users(){
    var req = new XMLHttpRequest();

    req.open("GET", URL+"users", true);

    req.onload = get_users_handler;
    req.send(null);
}


window.onload = get_users;
