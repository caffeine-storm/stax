from stax.models import StackNode, NodeType, Dependency

def stackNodeFromStackNodeStr( s ):
    tup = eval( s )
    return StackNode( id=tup[0], name=tup[1], desc=tup[2], tp=NodeType(1) )

def stackNodeFromStackStr( s ):
    tup = eval( s )
    return StackNode( name=tup[1], desc='', tp=NodeType(2) )

def depFromNode( s ):
    tup = eval( s )
    if not tup[3]:
        return None

    p = StackNode.objects.get( pk=tup[0] )
    c = StackNode.objects.get( pk=tup[3] )
    return Dependency( parent=p, child=c )

def depFromStack( s ):
    tup = eval( s )
    if not tup[2]:
        return None
    
    p = StackNode.objects.get( name=tup[1] )
    c = StackNode.objects.get( pk=tup[2] )
    return Dependency( parent=p, child=c )

def read_stacknodes():
    for l in open( 'stacknode.data' ):
        x = stackNodeFromStackNodeStr( l )
        if x:
            yield x

def read_stacks():
    for l in open( 'stack.data' ):
        x = stackNodeFromStackStr( l )
        if x:
            yield x

def read_deps_from_nodes():
    for l in open( 'stacknode.data' ):
        x = depFromNode( l )
        if x:
            yield x

def read_deps_from_stacks():
    for l open( 'stack.data' ):
        x = depFromStack( l )
        if x:
            yield x

if __name__ == '__main__':
    map( StackNode.save, read_stacknodes() )
    map( Stack.save, read_stacks() )
    map( Dependency.save, read_deps_from_nodes )
    map( Dependency.save, read_deps_from_stacks )

