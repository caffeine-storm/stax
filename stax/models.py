from django.db import models

class NodeType( models.Model ):
    NODE_TYPE_CHOICES = (
        ( 0, 'Invalid' ),
        ( 1, 'Standard' ),
        ( 2, 'Base' ),
        # ( 3, 'Blocker' ),
    )

    desc = models.SmallIntegerField( choices=NODE_TYPE_CHOICES, primary_key=True, default=1 )

    def __unicode__(self):
        return self.NODE_TYPE_CHOICES[self.desc][1]

class StackNode( models.Model ):
    name = models.CharField(max_length=256)
    desc = models.TextField()
    tp = models.ForeignKey( NodeType, db_index=True )

    def __unicode__(self):
        return self.name

class Dependency( models.Model ):
    parent = models.ForeignKey( StackNode, db_index=True, related_name='parent' )
    child = models.ForeignKey( StackNode, db_index=True, related_name='child' )

    def __unicode__(self):
        return self.child.name + " depends on " + self.parent.name
