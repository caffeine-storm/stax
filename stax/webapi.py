from django.http import HttpResponse
from django.shortcuts import render_to_response
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
def doCreateStack( req ):
    newName = req.POST['name']

    s = api.createStack( newName )

    resp = render_to_response(
        "stax/widgets/stack.xml",
        { 'stack' : { 'id': s.id, 'stackwidth': len( s.name ) } }
    )
    resp['Content-Type'] = "text/xml; charset=utf-8"
    return resp

@restrictMethod( "POST" )
def doDropStack( req ):
    theid = req.POST['stackid']

    try:
        api.dropStack( theid )
    except api.StaxAPIException as e:
        return HttpResponse( str( e ), status=409 )

    return HttpResponse()

@restrictMethod( "POST" )
def doPush( req ):
    stackID = req.POST["id"]
    entryVal = req.POST["item"]

    try:
        api.push( stackID, entryVal )
    except Http404:
        raise

    return HttpResponse()

@restrictMethod( "POST" )
def doPop( req ):
    stackID = req.POST["stackid"]

    try:
        api.pop( stackID )
    except api.StaxAPIException as e:
        return HttpResponse( str( e ), status=409 )

    return HttpResponse()

@restrictMethod( "POST" )
def doRename( req ):
    stackID = req.POST["stackid"]
    newName = req.POST["data"]

    api.rename( stackID, newName )

    return HttpResponse()

