function wsTrim(str) {
    return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = wsTrim( cookies[i] );
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function popStack( stackID ) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if( req.readyState == 4 && req.status == 200 ) {
            // The request body is the new HTML to shove into
            // the <ul> tag...
            target = document.getElementById( "target-stack-" + stackID );
            target.innerHTML = req.responseText;
        }
        // TODO: signal error
    };
    req.open( "POST", "/stax/api/pop", true );
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    req.send( "id=" + stackID );
}

function saveNode( stackID ) {
    // Get the new text
    var newEntry = document.getElementById( "new-text-value-" + stackID ).value;

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if( req.readyState == 4 && req.status == 200 ) {
            // Include a new hidden-stash for the stack
            var oldStash = document.getElementById( "new-node-" + stackID );
            oldStash.removeAttribute( "id" );
            var newStash = document.createElement( "li" );
            newStash.setAttribute( "class", "stack-node" );
            newStash.setAttribute( "id", "new-node-" + stackID );
            newStash.style.visibility = "hidden";
            var st = document.getElementById( "target-stack-" + stackID );
            st.insertBefore( newStash, oldStash );

            // Reset the push/submit button
            var bt = document.getElementById( "push-button-" + stackID );
            bt.textContent = "push";
            bt.setAttribute( "onclick", "pushStack(" + stackID + ")" );

            // Change the textfield to just display the text
            var tfield = document.getElementById( "new-text-value-" + stackID );
            var data = tfield.value;
            var targ = tfield.parentNode;
            var dataSpan = document.createElement( "span" );
            dataSpan.setAttribute( "class", "stack-node-text" );
            dataSpan.textContent = data;
            targ.replaceChild( dataSpan, tfield );
        }
        // TODO: signal error
    }
    req.open( "POST", "/stax/api/push", true );
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    req.send( "id=" + stackID + "&item=" + newEntry ) // TODO: escape 'newEntry'
}

function pushStack( stackID ) {
    // Make a text field
    var inputField = document.createElement( "input" );
    inputField.setAttribute( "type", "textfield" );
    inputField.setAttribute( "id", "new-text-value-" + stackID );

    // Show the 'new-node-{{id}}' stash
    var newNode = document.getElementById( "new-node-" + stackID );
    newNode.style.visibility = "visible";
    newNode.appendChild( inputField );

    // Select the text field we just added
    inputField.focus();

    // Switch the 'push' button to 'submit'/'save'/whatever
    var pushButton = document.getElementById( "push-button-" + stackID );
    pushButton.innerHTML = "submit";
    pushButton.setAttribute( "onclick", "saveNode( " + stackID + " )" );

    // TODO: select the input field so ppl can just start typing...
}
