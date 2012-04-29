from django.shortcuts import render_to_response

def frontpage(req):
    return render_to_response( 'stax/index.html' )

