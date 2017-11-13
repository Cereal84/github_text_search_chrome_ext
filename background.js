/*
 * LocalStore key => "gh_search_text"
 *
 * FORMAT
 *      "gh_search_text" : {
 *          "settings" : {
 *              "background_match" : "COLOR"
 *          },
 *          "text_search" : {
 *              "value" :  "SEARCH_STRING",
 *              "matches" : [ "FILENAME", "FILENAME" ]
 *          }
 *      }
 *
 * */


function init()
{

    // check if background color is stored
    if (window.localStorage.getItem("gh_text_search") === null)
    {
        var data = {};
        // init background color if it not exists
        data["settings"] = {"background_match": "#fff0b3"};
        data["text_search"] = {};
        // TODO add history
        window.localStorage.setItem("gh_text_search" , JSON.stringify(data))

    } else {
        console.log("EXT already initialized");
        console.log(localStorage.getItem("gh_text_search")) ;
    }
}

init();
