/*
 * This fiel contains function to handle local storage
 *
 * Data Model
 * ==========
 *
 * LocalStore key => "gh_search_text"
 *
 * FORMAT
 *      "gh_search_text" : {
 *          <USER+REPONAME_1> : {
 *               "text_search" : "SEARCH_STRING",
 *               "matches" : [ "FILENAME", "FILENAME" ]
 *          },
 *          <USER+REPONNAME_X>  : {
 *               "text_search" : "SEARCH_STRING",
 *               "matches" : [ "FILENAME", "FILENAME" ]
 *          },
 *
 *      }
 *
 *
 */

// localstore
const EXT_MAIN_KEY    = "gh_text_search";



function create_entry(text_search, matches)
{
    var data = {}

    data["text_search"] = text_search;
    data["matches"] = matches;

    return data;
}



function get_data(key=null)
{

    storage =  JSON.parse(localStorage.getItem(EXT_MAIN_KEY));

    if (storage == undefined)
        return null;

    if (key == null)
        return storage;


    if (storage.hasOwnProperty(key))
        return storage[key];

    return null;
}


function save_data(data, key=null)
{

    if (key == null)
    {
        localStorage.setItem(EXT_MAIN_KEY, JSON.stringify(data));
        return;
    }

    storage =  JSON.parse(localStorage.getItem(EXT_MAIN_KEY));
    storage[key] = data;
    localStorage.setItem(EXT_MAIN_KEY, JSON.stringify(storage));
}


/* remove data from storage */
function clean_data(key=null)
{
    if (key == null)
    {
        data = {};
        save_data(data);
        return;
    }


    data = get_data();
    delete data[key];
    save_data(data, key);

}

function init_storage()
{

    if (localStorage.getItem(EXT_MAIN_KEY) == undefined)
        clean_data();
}

