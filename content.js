/*
 * LocalStore key => "gh_search_text"
 *
 * FORMAT
 *      "gh_search_text" : {
 *          <USER+REPONAME_1> : {
 *               "text_search" : "SEARCH_STRING",
 *               "matches" : [ "FILENAME", "FILENAME" ]
 *          },
            <USER+REPONNAME_X>  : {
 *               "text_search" : "SEARCH_STRING",
 *               "matches" : [ "FILENAME", "FILENAME" ]
 *          },

 *      }
 *
 * */



window.addEventListener ("load", main, false);

// add event keyUp
document.addEventListener('keyup', focus_keyUp, false);

// global variable used to loop on focus elements
var current_focus_index = 0;
var total_matches       = 0;
var match_color         = null;


const ID_MATCH_BASE     = 'gh_ext_match_';

function first_focus()
{
    if (total_matches == 0)
        return;

    var id_name = ID_MATCH_BASE + "0";

    document.getElementById(id_name).focus();
}


function clean_page()
{
    // clean table_elem
    var table_elem = document.getElementById( ID_EXT_MATCHES );
    while (table_elem.hasChildNodes()){
        table_elem.removeChild(table_elem.firstChild);
    }
}


function store_last_search(text_search, matches)
{

    var data = create_entry(text_search, matches);
    save_data(data);

    // key is username + reponame
    var path_name = window.location.pathname;
    var items = path_name.split("/");


    var key = items[0] + "/" + items[1];
    save_data(key, data);

}

function store_last_search(text_search, matches)
{
    data = get_data();

    console.log(data);
    data["text_search"] = {"value": text_search, "matches" : matches };
    // TODO add history

    save_data(data);
}


function replace_match(match, p1)
{

    var id_name = ID_MATCH_BASE + total_matches;

    new_value = create_highlight_wrapper(id_name, match_color, p1);

    // update total matches
    total_matches++;

    return new_value;
}


function highlight(container, what) {

    if (container == undefined)
        return;


    var content = container.innerHTML;

    if ((content == "") || (content == undefined))
        return;

    // BLACK (RegExp) MAGIC
    // (?!([^<])*?>) avoid to have match inside HTML tags
    var  pattern = new RegExp('(' + what + ')(?!([^<])*?>)','ig');

    var new_content = content.replace(pattern, replace_match);

    if (new_content != content )
        container.innerHTML = new_content;

}

function search_in_table_file(container, search_for)
{

    // these files have a table
    // class="highlight tab-size js-file-line-container"
    // container is div with itemprop=text

    chrome.runtime.sendMessage({type: "getMatchColor"}, function(response) {

        match_color = response.data;

        table = container.querySelectorAll('[class="highlight tab-size js-file-line-container"]');
        if (table)
        {
            // iterate rows and for each row the cells
            for (var i = 0, row; row = table[0].rows[i]; i++) {

                for (var j = 0, col; col = row.cells[j]; j++) {

                    highlight(col, search_for);

                }// end cells
            } // end ROWS
        }

        first_focus();
        create_match_div();
    });
}




function search_and_highlight_text(container, search_for)
{

    // ignore every node whis isn't an element node
    if (container.nodeType != Node.ELEMENT_NODE)
    {
        console.log("I'm not a node element");
        return;
    }
    var children = container.childNodes;

    if (children.length == 0)
    {
        // search the text
        console.log("HIGHLIGHT");
        highlight(container, search_for);
        return;
    } else {
        for (i = 0; i < 2; i++)
        {
            if (children[i] == undefined)
                continue;
            search_and_highlight_text(children[i], search_for);
        }
    }

}


function search_in_article_file(container, search_for)
{
    // these files have a table
    // class="highlight tab-size js-file-line-container"
    // container is div with itemprop=text

    chrome.runtime.sendMessage({type: "getMatchColor"}, function(response) {

        match_color = response.data;

        article = document.querySelector('[class="markdown-body entry-content"]');
        if (article)
        {
            highlight(article, search_for);
        }

        first_focus();
        create_match_div();
    });

}



function highlight_matches_on_current_file()
{
    // get current location/path
    var window_path = window.location.pathname;

    // TODO must be changed, this is a work around
    // split using 'master', the second item is  the real path + filename
    var tmp = window_path.split('master');

    // remove '/'
    var current_file = tmp[1].substring(1);

    var ext_data = get_data();

    if (ext_data === null)
        return;

    var match_infos = ext_data['text_search'];

    var search_for = match_infos["value"];
    var matches    = match_infos["matches"];

    if (matches.indexOf(current_file) <= -1)
    {
        console.log("This file is not a correct one");
        return;
    }

    // check which kinfd of file we're talking about (code, markup ecc)
    //itemprop="text"
    var container =  document.querySelectorAll('[itemprop="text"]');
    if (container) {

        if (document.querySelector('[class="markdown-body entry-content"]'))
        {
            search_in_article_file(container[0], search_for);
        }
        else
        {
           search_in_table_file(container[0], search_for);
        }

    }
}


function show_matches(matches)
{

    var table_elem = document.getElementById("ext_matches");
    if (table_elem != null)
    {
         for (i = 0; i < matches.length; i++)
         {
            var row_elem = table_elem.insertRow(i);
            row_elem.className += "js-navigation-item";

            var text_elem = document.createTextNode(matches[i]);
            var a_elem = document.createElement("a");
            a_elem.appendChild(text_elem);
            a_elem.style.marginLeft =  '10px';


            var path_name = window.location.pathname;
            var items = path_name.split("/");
            var href_value = items[2]+'/blob/master/'+matches[i];
            a_elem.setAttribute('href', href_value);

            row_elem.appendChild(a_elem);
         }

    }
}



function do_search()
{
    var content = document.getElementById(ID_EXT_SEARCH_BAR).value;
    var span_info = document.getElementById(ID_GH_MATCH_INFOS);

    // clean match result table
    clean_page();

    if (content == "")
    {
        clean_data();
        span_info.innerHTML = "";
        return;
    }

    // SHOW Searching....
    span_info.innerHTML = "Searching....";

    var gh_request = new XMLHttpRequest();
    gh_request.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 422) {
			return;
        }

        if (this.readyState == 4 && this.status == 200) {

            var data_json =  eval("(" + this.responseText + ")");

            var elements = document.getElementsByClassName("js-navigation-open");

            var matches = [];

            for (i = 0; i < data_json["total_count"]; i++)
            {
                var tmp = data_json["items"][i]["path"];
                matches.push(data_json["items"][i]["path"]);
            }

            // SHOW Matches Found: X
            //var span_info = document.getElementById("gh_match_infos");
            span_info.innerHTML = "Matches found: " + matches.length;
            store_last_search(content, matches);
            show_matches(matches);
        }
    };

    var path_name = window.location.pathname;
    var items = path_name.split("/");

    var url_query ='https://api.github.com/search/code?q=' + content;
    url_query += "+in:file+repo:"+items[1]+"/"+items[2];

    gh_request.open("GET", url_query, true);
    gh_request.send();

}

function search_bar_keypress(event)
{
    // enter has keyCode = 13, change it if you want to use another button
    if (event.keyCode == 13) {

       do_search();
       return false;
    }
}

function get_last_search()
{
    var result = "";


    data = get_data();

    if (data === null)
    {
        return result;
    }

    if (data["text_search"])
    {
        var text_search = data["text_search"];
        if (text_search["value"])
            result = text_search["value"];
    }

    return result;

}





function main(evt) {

    // check if localStorage
    init_storage();

    var file_nav = document.getElementsByClassName("commit-tease");
    if (file_nav)
    {

        var file_div = document.getElementsByClassName("file");

		// if exists element with class file probably we're in a page
		// with content file, so do no show the search bar
        if (file_div.length > 0)
        {
            // do not show search bar
            // but try to highlight the matches
            highlight_matches_on_current_file();
            return;
        }
        create_ext_search_div(file_nav[0]);
    }

}
