from django.http import HttpResponse
from stax import api

def restrictMethod(m):
    def wrapper( fn ):
        def foo( req, *args, **kwargs ):
            if req.method != m:
                return HttpResponseNotAllowed( [ m ] )
            return fn( req, *args, **kwargs )
        return foo
    return wrapper

@restrictMethod( "POST" )
def doPop( req ):
    stackID = req.POST["id"]

    try:
        api.doPop( stackID )
    except api.IsParent as e:
        return HttpResponse( str( e ), status=409 )

    return HttpResponse()

@restrictMethod( "POST" )
def doPush( req ):
    stackID = req.POST["id"]
    entryVal = req.POST["item"]

    try:
        api.doPush( stackID, entryVal )
    except Http404:
        raise

    return HttpResponse()

@restrictMethod( "POST" )
def doRename( req ):
    stackID = req.POST["stackid"]
    nodeOffset = int( req.POST["nodeoffset"] )
    newName = req.POST["data"]

    st = get_object_or_404( Stack, pk=stackID );
    t = st.top;
    while nodeOffset > 1:
        nodeOffset -= 1
        t = t.parent;

    t.name = newName
    t.save()

    return HttpResponse()

@restrictMethod( "POST" )
def doCommitNewStack( req ):
    ctx = req.POST.dict()
    s = Stack( name = ctx['data'] )
    s.save()

    return render_to_response(
        'stax/widgets/stack.xml',
        {
            'stack' : stackToMap( s ),
        },
        mimetype = "text/xml"
    )

@restrictMethod( "POST" )
def dropStack( req ):
    theid = req.POST['stackid']
    s = get_object_or_404( Stack, pk=theid )
    s.delete()
    return HttpResponse()

