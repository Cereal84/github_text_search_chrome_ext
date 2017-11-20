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
var match_color = null;


function first_focus()
{
    if (total_matches == 0)
        return;

    var id_name = "gh_ext_match_0";

    document.getElementById(id_name).focus();
}


function update_focus_infos()
{

    var span_infos = document.getElementById("focus_infos");
    var text = "[" + (current_focus_index + 1 ) + "/" + total_matches + "]";
    span_infos.innerHTML = text;
}

function go_to_prev_focus()
{

    if (total_matches == 0)
        return;

    var tmp_index = current_focus_index - 1;

    if (tmp_index < 0) {
        tmp_index = total_matches - 1;
    }

    current_focus_index = tmp_index;

    var id_name = "gh_ext_match_" + current_focus_index;

    document.getElementById(id_name).focus();
    update_focus_infos();
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
    update_focus_infos();

}

function focus_keyUp(e) {

    /*  MAC:
     *
     *  Next  shift + arrow right
     *  Prev  shift + arrow left
     *
     *  Othres:
     *
     *  Next  ctrl + arrow right
     *  Prev  ctrl + arrow left
     *
     * */
    if (navigator.appVersion.indexOf("Mac")!=-1)
    {

        // on MAC we're using shift instead of ctrl
        if (e.shiftKey && (e.which == 39)) {
            go_to_next_focus();
        }
        if (e.shiftKey && (e.wchich == 37)) {
            go_to_prev_focus();
        }

    } else {

        if (e.ctrlKey && (e.keyCode == 39)) {
            go_to_next_focus();
        }
        if (e.ctrlKey && (e.keyCode == 37)) {
            go_to_prev_focus();
        }

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

    // check if background color is stored
    if (localStorage.getItem("gh_text_search"))
    {
        var data = {};
        // init background color if it not exists
        data["text_search"] = {};

        localStorage.setItem("gh_text_search" , JSON.stringify(data));

    }



}

function store_last_search(text_search, matches)
{
    json_data = JSON.parse(localStorage.getItem("gh_text_search"));

    json_data["text_search"] = {"value": text_search, "matches" : matches };
    // TODO add history
    localStorage.setItem("gh_text_search" , JSON.stringify(json_data));
}


function replace_match(match, p1)
{


    // TODO check if the match is inside a tag, in that case ignore it

    var id_name = "gh_ext_match_" + total_matches;

    new_value = '<span id="' + id_name + '"' +
                   'tabindex="0" style="background:' + match_color +'">'+p1+'</span>';

    // update total matches
    total_matches++;

    return new_value;
}


function highlight(container, what) {

    if (container == undefined)
        return;


    // TODO ISSUE: using innerHTML it do replace even inside HTML tags
    // corrupting the tag

    var content = container.innerHTML;

    if ((content == "") || (content == undefined))
        return;

    var id_name = "gh_ext_match_" + total_matches;

    // BLACK (RegExp) MAGIC
    // (?!([^<])*?>) avoid to have match inside HTML tags
    var  pattern = new RegExp('(' + what + ')(?!([^<])*?>)','ig');

    var new_content = content.replace(pattern, replace_match);

    if (new_content != content )
    {
        container.innerHTML = new_content;
    }

}


function create_match_div()
{
    // its position is to bottom right of the window
    var panel = document.createElement("div");
    panel.setAttribute('id', 'gh_match_next_prev');
    //panel.setAttribute('class', 'panel panel-default');
    panel.style.bottom = "40px";
    panel.style.right = "50px";
    panel.style.zIndex = "999";
    panel.style.position = "fixed";
    panel.style.border = "2px solid #c8e1ff";

    var panel_body = document.createElement("div");
    panel_body.style.margin = "3px";
    // button PREV
    var button_prev = document.createElement("button");
    var prev_text = document.createTextNode("Prev");
    button_prev.appendChild(prev_text);
    button_prev.onclick = go_to_prev_focus;

    // button NEXT
    var button_next = document.createElement("button");
    var next_text = document.createTextNode("Next");
    button_next.appendChild(next_text);
    button_next.onclick = go_to_next_focus;

    // info about focused match / total_matches
    var focus_match_infos = document.createElement("span");
    focus_match_infos.setAttribute("id", "focus_infos");
    focus_match_infos.innerHTML = "[1/" + total_matches + "]";
    focus_match_infos.style.marginLeft = "2px";

    panel_body.appendChild(button_prev);
    panel_body.appendChild(button_next);
    panel_body.appendChild(focus_match_infos);

    panel.appendChild(panel_body);


    document.body.appendChild(panel);
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

    console.log(container);
    console.log(" has child n ");
    console.log(children.length);
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

    var ext_data = JSON.parse(localStorage.getItem("gh_text_search"));
    if (ext_data["text_search"] === null)
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

        if(document.querySelector('[class="markdown-body entry-content"]'))
        {
            console.log("search in ARTICLE");
            search_in_article_file(container[0], search_for);
        }
        else
        {
           search_in_table_file(container[0], search_for);
        }

    }
        //search_and_highlight_text(container[0], search_for);

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
    var content = document.getElementById("ext_search_bar").value;
    var span_info = document.getElementById("gh_match_infos");

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

function get_last_search()
{
    var result = "";

    if (localStorage.getItem("gh_text_search") === null)
    {
        return result;
    }

    var data = JSON.parse(localStorage.getItem("gh_text_search"));

    if (data["text_search"])
    {
        var text_search = data["text_search"];
        if (text_search["value"])
            result = text_search["value"];
    }

    return result;

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

        // span with searching info list "start"/"end"
        var span_info = document.createElement("span");
        span_info.setAttribute('id', 'gh_match_infos');
        span_info.style.marginLeft = "5px";

        container_div.appendChild(label_text);
        container_div.appendChild(input);
        container_div.appendChild(span_info);

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

        var last_search = get_last_search();

        if ((last_search == "") || (last_search == undefined))
            return;

        // write value on input
        document.getElementById("ext_search_bar").value = last_search;
        // redo search
        do_search();
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
