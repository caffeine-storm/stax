from django.shortcuts import render_to_response
from stax.models import Stack

stylelist = [
    "dotted",
    "dashed",
    "solid",
    "groove",
    "ridge",
    "inset",
    "outset",
    "double",
]

def frontpage(req):
    return render_to_response(
        'stax/index.html',
        {
            'all_stax' : Stack.objects.all(),
            'teststyles' : stylelist
        }
    )

