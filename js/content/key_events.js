/*
 * This file contains methods to handle key events
 *
 */


// code keys
const RIGHT_ARROW_CODE    = 39;
const LEFT_ARROW_CODE     = 37

function go_to_prev_focus()
{

    if (total_matches == 0)
        return;

    var tmp_index = current_focus_index - 1;

    if (tmp_index < 0) {
        tmp_index = total_matches - 1;
    }

    current_focus_index = tmp_index;

    var id_name = ID_MATCH_BASE + current_focus_index;

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

    var id_name = ID_MATCH_BASE + current_focus_index;

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
        if (e.shiftKey && (e.which == RIGHT_ARROW_CODE )) {
            go_to_next_focus();
        }
        if (e.shiftKey && (e.which == LEFT_ARROW_CODE )) {
            go_to_prev_focus();
        }

    } else {

        if (e.ctrlKey && (e.keyCode == RIGHT_ARROW_CODE )) {
            go_to_next_focus();
        }
        if (e.ctrlKey && (e.keyCode == LEFT_ARROW_CODE )) {
            go_to_prev_focus();
        }

    }

}

