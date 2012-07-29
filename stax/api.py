from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponse, HttpResponseNotAllowed, Http404
from stax.models import StackNode, Dependency, NodeType
from stax.views import stackToMap

class IsParent( Exception ):
    def __init__( self ):
        super( Exception, self).__init__( "Can only pop nodes without children" ) 

def doPop( nodeId ):
    # Can only 'pop' top elements
    if Dependency.objects.filter( parent=nodeId ).count() > 0:
        raise IsParent()

    stk = get_object_or_404( StackNode, pk=nodeId )
    deps = Dependency.objects.filter( child=stk )
    map( Dependency.delete, deps )
    stk.delete()

def doPush( parentId, entryVal ):
    oldnode = get_object_or_404( StackNode, pk=parentId )

    newNode = StackNode( name=entryVal, desc="", tp=NodeType(1) )
    newNode.save()

    Dependency( parent=oldnode, child=newNode ).save()

def doRename( stackId, newName ):
    st = get_object_or_404( StackNode, pk=stackId );
    st.name = newName
    st.save()

