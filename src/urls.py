from django.conf.urls import patterns, url

urlpatterns = patterns('',

    #views
    url(r'^$', 'views.main'),
    url(r'^trial$', 'views.trial'),
    url(r'^(?P<pub>\w+)/$', 'views.provider'),
    url(r'^(?P<pub>\w+)/(?P<id>.*)/$', 'views.provider'),
    url(r'^login$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout$', 'views.logout_user'),
    
    #API - load and save mediaresources
    url(r'^load_ltv$', 'views.load_ltv'),
    url(r'^load_et$', 'views.load_et'),
    url(r'^save_et$', 'views.save_et'),
    url(r'^export$', 'views.export'),

    #API - load images and other vidoes
    url(r'^image$', 'views.image'),
    url(r'^videos$', 'views.videos'),
    
    #API - dimension services (for fetching enrichments)
    url(r'^dimension$', 'views.dimension'),
    url(r'^dimensions$', 'views.dimensions'),
    
    #external/partner APIs 
    url(r'^entityproxy$', 'views.entityproxy'),    
    url(r'^entityexpand$', 'views.entityexpand'),
    url(r'^autocomplete$', 'views.autocomplete'),

)