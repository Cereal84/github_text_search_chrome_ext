
window.addEventListener ("load", main, false);


function color_changed(event)
{
    var background_color = event.target.value;

}

function main(evt) {

    var match_color = "#fff0b3";

    var storage = window.localStorage.getItem("gh_text_search");
    // check if background color is stored
    if (storage !== null)
    {
        var data = storage['settings'];
        // get stored color from settings
        match_color = data["settings"]['background_match'];
    }


    color_select = document.getElementById("gh_ext_color");

    color_select.value = match_color;
    color_select.addEventListener("change", color_changed, false);


}


