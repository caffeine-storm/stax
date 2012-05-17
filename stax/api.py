from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponse, Http404
from stax.models import Stack, StackNode
from stax.views import stackToMap

def doPop( req ):
    if not req.method == "POST":
        raise Http404()
    stackID = req.POST["id"]
    st = get_object_or_404( Stack, pk=stackID )
    oldTop = st.doPop()
    if oldTop is not None:
        oldTop.delete() 
        st.save()

    return render_to_response(
        'stax/stack_widget.html',
        {
            "stack" : stackToMap( st ),
        }
    )

def doPush( req ):
    if not req.method == "POST":
        raise Http404()
    stackID = req.POST["id"]
    entryVal = req.POST["item"]

    st = get_object_or_404( Stack, pk=stackID )
    oldTop = st.top

    newNode = StackNode( name=entryVal, desc="" )
    newNode.parent = oldTop
    newNode.save()

    st.top = newNode
    st.save()

    return HttpResponse()

