from django.http import HttpResponse
from django.shortcuts import render_to_response
from stax import api
import json

def restrictMethod(m):
    def wrapper( fn ):
        def foo( req, *args, **kwargs ):
            if req.method != m:
                return HttpResponseNotAllowed( [ m ] )
            return fn( req, *args, **kwargs )
        return foo
    return wrapper

def get_args( req, names ):
    import urllib
    def do_get_args( mp, nms ):
        head = mp[nms[0]]
        if len( nms ) == 1:
            return (head,)
        tail = do_get_args( mp, nms[1:] )
        return (head, tail)
    try:
        args = json.loads( req.readline() )
        for k in args:
            args[k] = urllib.unquote( args[k] )
        return do_get_args( args, names )
    except ValueError as e:
        raise Http404()

@restrictMethod( "POST" )
def doCreateStack( req ):
    (newName,) = get_args( req, ['name'] )

    s = api.createStack( newName )

    resp = render_to_response(
        "stax/widgets/stack.xml",
        { 'stack' : { 'id': s.id, 'stackwidth': len( s.name ) } }
    )
    resp['Content-Type'] = "text/xml; charset=utf-8"
    return resp

@restrictMethod( "POST" )
def doDropStack( req ):
    (theid,) = get_args( req, ['stackid'] )

    try:
        api.dropStack( theid )
    except api.StaxAPIException as e:
        return HttpResponse( str( e ), status=404 )

    return HttpResponse()

@restrictMethod( "POST" )
def doPush( req ):
    # stackID = req.POST["id"]
    # entryVal = req.POST["item"]
    (stackID,(entryVal,)) = get_args( req, ['id', 'item'] )

    try:
        newnodeid = api.push( stackID, entryVal )
    except Http404:
        raise

    return HttpResponse( unicode( newnodeid ) )

@restrictMethod( "POST" )
def doPop( req ):
    # stackID = req.POST["stackid"]
    (stackID,) = get_args( req, ["stackid"] )

    try:
        api.pop( stackID )
    except api.StaxAPIException as e:
        raise Http404()

    return HttpResponse()

@restrictMethod( "POST" )
def doRename( req ):
    # stackID = req.POST["stackid"]
    # newName = req.POST["data"]
    (stackID,(newName,)) = get_args( req, ["stackid", "data"] )

    api.rename( stackID, newName )

    return HttpResponse( unicode( newName ) )

