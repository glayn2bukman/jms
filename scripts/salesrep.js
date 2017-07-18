
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
                };
