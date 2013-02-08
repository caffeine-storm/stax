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

function blurOnEnter( elem ) {
    return function( evt ) {
        // Enter is 13
        if( evt.keyCode == 13 ) {
            elem.blur();
        }
    };
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

function doCommitNewStack( rejectThisName, createStackButton ) {
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
            throw( "couldn't parse xml doc!" );
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
}

function findParent( className, elem ) {
    var ret = $(elem).closest( className );
    if( ret.length != 1 ) {
        throw( "Found " + ret.length + " matches in fineParentWithClass!" );
    }
    return ret.get(0);
}

function findChildWithClass( className, elem ) {
    var ret = $(elem).find( className );
    if( ret.length == 0 ) return null;
    if( ret.length == 1 ) return ret.get(0);
    throw( "findChildWithClass: Mulitple children found for '" + className + "'" );
}

function findChildWithClassEx( className, root ) {
    var ret = $(root.childNodes).find( className );
    if( ret.length == 0 ) return null
    if( ret.length == 1 ) return ret.get(0);
    throw( "findChildWithClassEx: Multiple children found for '" + className + "'" );
}

function dropStack( imgElem ) {
    var stackid = $(imgElem).closest( "div.stack-controls" ).attr( "stacknodeid" );
    var ourList = findParent( "ul.stack-list", imgElem );
    var theStackDisplay = $('#stack-display').get(0);

    return function( evt ) {
        var fn = function( req ) {
            theStackDisplay.removeChild( ourList );
        }

        et.phoneHome( "dropstack", {'stackid': stackid}, fn );
    }
}

function popNode( imgElem ) {
    var nodeCtrls = $(imgElem).closest(".leaf-controls");
    var stackid = nodeCtrls.attr("stacknodeid");
    var curLayer = nodeCtrls.closest(".stack-layer");
    var parentLayer = curLayer.parent();

    if( ! parentLayer.hasClass( "stack-layer" ) ) {
        throw( "Error: expecting stack-layer as parent!!!" );
    }

    var fn = function( req ) {
        curLayer.remove();

        // If there are no stack-layer divs under parentLayer, then
        // the li in parentLayer has changed from a stack-node to a stack
        // leaf
        if( parentLayer.children(".stack-layer").length == 0 ) {
            var newLeaf = parentLayer.find(".stack-node");
            if( newLeaf.length == 0 ) {
                // Must've been the last non-base node in the stack
                return;
            }
            newLeaf.attr( "class", "stack-leaf" );
        }
    };

    et.phoneHome( "pop", {'stackid': stackid}, fn );
}

function createStack( target ) {
    var container = $("#stack-display").get(0);

    var fn = function( newstack ) {
        $(newstack).find('.drop-stack-button').click( function() {
            $(newstack).remove();
        });
        $(container).prepend( newstack );
        var inp = $(newstack).find('input');
        var oldValue = inp.get(0).value;
        inp.blur( function() {
            doCommitNewStack( oldValue, target );
        });
        inp.keypress( blurOnEnter( inp ) );
        inp.select();
    };

    make_widget( "newstack.html", {}, "ul", { 'id':'newstack', 'class':'stack-list' }, fn );
}

function newNodeDragStart( evt ) {
    evt.originalEvent.dataTransfer.effectAllowed = "copy";
    evt.originalEvent.dataTransfer.setData( "text/plain", "push-node" );
}

function nodeDragOver( evt ) {
    if( evt.originalEvent.dataTransfer.types.contains( "text/plain" ) ) {
        if( evt.originalEvent.dataTransfer.getData( "text/plain" ) == "push-node" ) {
            evt.preventDefault(); // Mark this as a drop target
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
        leaf = findParent( ".stack-leaf", elem );
    } catch( Exception ) {
        try {
            leaf = findParent( ".stack-node", elem );
        } catch (Exception) {
            try {
                leaf = findParent( ".stack-base", elem );
            } catch(Exception) {
                throw( "couldn't find a target node above " + elem );
            }
        }
    }

    var container = findParent( ".stack-layer", leaf );
    var controls = findChildWithClass( ".leaf-controls", leaf );
    if( controls == null ) {
        controls = findChildWithClass( ".stack-controls", leaf );
    }
    if( controls == null ) {
        throw( "Couldn't find the control panel" );
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
        inp.addEventListener( 'keypress', blurOnEnter( inp ) );
        inp.focus();
    };

    make_widget( "newnodelayer.html", {}, "div", { 'class': 'stack-layer' }, fn );
}

function nodeDrop( evt ) {
    if( evt.originalEvent.dataTransfer.types.contains( "text/plain" ) ) {
        if( evt.originalEvent.dataTransfer.getData( "text/plain" ) == "push-node" ) {
            evt.originalEvent.preventDefault(); // Mark this as a drop target

            doPushNode( evt.target );
        }
    }
}

function getNodeID( nd ) {
    var classname = null;
    if( $(nd).hasClass( "stack-base-text" ) ) {
        classname = '.stack-controls';
    } else if( $(nd).hasClass( "stack-node-text" ) || $(nd).hasClass( "stack-leaf-text" ) ) {
        classname = ".leaf-controls";
    } else {
        throw( "getNodeID couldn't find an appropriate class on 'nd'" );
    }

    var ctrls = $(nd).parent().find( classname ).get(0);
    return ctrls.getAttribute( 'stacknodeid' );
}

function editNodeName( nd ) {
    var oldValue = nd.innerHTML;
    et.serverRender( "editnameinput.html", {'textval':nd.innerHTML}, nd, function( x ) {
        $(nd).off( 'click' );
        var inp = $(nd).find( 'input' ).get(0);
        inp.focus();
        var fn = function(evt) {
            if( inp.value == oldValue ) {
                // Avoid the call back to the server if the name didn't change
                $(nd).html( oldValue );
                $(nd).click( function() {
                    editNodeName( this );
                });
                return;
            }
            et.phoneHome( 'rename', {'stackid': getNodeID( nd ), 'data':inp.value}, function(req) {
                nd.innerHTML = req.responseText;
                $(nd).click(function () {
                    editNodeName( this );
                });
            });
        };
        $(inp).blur( fn );
        $(inp).keypress( blurOnEnter( inp ) );
    });
}

function registerCallbacks( rootNode ) {

    $(rootNode).find(".drop-leaf-button").click(function() {
        popNode( this );
    });

    $(rootNode).find( ".drop-stack-button" ).click(function() {
        dropStack( this )();
    });

    $(rootNode).find( ".create-stack-button" ).click(function() {
        createStack( this );
    });

    $(rootNode).find( ".node-maker" ).on( "dragstart", newNodeDragStart );

    $(rootNode).find( ".stack-leaf, .stack-node, .stack-base" ).on( "dragenter", nodeDragOver );
    $(rootNode).find( ".stack-leaf, .stack-node, .stack-base" ).on( "dragover", nodeDragOver );
    $(rootNode).find( ".stack-leaf, .stack-node, .stack-base" ).on( "drop", nodeDrop );

    $(rootNode).find(".stack-leaf-text, .stack-node-text, .stack-base-text").click(function() {
        editNodeName( this );
    });
}

function onLoad() {
    registerCallbacks( document );
}

document.addEventListener( "DOMContentLoaded", onLoad, false );

