from django.shortcuts import render_to_response, get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import Http404, HttpResponse
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

    thiswidth = max( 20, len( str( st.name ) ) )
    childwidth = 0


    if len( tmp ) == 0: # There were no children
        ret["class"] = "stack-leaf"
    else:
        for dep in tmp:
            ret["children"].append( stackToMap( dep.child ) )
            childwidth += ret["children"][-1]["width"]

    ret["width"] = max( childwidth, thiswidth )

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
    payload = "lol :D"

    if len( stk["children"] ) == 0:
        # No Children
        return {
            'id' : stk["id"],
            'width' : stk["width"],
            'rendered' : '<div class="stack-layer">' + render_to_string( 'stax/node.html', { 'stack' : stk } ) + '</div>'
        }
    else:
        payload = '<div class="stack-layer">'
        payload += "\n".join( [ render_stack( req, s )['rendered'] for s in stk["children"] ] )
        payload += "\n" + render_to_string( 'stax/node.html', { 'stack' : stk } )
        payload += '</div>'

    return {
        'id' : stk["id"],
        'width' : stk["width"],
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
            'stack' : render_stack( req, stackToMap( s ) )
        }
    )

