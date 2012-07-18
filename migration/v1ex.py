from stax.models import StackNode, Stack

def str_stack( s ):
    idstr = None
    if( s.top ):
        idstr = s.top.id
    return str( (s.id, str( s.name ), idstr ) )

def str_stacknode( s ):
    idstr = None
    if( s.parent ):
        idstr = s.parent.id
    return str( (s.id, str(s.name), str(s.desc), idstr ) )

def do_dump( filename, fn, lst ):
    with open( filename, 'w' ) as f:
        for x in lst:
            f.write( fn( x ) )
            f.write( '\n' )

def dump_stack():
    stacks = Stack.objects.all()
    do_dump( 'stack.data', str_stack, stacks )

def dump_stacknode():
    stacknodes = StackNodes.objects.all()
    do_dump( 'stacknode.data', str_stacknode, stacknodes )

if __name__ == '__main__':
    dump_stack()
    dump_stacknode()

