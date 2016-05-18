from django.shortcuts import render_to_response, get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import Http404
from django.template import RequestContext
from stax.models import StackNode, Dependency

def stackToMap( st ):
    ret = {}

    ret["name"] = str( st.name )
    ret["id"] = st.id
    ret["desc"] = st.desc
    ret["class"] = "stack-node"
    ret["children"] = []

    tmp = Dependency.objects.filter( parent=st )

    if len( tmp ) == 0: # There were no children
        ret["class"] = "stack-leaf"
    else:
        for dep in tmp:
            ret["children"].append( stackToMap( dep.child ) )

    return ret

def stackBaseToMap( st ):
    ret = stackToMap( st )
    ret["class"] = "stack-base"
    return ret

def get_base_stax():
    return StackNode.objects.filter( tp=2 )

def get_stax():
    bases = get_base_stax()
    return map( stackBaseToMap, bases )

def render_stack( req, stk ):
    from django.template.loader import render_to_string

    if len( stk["children"] ) == 0:
        # No Children
        return {
            'id' : stk["id"],
            'rendered' : '<div class="stack-layer">' + render_to_string( 'stax/node.html', { 'stack' : stk } ) + '</div>'
        }
    else:
        payload = '<div class="stack-layer">\n'
        payload += "\n".join( [ render_stack( req, s )['rendered'] for s in stk["children"] ] )
        payload += "\n" + render_to_string( 'stax/node.html', { 'stack' : stk } )
        payload += '</div>\n'

    return {
        'id' : stk["id"],
        'rendered' : payload
    }

@ensure_csrf_cookie
def frontpage(req):
    s = get_stax()
    ctx = {
        'all_stax' : [ render_stack( req, stk ) for stk in s ]
    }

    return render_to_response(
        'stax/index.html',
        RequestContext( req, ctx )
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
    s = get_object_or_404( StackNode, pk=stackid )

    return render_to_response(
        'stax/widgets/stack.html',
        {
            'stack' : render_stack( req, stackBaseToMap( s ) )
        }
    )

# Do a webapi.doPush and return a response with HTML for the new node
def doPushAndRender( req ):
    import stax.webapi
    resp = stax.webapi.doPush( req )
    theid = int( resp.content )
    return render_to_response(
        'stax/node.html',
        { 'stack' : stackToMap( StackNode.objects.get( pk=theid ) ) }
    )

def faviconRedirect( req ):
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect( '/static/stax/icons/paperback-stack.png' )

