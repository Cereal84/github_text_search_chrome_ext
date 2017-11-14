/*
 * LocalStore key => "gh_search_text"
 *
 * FORMAT
 *      "gh_search_text" : {
 *          "settings" : {
 *              "background_match" : "COLOR"
 *          }
 *      }
 *
 * */

// message passing in order to communicate data extensions and content.js
chrome.runtime.onMessage.addListener(

    /*
     * Message format
     *
     *  type,    is the function that I wanit
     *  data,    contains resposne data or request data
     */

    function(message, sender, sendResponse) {
        switch(message.type) {
            case "getMatchColor":

                // get match color from  localStorage
                var storage = JSON.parse(localStorage.getItem("gh_text_search"));
                var settings = storage['settings'];
                // get stored color from settings
                match_color = settings['background_match'];

                response = {'type': message.type, 'data': match_color};
                sendResponse(response);
                break;

            default:
                console.error("Unrecognised message: ", message);
        }
    }
);


function init()
{

    localStorage.removeItem("gh_text_search");

    // check if background color is stored
    if (localStorage.getItem("gh_text_search") === null)
    {
        var data = {};
        // init background color if it not exists
        data["settings"] = {"background_match": "#fff0b3"};

        localStorage.setItem("gh_text_search" , JSON.stringify(data));



    } else {
        console.log("EXT already initialized");
    }
}

init();
