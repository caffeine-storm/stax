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

function popNode( divElem ) {
	var stackid = divElem.getAttribute( "stacknodeid" );
	var curLayer = findParentWithClass( "stack-layer", divElem );
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


function onLoad() {
	// Every div with class 'drop-node-controls' needs onClick to invoke popNode
	var divs = document.getElementsByClassName( "drop-leaf-controls" );
	for( var i = 0; i < divs.length; ++i ) {
		var div = divs.item( i );
		div.addEventListener( "click", popNode( div ), false );
	}
}

document.addEventListener( "DOMContentLoaded", onLoad, false );

