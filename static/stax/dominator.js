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

function doCommitNewStack( rejectThisName, createStackButton ) { return function( evt ) {
    var targ = document.getElementById( "newstack" );
    var targName = targ.getElementsByTagName( "input" )[0].value;

    if( util.wsTrim( targName ) == rejectThisName ) {
        return;
    }

    var fn = function( req ) {
        var xmlDoc = req.responseXML;

        var x = xmlDoc.getElementsByTagName( "stack" )[0];
        var stackid = x.getElementsByTagName( "stackid" )[0].textContent;

        if( stackid == null ) {
            alert( "couldn't parse xml doc!" );
            return;
        }

        var fnn = function( newstack ) {
            var sd = targ.parentNode;
            sd.removeChild( targ );

            // TODO: once the create stack button is getting disabled, re-enable it here

            sd.appendChild( newstack );
            registerCallbacks( newstack );
        }

        make_widget( "stack.html", {'stackid':stackid}, "ul", { 'id':'target-stack-'+stackid, 'class':'stack-list' }, fnn );
    }

    et.phoneHome( "createstack", {'name':targName}, fn );
}}

function findParentWithClass( className, elem ) {
	var itr = elem;

	while( true ) {
		if( itr == null || itr == document ) {
			throw new Error("Couldn't find elem with class '" + className + "'" );
		}

		if( itr.getAttribute( "class" ) == className ) {
			return itr;
		}

		itr = itr.parentNode;
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

function findChildWithClassEx( className, root ) {
    var children = root.childNodes;

    for( var i = 0; i < children.length; ++i ) {
        var c = children.item( i );
        var ret = findChildWithClass( className, c );
        if( ret != null ) return ret;
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

            // If there are no stack-layer divs under parentLayer, then
            // the li in parentLayer has changed from a stack-node to a stack
            // leaf
            if( findChildWithClassEx( "stack-layer", parentLayer ) == null ) {
                var newLeaf = findChildWithClass( "stack-node", parentLayer );
                if( newLeaf == null ) {
                    // Must've been the last non-base node in the stack
                    return;
                }
                newLeaf.setAttribute( "class", "stack-leaf" );
            }
		};

		et.phoneHome( "pop", {'stackid': stackid}, fn );
	};
}

function createStack( evt ) {
    // TODO: Disable the create stack button

    var container = document.getElementById( "stack-display" );

    var fn = function( newstack ) {
        var fc = container.firstChild;
        container.insertBefore( newstack, fc );
        var inp = newstack.getElementsByTagName( 'input' )[0];
        inp.addEventListener( 'blur', doCommitNewStack( inp.value, evt.target ) );
        inp.focus();
    };

    make_widget( "newstack.html", {}, "ul", { 'id':'newstack', 'class':'stack-list' }, fn );
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

function commitNewNode( parentId, getText, layer ) {
    var txt = getText();

    function isValidNodeName( txt ) {
        return util.wsTrim( txt ).length != 0;
    }
    
    if( ! isValidNodeName( txt ) ) {
        return;
    }

    function cleanUp( req ) {
        // Re-render the inside of layer
        layer.innerHTML = req.responseText;

        // Attach listeners that are expected
        registerCallbacks( layer );
    }

    et.phoneHome( "pushandrender",  { "id": parentId, "item": txt }, cleanUp );
}

function doPushNode( elem ) {
    var leaf = null;
    try {
        leaf = findParentWithClass( "stack-leaf", elem );
    } catch( Exception ) {
        try {
            leaf = findParentWithClass( "stack-node", elem );
        } catch (Exception) {
            try {
                leaf = findParentWithClass( "stack-base", elem );
            } catch(Exception) {
                throw new Error( "couldn't find a target node above " + elem );
            }
        }
    }
    

    var container = findParentWithClass( "stack-layer", leaf );
    var controls = findChildWithClass( "leaf-controls", leaf );
    if( controls == null ) {
        controls = findChildWithClass( "stack-controls", leaf );
    }   
    if( controls == null ) {
        throw new Error( "Couldn't find the control panel" );
    }
    var stackid = controls.getAttribute( "stacknodeid" );

    var fn = function( newlayer ) {
        // Insert the new layer just before the last child element (ie leaf)
        container.insertBefore( newlayer, leaf );
        var inp = newlayer.getElementsByTagName( 'input' )[0];

        // If the parent was a leaf, it isn't anymore...
        if( leaf.getAttribute( "class" ) == "stack-leaf" ) {
            leaf.setAttribute( "class", "stack-node" );
        }

        function getText() {
            return inp.value;
        }

        inp.addEventListener( 'blur', function(evt){ commitNewNode( stackid, getText, newlayer ); }, false );
        inp.focus();
    };
    
    make_widget( "newnodelayer.html", {}, "div", { 'class': 'stack-layer' }, fn );
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

function registerCallbacks( rootNode ) {
	// Every element with class 'drop-node-button' needs onClick to invoke popNode
	var elems = rootNode.getElementsByClassName( "drop-leaf-button" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "click", popNode( elem ), false );
	}

	elems = rootNode.getElementsByClassName( "drop-stack-button" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "click", dropStack( elem ), false );
	}

	elems = rootNode.getElementsByClassName( "create-stack-button" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "click", createStack, false );
	}

	elems = rootNode.getElementsByClassName( "node-maker" );
	for( var i = 0; i < elems.length; ++i ) {
		var elem = elems.item( i );
		elem.addEventListener( "dragstart", newNodeDragStart, false );
	}

    elems = rootNode.getElementsByClassName( "stack-leaf" );
    for( var i = 0; i < elems.length; ++i ) {
        var elem = elems.item( i );
        elem.addEventListener( "dragenter", nodeDragOver( elem ), false );
        elem.addEventListener( "dragover", nodeDragOver( elem ), false );
        elem.addEventListener( "drop", nodeDrop( elem ), false );
    }

    elems = rootNode.getElementsByClassName( "stack-node" );
    for( var i = 0; i < elems.length; ++i ) {
        var elem = elems.item( i );
        elem.addEventListener( "dragenter", nodeDragOver( elem ), false );
        elem.addEventListener( "dragover", nodeDragOver( elem ), false );
        elem.addEventListener( "drop", nodeDrop( elem ), false );
    }

    elems = rootNode.getElementsByClassName( "stack-base" );
    for( var i = 0; i < elems.length; ++i ) {
        var elem = elems.item( i );
        elem.addEventListener( "dragenter", nodeDragOver( elem ), false );
        elem.addEventListener( "dragover", nodeDragOver( elem ), false );
        elem.addEventListener( "drop", nodeDrop( elem ), false );
    }
}

function onLoad() {
    registerCallbacks( document );
}

document.addEventListener( "DOMContentLoaded", onLoad, false );

