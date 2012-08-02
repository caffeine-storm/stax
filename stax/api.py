from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponse, HttpResponseNotAllowed, Http404
from stax.models import StackNode, Dependency, NodeType
from stax.views import stackToMap

class StaxAPIException( Exception ):
    def __init__( self, msg ):
        super( Exception, self).__init__( msg )

class IsParent( StaxAPIException ):
    def __init__( self ):
        super( StaxAPIException, self).__init__( "The operation cannot be performed for a node that has children" ) 

class IsNotABase( StaxAPIException ):
    def __init__( self ):
        super( StaxAPIException, self).__init__( "The operation cannot be performed for a node that has a parent" ) 

def createStack( stackName ):
    x = StackNode( name=stackName, desc='', tp=NodeType(2) )
    x.save()
    return x

def dropStack( stackId ):
    # Can only drop base elements with no children
    if Dependency.objects.filter( parent=stackId ).count() > 0:
        raise IsParent()

    # A base node can't have a parent
    if Dependency.objects.filter( child=stackId ).count() > 0:
        raise IsNotABase()

    s = get_object_or_404( StackNode, pk=stackId )
    s.delete()

def push( parentId, entryVal ):
    oldnode = get_object_or_404( StackNode, pk=parentId )

    newNode = StackNode( name=entryVal, desc="", tp=NodeType(1) )
    newNode.save()

    Dependency( parent=oldnode, child=newNode ).save()

def pop( nodeId ):
    # Can only 'pop' top elements
    if Dependency.objects.filter( parent=nodeId ).count() > 0:
        raise IsParent()

    stk = get_object_or_404( StackNode, pk=nodeId )
    deps = Dependency.objects.filter( child=stk )
    map( Dependency.delete, deps )
    stk.delete()

def rename( stackId, newName ):
    st = get_object_or_404( StackNode, pk=stackId );
    st.name = newName
    st.save()

