function login_handler(){
    if (this.status===200){
        if ( this.responseText.indexOf("Error")>=0 )
        {
            swal({
                title: "Login Error",
                text: this.responseText,
                type: "info",
                confirmButtonText: "Ok"
              });
              
           return 0;
        }

        if (typeof(Storage) !== "undefined") {
            // sing localstorage clears the data when i redirect the page...
            var user = new USER(this.responseText);
            localStorage.setItem("user", user);
            
            //so to solve this, i use a simple hack -> store my data as a string in window.name!
            window.name = this.responseText;
        } else {
            swal({
                title: "Memory Error",
                text: "No local Storage available",
                type: "error",
                confirmButtonText: "Ok"
              });
        }

        var user = new USER(window.name);

        if ( user.account_type=="Admin" )
        {
            // load admin page...        
            window.location.href = "admin.html";
        }

        else if ( user.account_type=="SalesRep" )
        {
            // load salesrep page...        
            window.location.href = "salesrep.html";
        }

        else if ( user.account_type=="TechnicalRep" )
        {
            // load salesrep page...        
            window.location.href = "technicalrep.html";
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

function post(){
    var req = new XMLHttpRequest();

    req.open("POST", URL+"login", true);

    //req.onreadystatechange = handler;
    req.onload = login_handler;

    
    var form = new FormData();
    form.append("uname", document.getElementById("uname").value);
    form.append("pswd", document.getElementById("pswd").value);
    req.send(form);
    
    start_connecting("signing in...");
}

