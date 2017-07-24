function locate() 
{
    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(on_locate);
    } else 
    {
        on_fail_to_locate();
    }
}
function on_locate(position) {
    msg = "Latitude: " + position.coords.latitude +
    "\nLongitude: " + position.coords.longitude;

    swal({
        title: "gps info!",
        text: msg,
        type: "info",//"error",
        confirmButtonText: "sawa..."
    });
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

window.onload = function()
{
    locate();
}
