function cancel()
{
    window.location.href="users.html";
}

function add_user_handler()
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

function add_user()
{
    if (document.getElementById("uname").value=="" || document.getElementById("pswd").value=="")
    {
        swal({
        title: "Account Error",
        text: "no field may be left empty!",
        type: "error",
        confirmButtonText: "Ok"
      });

        return 0;
    }

    var uname = document.getElementById("uname").value;
    var pswd = document.getElementById("pswd").value;
    var account_type = document.getElementById("account_type").value;

    var req = new XMLHttpRequest();

    req.open("POST", URL+"register", true);

    req.onload = add_user_handler;

    var form = new FormData();
    form.append("uname", uname);
    form.append("pswd", pswd);
    form.append("account_type", account_type);
    req.send(form);
    
    start_connecting("adding user...");

}

window.onload = function (){
    var account_types = ["SalesRep", "TechnicalRep"];
    for (var i=0; i<account_types.length;i++)
    {
        var option = document.createElement("option");
        option.value = account_types[i];
        option.innerHTML = account_types[i];
        document.getElementById("account_type").appendChild(option)
    }
};
