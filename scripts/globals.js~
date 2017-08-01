// this file contains variables that are global to all html files of this project
URL = "http://139.162.235.29:8123/"

function clear(mom)
{
    var element = document.getElementById(mom);
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convert_figure_to_human_readable(figure)
// this is my initial conception of this function. am sure it can be made more efficient(not that it isnt!)
{
    var fig = (""+figure).split("");
    fig.reverse();
    
    var _fig = [];
    
    while (fig.length>0)
    {
        if (fig.length>3)
        {
            _fig = _fig.concat(  (fig.slice(0,3)).concat([","])   );
            fig = fig.slice(3, fig.length);
        }
        else
        {
            _fig = _fig.concat(fig);
            fig = []; // force termination of loop
        }
    }
    
    _fig.reverse();
    var human_readable = "";
    for (var i=0; i<_fig.length; i++) {human_readable += _fig[i];}
    return human_readable;
}

function logout()
{
/*    if(confirm("Logout?")) {window.location.href="index.html";}
    else {}
*/
    swal({
      title: "Logout",
      text: "Close this session?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    },
    function(){
      window.location.href="index.html";
    });
}

function quit()
{
    swal({
      title: "Quit",
      text: "Close this session?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      closeOnConfirm: false
    },
    function(){
      window.location.href="index.html";
    });
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
    if (this.status===200)
    {    
        //stop_connecting(); // not needed as slat(...) will close any exixsting sweetalert first..
    
        swal({
            title: "Password reset info",
            text: "password set sucessfully!",
            type: "success",
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

function edit_account()
{
    swal({
          title: "Edit password",
          text: "Enter your new password please",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "new password"
        },
        
        function(new_pswd){
            if (new_pswd === false) {return false;} // clicked "cancel"

            if (new_pswd === "") 
            {
                swal.showInputError("Password cant be empty!");
                return false
            }
          
            var user = new USER(window.name); 

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
            start_connecting("editting password...");
        }
    );
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

    if (hm[2].length==1){changed_time += ":0"+hm[2];}
    else {changed_time += ":"+hm[2];}

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

function start_connecting(info)
{
    if (info==null) {info="connecting...";}
    swal({
        title: "",
        text: info,
        type: "info",
        showConfirmButton: false
    });
}

function stop_connecting(){swal.close();}

function locate() 
{
    try
    //EDITING is not defined for technicalrep... 
    {
        if (EDITING.length>0)
        // if salesrep is editing an existing report, EDITING=[uname,date,time,lat,lon]
        {
            on_locate({ // simulate a sucess in fetching gps location ...
                coords:{latitude:EDITING[3], longitude:EDITING[4]}
                });
            return;
        }
    }
    catch (error){;}// do nara....simply proceed to normal gps location
    
    if (navigator.geolocation) 
    {
        // function <on_locate> is defined wherever locate will be called (salesrep.js and technicalrep.js for our case)
        navigator.geolocation.getCurrentPosition(on_locate);

        start_connecting("getting gps location...");
                
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
            type: "success",
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




