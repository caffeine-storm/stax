// dom manipulation and what not; pip pip
// TODO: helpers for finding-by-stack so element ids don't have all the dashes

function popStack( stackID ) {
    var fn = function( req ) {
        var target = document.getElementById( "target-stack-" + stackID );
        target.innerHTML = req.responseText;
    }
    et.phoneHome( "pop", {id:stackID}, fn );
}

function pushStack( stackID ) {
    // Make a text field
    var inputField = document.createElement( "input" );
    inputField.setAttribute( "type", "textfield" );
    inputField.setAttribute( "id", "new-text-value-" + stackID );

    // TODO: don't use a stash...
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
}

function saveNode( stackID ) {
    // Get the new text
    var newEntry = document.getElementById( "new-text-value-" + stackID ).value;
    if( newEntry.replace( /^\s*/, "" ).replace( /\s*$/, "" ) == "" ) return; // Leave the DOM alone; they misclicked

    var fn = function( req ) {
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

    et.phoneHome( "push", {id:stackID, item:newEntry}, fn );
}

function doDeSelect( itemID, oldVal ) {
    var e = document.getElementById( itemID );
    var d = e.parentNode;
    var textVal = e.value;

    var f = document.createElement( "span" );
    f.setAttribute( "class", "stack-node-text" );
    f.setAttribute( "onclick", "doSelect('" + itemID + "')" );
    f.textContent = textVal;

    d.replaceChild( f, e );
    f.id = e.id;

    // Send AJAX update for node value
    if( textVal != unescape( oldVal ) ) {
        var parts = itemID.split( "-" );
        var nodeOffset = parts.pop();
        var stackID = parts.pop();

        et.phoneHome( "rename", {stackid:stackID, nodeoffset:nodeOffset, data:textVal}, function(req) {} );
    }
}

function doSelect( itemID ) {
    var e = document.getElementById( itemID );
    var d = e.parentNode;
    var textVal = e.textContent;

    var f = document.createElement( "input" );
    f.setAttribute( "type", "textfield" );
    f.setAttribute( "onblur", "doDeSelect('" + itemID + "','" + escape( textVal ) + "')" );
    f.value = textVal;

    d.replaceChild( f, e );
    f.id = e.id;
    f.focus();
}

function make_widget( name, ctx, elem, attrs, cb ) {
    var ret = document.createElement( elem );
    for( var attr in attrs ) {
        if( attrs.hasOwnProperty( attr ) ) {
            ret.setAttribute( attr, attrs[attr] );
        }
    }

    et.serverRender( name, ctx, ret, cb );
}

function commitNewStack() {
    var targ = document.getElementById( "newstack" );
    var targName = targ.getElementsByTagName( "input" )[0].value;

    var fn = function( req ) {
        var xmlDoc = req.responseXML;

        var x = xmlDoc.getElementsByTagName( "stack" )[0];
        var stackid = x.getElementsByTagName( "stackid" )[0].textContent;
        var stackwidth = 'width: ';
        stackwidth += x.getElementsByTagName( "stackwidth" )[0].textContent;
        stackwidth += 'ex;';

        if( stackid == null || stackwidth == null ) {
            alert( "couldn't parse xml doc!" );
            return;
        }

        var fnn = function( newstack ) {
            var sd = targ.parentNode;
            sd.removeChild( targ );
            sd.appendChild( newstack );
        }

        make_widget( "stack.html", {'stackid':stackid}, "ul", { 'id':'target-stack-'+stackid, 'class':'stack-list', 'style':stackwidth }, fnn );
    }

    et.phoneHome( "commitnewstack", {'data':targName}, fn );
}

function doCreateStack() {
    var container = document.getElementById( "stack-display" );

    var fn = function( newstack ) {
        var fc = container.firstChild;
        container.insertBefore( newstack, fc );
        var inp = newstack.getElementsByTagName( 'input' )[0];
        inp.setAttribute( 'onblur', 'commitNewStack()' );
        inp.focus();
    };

	make_widget( "newstack.html", {}, "ul", { 'id':'newstack', 'class':'stack-list', 'style':'width: 25ex' }, fn );
}

function dropStack( stackid ) {
    var targ = document.getElementById( "target-stack-" + stackid );
    var pare = targ.parentNode;

    var fn = function( req ) {
        pare.removeChild( targ );
    }

    et.phoneHome( "dropstack", {'stackid': stackid}, fn );
}
