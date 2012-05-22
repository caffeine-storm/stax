// Utility funcs

var util = {
    wsTrim : function( str ) {
        return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );
    },

    getCookie : function( name ) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = util.wsTrim( cookies[i] );
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

