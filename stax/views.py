from django.shortcuts import render_to_response
from stax.models import Stack

def frontpage(req):
    return render_to_response( 'stax/index.html', { 'all_stax' : Stack.objects.all() } )

