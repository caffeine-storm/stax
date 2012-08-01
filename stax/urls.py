from django.conf.urls import patterns, include, url
from django.contrib import admin
from stax import webapi
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^stax/$', 'stax.views.frontpage'),
	url(r'^stax/render/stack.html', 'stax.views.renderStack' ),
    url(r'^stax/render/(?P<widget_name>[a-z0-9\.]+)', 'stax.views.render'),
	url(r'^stax/ajax/dropstack$', webapi.dropStack),
    url(r'^stax/ajax/pop$', webapi.doPop),
    url(r'^stax/api/push$', webapi.doPush),
    url(r'^stax/api/rename$', webapi.doRename),
	url(r'^stax/api/commitnewstack$', webapi.doCommitNewStack),
    url(r'^admin/', include(admin.site.urls)),
)

