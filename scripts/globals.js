// this file contains variables that are global to all html files of this project
URL = "http://139.162.235.29:8123/"

function logout()
{
    if(confirm("Logout?")) {window.location.href="index.html"}
    else {/*do nothing*/}
}

function quit()
{
    if(confirm("Quit Application?")) 
    {
        window.location.href="index.html"
        // the line below daint work coz you can only close a window u've opened...
        //close();
    }
    else {/*do nothing*/}
}

function USER(user)
// create a user pbject to be used when changin the account password...
{
    this.uname = "";
    this.pswd = "";
    this.account_type = "";
    
    var terminations = 0;
    for (var i=0; i<user.length; i++)
    {
        if (user[i]==";") {terminations += 1; continue;}
        if (terminations===0) {this.uname += user[i];}
        else if (terminations===1) {this.pswd += user[i];}
        if (terminations===2) {this.account_type += user[i];}
    }
     
}

function edit_account_handler()
{
    swal({
    title: "Password reset info",
    text: "password set sucessfully!",
    type: "info",
    confirmButtonText: "Ok"
  });

}

function edit_account()
{
    var user = new USER(window.name); 
    var new_pswd = prompt(user.uname+"\'s new password", user.pswd);

    if (new_pswd!=null) // if the user clicked "OK"
    {
        if (new_pswd=="") 
        {
            swal({
            title: "Input Error",
            text: "password cant be left empty!",
            type: "error",
            confirmButtonText: "Ok"
          });

            return 0;
        }

        var req = new XMLHttpRequest();

        req.open("POST", URL+"edit_account", true);

        req.onload = edit_account_handler;

        var form = new FormData();

        // our form is built in such a way that we only edit the user's password
        form.append("old_uname", user.uname);
        form.append("new_uname", user.uname);
        form.append("pswd", new_pswd);
        form.append("account_type", user.account_type);

        req.send(form);
    }
}






