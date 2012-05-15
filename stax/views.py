from django.shortcuts import render_to_response
from django.views.decorators.csrf import ensure_csrf_cookie
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

    ret["width"] = maxwidth
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

