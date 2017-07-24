function handler(){
    if (this.status===200){
        if ( this.responseText.indexOf("Error")>=0 )
        {
            swal({
                title: "Login Error",
                text: this.responseText,
                type: "info",
                confirmButtonText: "Ok"
              });
        }

        else if ( this.responseText.indexOf(";Admin")>=0 )
        {
            // load admin page...        
        }

        else if ( this.responseText.indexOf(";SalesRep")>=0 )
        {
            // load salesrep page...        
            window.location.href = "salesrep.html";
        }

        else if ( this.responseText.indexOf(";TechnicalRep")>=0 )
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
    req.onload = handler;

    
    var form = new FormData();
    form.append("uname", document.getElementById("uname").value);
    form.append("pswd", document.getElementById("pswd").value);
    req.send(form);
}


