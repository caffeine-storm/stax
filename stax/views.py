from django.shortcuts import render_to_response
from stax.models import Stack

def get_stax():
    allStax = Stack.objects.all()
    ret = {}
    for st in allStax:
        ret[str(st.name)] = []
        top = st.top
        while top:
            ret[str(st.name)].append( str(top.name) )
            top = top.parent
    return ret

def frontpage(req):
    return render_to_response(
        'stax/index.html',
        {
            'all_stax' : get_stax()
        }
    )

