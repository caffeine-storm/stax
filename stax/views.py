from django.shortcuts import render_to_response
from django.views.decorators.csrf import ensure_csrf_cookie
from stax.models import Stack

def get_stax():
    allStax = Stack.objects.all()
    ret = []
    for st in allStax:
        tmp = {}
        tmp["name"] = str( st.name )
        tmp["id"] = st.id
        tmp["nodes"] = []
        top = st.top
        maxwidth = len( str( st.name ) )
        while top:
            maxwidth = max( maxwidth, len( str( top.name ) ) )
            tmp["nodes"].append( str( top.name) )
            top = top.parent
        tmp["width"] = maxwidth
        ret.append( tmp )
    return ret

@ensure_csrf_cookie
def frontpage(req):
    return render_to_response(
        'stax/index.html',
        {
            'all_stax' : get_stax()
        }
    )

