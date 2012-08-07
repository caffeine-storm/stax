// dom manipulation
// TODO: helpers for finding-by-stack so element ids don't have all the dashes

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

    et.phoneHome( "createstack", {'name':targName}, fn );
}

function findParentWithClass( className, elem ) {
	var itr = elem;

	while( true ) {
		itr = itr.parentNode;

		if( itr == null || itr == document ) {
			throw new Error("Couldn't find elem with class '" + className + "'" );
		}

		if( itr.getAttribute( "class" ) == className ) {
			return itr;
		}
	}
}

function findChildWithClass( className, elem ) {
    if( elem.nodeType != Node.ELEMENT_NODE ) return null;
    if( elem.getAttribute( "class" ) == className ) {
        return elem;
    }
    var children = elem.childNodes;
    for( var i = 0; i < children.length; ++i ) {
        var c = children.item( i );
        var x = findChildWithClass( className, c );
        if( x != null ) return x;
    }

    return null;
}

function dropStack( imgElem ) {
	var targ = findParentWithClass( "stack-controls", imgElem );
	var stackid = targ.getAttribute( "stacknodeid" );
	var ourList = findParentWithClass( "stack-list", targ );
	var theStackDisplay = ourList.parentNode;

	if( theStackDisplay != document.getElementById( "stack-display" ) ) {
		alert( "Tried to (generate a) drop stack that was not a grand-child of the stack-display" );
		return function(x){}
	}

	return function( evt ) {

		var fn = function( req ) {
			theStackDisplay.removeChild( ourList );
		}

		et.phoneHome( "dropstack", {'stackid': stackid}, fn );
	}
}

function popNode( imgElem ) {
	var nodeCtrls = findParentWithClass( "leaf-controls", imgElem );
	var stackid = nodeCtrls.getAttribute( "stacknodeid" );
	var curLayer = findParentWithClass( "stack-layer", nodeCtrls );
	var parentLayer = curLayer.parentNode;

	if( parentLayer.getAttribute( "class" ) != "stack-layer" ) {
		alert( "Error: expecting stack-layer as parent!!!" );
		return function(x){};
	}

	return function( evt ) {
		var fn = function( req ) {
			parentLayer.removeChild( curLayer );
		};

		et.phoneHome( "pop", {'stackid': stackid}, fn );
	};
}

function createStack( evt ) {
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

function newNodeDragStart( evt ) {
    evt.dataTransfer.effectAllowed = "copy";
    evt.dataTransfer.setData( "text/plain", "push-node" );
}

function nodeDragOver( nd ) {
    return function( evt ) {
        if( evt.dataTransfer.types.contains( "text/plain" ) ) {
            if( evt.dataTransfer.getData( "text/plain" ) == "push-node" ) {
                evt.preventDefault(); // Mark this as a drop target
            }
        }
    }
}

function doPushNode( elem ) {
    var leaf = findParentWithClass( "stack-leaf", elem );
    var controls = findChildWithClass( "leaf-controls", leaf );
    var stackid = controls.getAttribute( "stacknodeid" );
    
    
}

function nodeDrop( nd ) {
    return function( evt ) {
        if( evt.dataTransfer.types.contains( "text/plain" ) ) {
            if( evt.dataTransfer.getData( "text/plain" ) == "push-node" ) {
                evt.preventDefault(); // Mark this as a drop target

                doPushNode( evt.target );
            }
        }
    }
}

function onLoad() {
	// Every element with class 'drop-node-button' needs onClick to invoke popNode
	var elems = document.getElementsByClassName( "drop-leaf-button" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "click", popNode( elem ), false );
	}

	elems = document.getElementsByClassName( "drop-stack-button" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "click", dropStack( elem ), false );
	}

	elems = document.getElementsByClassName( "create-stack-button" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "click", createStack, false );
	}

	elems = document.getElementsByClassName( "node-maker" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "dragstart", newNodeDragStart, false );
	}

    elems = document.getElementsByClassName( "stack-leaf" );
    for( var i = 0; i < elems.length; ++i ) {
        var elem = elems.item( i );
        elem.addEventListener( "dragenter", nodeDragOver( elem ), false );
        elem.addEventListener( "dragover", nodeDragOver( elem ), false );
        elem.addEventListener( "drop", nodeDrop( elem ), false );
    }
}

document.addEventListener( "DOMContentLoaded", onLoad, false );

