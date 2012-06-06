from django.shortcuts import render_to_response, get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import Http404
from stax.models import Stack

def stackToMap( st ):
    ret = {}

    ret["name"] = str( st.name )
    ret["id"] = st.id
    ret["nodes"] = []

    maxwidth = len( str( st.name ) )

    top = st.top
    while top:
        maxwidth = max( maxwidth, len( str( top.name ) ) )
        ret["nodes"].append( str( top.name) )
        top = top.parent

    ret["width"] = max( maxwidth, 20 )
    return ret

def get_stax():
    return [ stackToMap( s ) for s in Stack.objects.all() ]

@ensure_csrf_cookie
def frontpage(req):
    return render_to_response(
        'stax/index.html',
        {
            'all_stax' : get_stax()
        }
    )

def render( req, widget_name ):
    if req.method == "POST":
        # GETs only plz
        print "Got a POST request when trying to render!"
        raise Http404

    ctx = req.GET.dict()

    def isWidgetName( nm ):
        parts = nm.split( '.' )
        for part in parts:
            if part.islower() and part.isalnum():
                continue
            print "Bad widget name part:", part
            return False
        return True

    if not isWidgetName( widget_name ):
        raise Http404

    return render_to_response( 'stax/widgets/' + widget_name + '/', ctx )

def renderStack( req ):
    stackid = req.GET['stackid']
    s = get_object_or_404( Stack, pk=stackid )

    return render_to_response(
        'stax/widgets/stack.html',
        {
            'stack' : stackToMap( s )
        }
    )

