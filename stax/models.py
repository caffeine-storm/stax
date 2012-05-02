from django.db import models

class StackNode( models.Model ):
    name = models.CharField(max_length=256)
    desc = models.TextField()
    down = models.ForeignKey( 'self', null=True )

    def __unicode__(self):
        return self.name

class Stack( models.Model ):
    name = models.CharField(max_length=256)
    top = models.ForeignKey( StackNode )

    def __unicode__(self):
        return self.name

