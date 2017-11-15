/*
 * LocalStore key => "gh_search_text"
 *
 * FORMAT
 *      "gh_search_text" : {
 *          "text_search" : {
 *              "value" :  "SEARCH_STRING",
 *              "matches" : [ "FILENAME", "FILENAME" ]
 *          }
 *      }
 *
 * */



window.addEventListener ("load", main, false);

// global variable used to loop on focus elements
var current_focus_index = 0;
var total_matches = 0;

function first_focus()
{
    if (total_matches == 0)
        return;

    var id_name = "gh_ext_match_0";

    document.getElementById(id_name).focus();
}


function go_to_prev_focus()
{

    if (total_matches == 0)
        return;

    var tmp_index = current_focus_index - 1;

    if (tmp_index < 0) {
        console.log("lower bound");
        tmp_index = total_matches - 1;
    }

    current_focus_index = tmp_index;

    var id_name = "gh_ext_match_" + current_focus_index;

    document.getElementById(id_name).focus();

}


function go_to_next_focus()
{

    if (total_matches == 0)
        return;

    var tmp_index = current_focus_index + 1;
    if (tmp_index > (total_matches - 1))
        tmp_index = 0;

    current_focus_index = tmp_index;

    var id_name = "gh_ext_match_" + current_focus_index;

    document.getElementById(id_name).focus();

}

function focus_keyUp(e) {

    // (ctrl | command) + arrow_right
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 39)) {
        go_to_next_focus();
    }
    // (ctrl | command) + arrow_left
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 37)) {
        go_to_prev_focus();
    }

}

document.addEventListener('keyup', focus_keyUp, false);

function clean_page()
{
    // clean table_elem
    var table_elem = document.getElementById("ext_matches");
    while (table_elem.hasChildNodes()){
        table_elem.removeChild(table_elem.firstChild);
    }
}


/* remove data from storage */
function clean_data()
{
}

function store_last_search(text_search, matches)
{
    json_data = JSON.parse(localStorage.getItem("gh_text_search"));

    json_data["text_search"] = {"value": text_search, "matches" : matches };
    // TODO add history
    localStorage.setItem("gh_text_search" , JSON.stringify(json_data));
}


function highlight(container, what, match_color) {

    var content = container.innerText;
    if (content == "")
        return;

    var id_name = "gh_ext_match_" + total_matches;
    var  pattern = new RegExp('(' + what + ')','ig');


    // tabindex is still 0 because the focus is handeld by hand
    var new_content = content.replace(pattern, '<span id="' + id_name + '"' +
                   'tabindex="0" style="background:' + match_color +'">$1</span>');
    if (new_content != content )
    {
        container.innerHTML = new_content;
        total_matches++;
    }

}


function search_in_table_file(container, search_for)
{

    // these files have a table
    // class="highlight tab-size js-file-line-container"
    // container is div with itemprop=text

    var match_color = null;

    chrome.runtime.sendMessage({type: "getMatchColor"}, function(response) {

        match_color = response.data;

        table = container.querySelectorAll('[class="highlight tab-size js-file-line-container"]');
        if (table)
        {
            // iterate rows and for each row the cells
            for (var i = 0, row; row = table[0].rows[i]; i++) {

                for (var j = 0, col; col = row.cells[j]; j++) {

                    highlight(col, search_for, match_color);

                }// end cells
            } // end ROWS
        }

        first_focus();

    });
}


function search_and_highlight_text(container, search_for)
{

    var children = container.childNodes;

    if (children.length == 0)
    {
        // search the text
        var content = container;
        if (content.indexOf(search_for) > -1)
        {
            console.log("Match ");
            // TODO TODO TODO
        }
    } else {
        for (i = 0; i < children.length; i++)
            search_and_highlight_text(children[i], search_for);
    }

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

    var ext_data = JSON.parse(localStorage.getItem("gh_text_search"));
    if (ext_data["text_search"] === null)
        return;

    var match_infos = ext_data['text_search'];

    var search_for = match_infos["value"];
    var matches    = match_infos["matches"];

    if (matches.indexOf(current_file) <= -1)
    {
        console.log("This file is not correct one");
        return;
    }
    console.log("You are searching for " + search_for);

    // check which kinfd of file we're talking about (code, markup ecc)
    //itemprop="text"
    var container =  document.querySelectorAll('[itemprop="text"]');
    if (container)
        search_in_table_file(container[0], search_for);
        //search_and_highlight_text(container[0], search_for);
    else
        console.log("something is missing");

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

    } else {
        console.log("not found");
    }
}



function do_search()
{
    var content = document.getElementById("ext_search_bar").value;

    // clean match result table
    clean_page();

    if (content == "")
      return;

    var gh_request = new XMLHttpRequest();
    gh_request.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 422) {
            // console.log("No results");
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

function create_match_container()
{
    var matches_div = document.createElement("div");
    matches_div.setAttribute('class', 'ext_matchs_div');
    matches_div.className += " boxed-group clearfix announce";

    var title_h3 = document.createElement("h3");
    var text = document.createTextNode("Matches");
    title_h3.appendChild(text);

    var file_wrap_div = document.createElement('div');
    file_wrap_div.setAttribute('class', 'file-wrap');

    // create table
    var table_elem = document.createElement("table");
    table_elem.setAttribute('id', 'ext_matches');
    table_elem.className += "files js-navigation-container js-active-navigation-container";

    file_wrap_div.appendChild(table_elem);
    matches_div.appendChild(title_h3);

    matches_div.appendChild(file_wrap_div);
    return matches_div;

}


function keypress_handler(event)
{
    // enter has keyCode = 13, change it if you want to use another button
    if (event.keyCode == 13) {
        do_search();
        return false;
    }
}

function create_ext_search_div(file_nav_node)
{

        var search_div = document.createElement("div");
        search_div.className += "file";

        var container_div = document.createElement("div");
        container_div.setAttribute('id', 'ext_search_container')
        container_div.setAttribute('class', 'file-header');

        var search_label = document.createElement("label");
        var label_text = document.createTextNode("Search for: ");

        var input = document.createElement("input");
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'ext_search_bar');
        input.setAttribute('class', 'form-control');
        input.setAttribute('placeholder', 'Search into code');

        input.addEventListener("keypress", keypress_handler);

        container_div.appendChild(label_text);
        container_div.appendChild(input);

        search_div.appendChild(container_div);
        var file_wrap_div = document.createElement('div');

        // create table
        var table_elem = document.createElement("table");
        table_elem.setAttribute('id', 'ext_matches');
        table_elem.className += "files js-navigation-container js-active-navigation-container";

        file_wrap_div.appendChild(table_elem);

        search_div.appendChild(file_wrap_div);

        file_nav_node.parentNode.insertBefore(search_div, file_nav_node);
        document.getElementById("ext_search_container").style.marginLeft = "auto";
        document.getElementById("ext_search_container").style.marginRight = "auto";

}


function init_content_script()
{
    // check if background color is stored
    if (localStorage.getItem("gh_text_search") === null)
    {
        var data = {};
        // init background color if it not exists
        data["text_search"] = {};

        localStorage.setItem("gh_text_search" , JSON.stringify(data));

    }


}


function main(evt) {

    // check if localStorage
    init_content_script();

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
