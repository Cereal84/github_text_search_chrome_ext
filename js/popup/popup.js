
window.addEventListener ("load", main, false);


function color_changed(event)
{
    var background_color = event.target.value;

    var storage = JSON.parse(localStorage.getItem("gh_text_search"));
    var settings = storage['settings'];
    settings['background_match'] = background_color;

    localStorage.setItem("gh_text_search" , JSON.stringify(storage));


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


    settings_select = document.getElementById("gh_text_search");

    settings_select.addEventListener("click", clean_data, false)
}


