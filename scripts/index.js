function login_handler(){
    if (this.status===200){
        if ( this.responseText.indexOf("Error")>=0 )
        {
            stop_connecting();
            flag_error(this.responseText);

           return 0;
        }

        if (typeof(Storage) !== "undefined") {
            // using localstorage clears the data when i redirect the page...
            var user = new USER(this.responseText);
            localStorage.setItem("user", user);
            
            //so to solve this, i use a simple hack -> store my data as a string in window.name!
            window.name = this.responseText;
        } else {
            flag_error("No local Storage available");
        }

        var user = new USER(window.name);

        if ( user.account_type.indexOf("Admin")>=0)
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

        else if ( user.account_type=="TechnicalRep-TP" )
        {
            // load salesrep page...        
            window.location.href = "technicalrep_tp.html";
        }

        else if ( user.account_type=="TechnicalRep-Core" )
        {
            // load salesrep page...        
            window.location.href = "technicalrep_core.html";
        }

    }
    else
    {
        flag_error("error: "+this.status+"; "+this.responseText);
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

