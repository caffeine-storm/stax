function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].replace('^\s+', '');
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
            alert( "CALLBACK!" );
        }
    };
    req.open( "POST", "/stax/api/pop", true );
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'))
    req.send( "id=" + stackID.toString() );
}

function pushStack( stackID ) {
    alert( "Harro!" );
}
