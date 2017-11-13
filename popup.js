
window.addEventListener ("load", main, false);


function color_changed(event)
{
    var background_color = event.target.value;

    // TODO store it into settings

}

function main(evt) {

    var match_color = null;

    var storage = JSON.parse(localStorage.getItem("gh_text_search"));

    // check if background color is stored
    if (storage === null)
    {
        console.log("ERR localstorage has not info about this extension");
    } else {

        var settings = storage['settings'];

        // get stored color from settings
        match_color = settings['background_match'];
    }


    color_select = document.getElementById("gh_ext_color");

    color_select.value = match_color;
    color_select.addEventListener("change", color_changed, false);


}


