from django.db import models

class StackNode( models.Model ):
    name = models.CharField(max_length=256)
    desc = models.TextField()
    parent = models.ForeignKey('self', null=True)

    def __unicode__(self):
        return self.name

class Stack( models.Model ):
    name = models.CharField(max_length=256)
    top = models.ForeignKey( StackNode, null=True )

    def __unicode__(self):
        return self.name

