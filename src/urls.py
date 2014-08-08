from django.conf.urls import patterns, url

urlpatterns = patterns('',

    url(r'^$', 'views.main'),

    url(r'^resource$', 'views.resource'),
    url(r'^savechapter$', 'views.savechapter'),
    url(r'^saveannotation$', 'views.saveannotation'),
    url(r'^image$', 'views.image'),
    url(r'^autocomplete$', 'views.autocomplete'),
    
    #authentication
    url(r'^login$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout$', 'views.logout_user'),
    
    #external/partner APIs   
    url(r'^tvenricher$', 'views.tvenricher'),
    url(r'^entityproxy$', 'views.entityproxy'),
    #url(r'^mediacollector$', 'views.mediacollector'),
    #url(r'^unstructuredsearch$', 'views.unstructuredsearch'),
    
    #refactored navigation
    url(r'^(?P<pub>\w+)/$', 'views.provider'),
    url(r'^(?P<pub>\w+)/(?P<id>.*)/$', 'views.provider'),

    #new API calls
    url(r'^videos$', 'views.videos'),
    url(r'^chapters$', 'views.chapters'),
    url(r'^entities$', 'views.entities'),
    url(r'^enrichments$', 'views.enrichments'),

)