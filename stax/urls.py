from django.conf.urls import patterns, include, url
from django.contrib import admin
from stax.api import doPop, doPush
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^stax/$', 'stax.views.frontpage'),
    url(r'^stax/api/pop$', doPop),
    url(r'^stax/api/push$', doPush),
    url(r'^admin/', include(admin.site.urls)),
)

