
function deactivate_results_buttons()
{
    var results_btns = ["save_results", "email_results"];
    for (var i=0; i<results_btns.length; i++)
    {
        document.getElementById(results_btns[i]).disabled = true;
        document.getElementById(results_btns[i]).style.color = "#555555";
    }
}

function activate_results_buttons()
{
    var results_btns = ["save_results", "email_results"];
    for (var i=0; i<results_btns.length; i++)
    {
        document.getElementById(results_btns[i]).disabled = false;
        document.getElementById(results_btns[i]).style.color = "#ffffff";
    }
}

window.onload = function() 
{
    // edit options ...
    var edit_options = ["Promotional Items", "Client Segments", "Training Topics", "Email Recepients"];

    for (var i=0; i<edit_options.length; i++)
    {
        var option = document.createElement("option");
        option.value = edit_options[i];
        option.innerHTML = edit_options[i];
        document.getElementById("edit_options").appendChild(option);
    }

    // search categories ...
    var search_categories = ["Reports","Clients Visited", 
                            "New Clients","Products Promoted",
                            "Debts Collected","Topics Taught",
                            "Field Agents","Client Segments","Orders"];
    search_categories.sort();

    for (var i=0; i<search_categories.length; i++)
    {
        var option = document.createElement("option");
        option.value = search_categories[i];
        option.innerHTML = search_categories[i];
        document.getElementById("search_category").appendChild(option);
    }


    // search duration ...
    var search_duration = ["Today", "Past Week", "Past Month", "Other"];

    for (var i=0; i<search_duration.length; i++)
    {
        var option = document.createElement("option");
        option.value = search_duration[i];
        option.innerHTML = search_duration[i];
        document.getElementById("search_duration").appendChild(option);
    }

        

    // deactivate "results" buttons ...
    deactivate_results_buttons();

}




