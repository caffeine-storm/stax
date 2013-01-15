from django.conf.urls import patterns, include, url
from django.contrib import admin
from stax import webapi
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^favicon.ico', 'stax.views.faviconRedirect' ),
    url(r'^stax/$', 'stax.views.frontpage'),
    url(r'^stax/render/stack.html', 'stax.views.renderStack' ),
    url(r'^stax/render/(?P<widget_name>[a-z0-9\.]+)', 'stax.views.render'),
    url(r'^stax/ajax/createstack$', webapi.doCreateStack),
    url(r'^stax/ajax/dropstack$', webapi.doDropStack),
    url(r'^stax/ajax/push$', webapi.doPush),
    url(r'^stax/ajax/pushandrender$', 'stax.views.doPushAndRender'),
    url(r'^stax/ajax/pop$', webapi.doPop),
    url(r'^stax/ajax/rename$', webapi.doRename),
    url(r'^admin/', include(admin.site.urls)),
)

