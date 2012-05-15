from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from stax.models import Stack

def doPop( req ):
    if not req.method == "POST":
        raise Http404()
    stackID = req.POST["id"]
    st = get_object_or_404( Stack, pk=stackID )
    oldTop = st.doPop()
    if oldTop is not None:
        oldTop.delete() 
    st.save()
    return HttpResponse()

