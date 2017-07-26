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

function change_date(date)
// change date from DD/MM/YYYY to YYYYMMDD
{
    var dmy = date.split("/");
    var changed_date = dmy[2];
    
    if (dmy[1].length==1){changed_date += "0"+dmy[1];}
    else {changed_date += dmy[1];}

    if (dmy[0].length==1){changed_date += "0"+dmy[0];}
    else {changed_date += dmy[0];}

    return changed_date;
}

function change_time(time)
// change date from H:M to HH:MM
{
    var hm = time.split(":");
    var changed_time = "";
    
    if (hm[0].length==1){changed_time += "0"+hm[0];}
    else {changed_time += hm[0];}

    if (hm[1].length==1){changed_time += ":0"+hm[1];}
    else {changed_time += ":"+hm[1];}

    return changed_time;
}

function change_figure(figure)
// change money from xx,xxx,xxx,.... to xxxxxxxxxxx...
{
    var figures = figure.split(",");
    var changed_figure = "";
    for (var i=0; i<figures.length; i++) {changed_figure += figures[i];}
    
    return changed_figure;
}

function locate() 
{
    if (navigator.geolocation) 
    {
        // function <on_locate> is defined wherever locate will be called (salesrep.js and technicalrep.js for our case)
        navigator.geolocation.getCurrentPosition(on_locate);

        swal({
            title: "",
            text: "getting gps location...",
            type: "info",
            showConfirmButton: false
        });
                
    } else 
    {
        on_fail_to_locate();
    }
}

function on_fail_to_locate()
{
    swal({
        title: "gps info!",
        text: "Failed to get gps location...",
        type: "error",
        confirmButtonText: "easy..."
    });
}

function report_handler()
{
    if (this.status===200)
    {
        swal({
            title: "Report Status",
            text: "report sent sucessfully",
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
    }

}




