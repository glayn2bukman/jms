
function check_known_client(){
    document.getElementById("known_client").checked = true;
}
function check_new_client(){
    document.getElementById("new_client").checked = true;
}

window.onload = function()
                {
                    document.getElementById("known_client_label").onclick = check_known_client;
                    document.getElementById("new_client_label").onclick = check_new_client;

                    var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1; //&& ua.indexOf("mobile");
                    if(isAndroid) {
                        document.write('<meta name=\"viewport\" content=\"width=device-width,height='+window.innerHeight+', initial-scale=1.0\">');
                    }
                };
