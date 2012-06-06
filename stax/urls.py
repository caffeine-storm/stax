from django.conf.urls import patterns, include, url
from django.contrib import admin
from stax.api import doPop, doPush, doRename, doCommitNewStack, dropStack
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^stax/$', 'stax.views.frontpage'),
	url(r'^stax/render/stack.html', 'stax.views.renderStack' ),
    url(r'^stax/render/(?P<widget_name>[a-z0-9\.]+)', 'stax.views.render'),
    url(r'^stax/api/pop$', doPop),
    url(r'^stax/api/push$', doPush),
    url(r'^stax/api/rename$', doRename),
	url(r'^stax/api/commitnewstack$', doCommitNewStack),
	url(r'^stax/api/dropstack$', dropStack),
    url(r'^admin/', include(admin.site.urls)),
)

