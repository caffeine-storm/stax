// E.T. phone home

var etprivate = {
    // ctx is a map of arg-name to arg-val
    body_encode_args : function( ctx ) {
        ret = [];
        for( var nm in ctx ) {
            if( ctx.hasOwnProperty( nm ) ) {
                ret.push( '"' + escape( nm ) + '":"' + escape( ctx[nm] ) + '"' );
            }
        }
        return '{' + ret.join(',') + '}';
    },
    url_encode_args : function( ctx ) {
        ret = [];
        for( var nm in ctx ) {
            if( ctx.hasOwnProperty( nm ) ) {
                ret.push( escape( nm ) + '=' + escape( ctx[nm] ) );
            }
        }
        return ret.join( '&' );
    }
};

var et = {
    phoneHome : function ( api, args, callback ) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if( req.readyState != 4 ) { return; }

            if( req.status != 200 ) {
                // TODO: signal that the server returned an error.
                return;
            }

            callback( req );
        }

        req.open( "POST", "/stax/ajax/" + api, true );
        req.setRequestHeader( "ContentType", "application/json" );
        req.setRequestHeader( "X-CSRFToken", util.getCookie('csrftoken') );
        var msgBody = etprivate.body_encode_args( args );
        // alert( "Sending message with '" + msgBody + "'" );
        req.send( msgBody );
    },
    // TODO: update csrf token

    serverRender : function( widgetname, ctx, elem, callback ) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if( req.readyState != 4 ) { return; }

            if( req.status != 200 ) {
                // TODO: signal that the server returned an error.
                return;
            }

            elem.innerHTML = req.responseText;
            callback( elem );
        }

        var ctxurl = '';
        if( Object.keys( ctx ).length > 0 ) {
            ctxurl = '?' + etprivate.url_encode_args( ctx );
        }

        req.open( "GET", "/stax/render/" + widgetname + ctxurl, true );
        req.send();
    }
};

