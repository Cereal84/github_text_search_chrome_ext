/*
 * This file contains methods which construct HTML element
 * and change the page layout
 *
*/

const ID_PANEL = 'gh_match_next_prev';
const ID_FOCUS_INFO = 'focus_infos';
const ID_EXT_MATCHES = 'ext_matches';
const ID_EXT_SEARCH_CONTAINER = 'ext_search_container';
const ID_EXT_SEARCH_BAR = 'ext_search_bar';
const ID_GH_MATCH_INFOS = 'gh_match_infos';


function create_highlight_wrapper(id_name, background_color, text)
{
    var html = '<span id="' + id_name + '"' +
               'tabindex="0" style="background:' + background_color + '">' +
                text + '</span>';

    return html;

}


// update the current focus number
function update_focus_infos()
{
    var span_infos = document.getElementById( ID_FOCUS_INFO );
    var text = "[" + (current_focus_index + 1 ) + "/" + total_matches + "]";
    span_infos.innerHTML = text;
}



/* panel which contains button Next/Prev and Match counter */
function create_match_div()
{
    // its position is to bottom right of the window
    var panel = document.createElement("div");
    panel.setAttribute('id', ID_PANEL);
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
    focus_match_infos.setAttribute("id", ID_FOCUS_INFO);
    focus_match_infos.innerHTML = "[1/" + total_matches + "]";
    focus_match_infos.style.marginLeft = "2px";

    panel_body.appendChild(button_prev);
    panel_body.appendChild(button_next);
    panel_body.appendChild(focus_match_infos);

    panel.appendChild(panel_body);
    document.body.appendChild(panel);
}



// create the panel with match files listed
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
    table_elem.setAttribute('id', ID_EXT_MATCHES);
    table_elem.className += "files js-navigation-container js-active-navigation-container";

    file_wrap_div.appendChild(table_elem);
    matches_div.appendChild(title_h3);

    matches_div.appendChild(file_wrap_div);
    return matches_div;

}



// contains the div with the search basr
function create_ext_search_div(file_nav_node)
{

        var search_div = document.createElement("div");
        search_div.className += "file";

        var container_div = document.createElement("div");
        container_div.setAttribute('id', ID_EXT_SEARCH_CONTAINER);
        container_div.setAttribute('class', 'file-header');
        container_div.style.marginLeft = "auto";
        container_div.style.marginRight = "auto";


        var search_label = document.createElement("label");
        var label_text = document.createTextNode("Search for: ");

        var input = document.createElement("input");
        input.setAttribute('type', 'text');
        input.setAttribute('id', ID_EXT_SEARCH_BAR);
        input.setAttribute('class', 'form-control');
        input.setAttribute('placeholder', 'Search into code');

        input.addEventListener("keypress", search_bar_keypress);

        // span with searching info list "start"/"end"
        var span_info = document.createElement("span");
        span_info.setAttribute('id', ID_GH_MATCH_INFOS);
        span_info.style.marginLeft = "5px";

        container_div.appendChild(label_text);
        container_div.appendChild(input);
        container_div.appendChild(span_info);

        search_div.appendChild(container_div);
        var file_wrap_div = document.createElement('div');

        // create table
        var table_elem = document.createElement("table");
        table_elem.setAttribute('id', ID_EXT_MATCHES);
        table_elem.className += "files js-navigation-container js-active-navigation-container";

        file_wrap_div.appendChild(table_elem);

        search_div.appendChild(file_wrap_div);

        file_nav_node.parentNode.insertBefore(search_div, file_nav_node);
        var last_search = get_last_search();

        if ((last_search == "") || (last_search == undefined))
            return;

        // write value on input
        document.getElementById(ID_EXT_SEARCH_BAR).value = last_search;
        // redo search
        do_search();
}



