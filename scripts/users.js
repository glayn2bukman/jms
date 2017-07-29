var NEW_ADMIN_PSWD = "";
var DELETE_TARGET_ACCOUNT = "";

function done()
{
    window.location.href="admin.html";
}

function add_user()
{
    window.location.href="add_user.html";
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
    DELETE_TARGET_ACCOUNT = this.uname;
    swal({
          title: "Delete Account",
          text: "delete user account <"+DELETE_TARGET_ACCOUNT+">?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Delete",
          closeOnConfirm: false
        },
        
        function()
        {
            var req = new XMLHttpRequest();

            req.open("POST", URL+"delete_account", true);

            req.onload = delete_user_handler;

            var form = new FormData();
            form.append("uname", DELETE_TARGET_ACCOUNT);
            req.send(form);
            
            start_connecting("deleting user...");

        }
    );

}

function get_users_handler(){
    if (this.status===200)
    {
        stop_connecting();
        
        var users = JSON.parse(this.responseText);

        for (var i=0; i<users.length; i++)
        {
            var p = document.createElement("p");
            p.uname = users[i];
            p.innerHTML = (i+1)+") "+users[i];
            p.style.color = "#001166";

            if (users[i]=="admin"){p.onclick = edit_account;} //edit account is defined in globals.js 
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

    start_connecting("fetching all users...");
}


window.onload = function ()
{
    // set body size to a fixed value corresponding to the screen...
    document.getElementById("body").style.height = window.innerHeight+"px";
    document.getElementById("body").style.width = window.innerWidth+"px";

    get_users;
}
