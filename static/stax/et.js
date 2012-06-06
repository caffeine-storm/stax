// E.T. phone home

var etprivate = {
    // ctx is a map of arg-name to arg-val
    encode_args : function( ctx ) {
        ret = [];
        for( var nm in ctx ) {
            if( ctx.hasOwnProperty( nm ) ) {
                ret.push( nm + "=" + ctx[nm] );
            }
        }
        return ret.join('&');
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

        req.open( "POST", "/stax/api/" + api, true );
        req.setRequestHeader( "ContentType", "application/x-www-form-urlencoded" );
        req.setRequestHeader( "X-CSRFToken", util.getCookie('csrftoken') );
        req.send( etprivate.encode_args( args ) );
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
            ctxurl = '?' + etprivate.encode_args( ctx );
        }

        req.open( "GET", "/stax/render/" + widgetname + ctxurl, true );
        req.send();
    }
};

