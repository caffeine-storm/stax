from django.shortcuts import render_to_response
from stax.models import Stack

def get_stax():
    allStax = Stack.objects.all()
    ret = []
    for st in allStax:
        tmp = {}
        tmp["name"] = str( st.name )
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

def frontpage(req):
    return render_to_response(
        'stax/index.html',
        {
            'all_stax' : get_stax()
        }
    )

