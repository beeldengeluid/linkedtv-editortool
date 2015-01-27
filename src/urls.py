from django.conf.urls import patterns, url

urlpatterns = patterns('',

    #views
    url(r'^$', 'views.main'),
    url(r'^trial$', 'views.trial'),
    url(r'^user/(?P<pub>\w+)/$', 'views.provider'),
    url(r'^user/(?P<pub>\w+)/(?P<id>.*)/$', 'views.provider'),
    url(r'^login$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^login_user$', 'views.login_user'),
    url(r'^logout$', 'views.logout_user'),

    #API - load and save mediaresources
    url(r'^load$', 'views.load'),
    url(r'^load_curated$', 'views.load_curated'),
    url(r'^save$', 'views.save'),
    url(r'^publish$', 'views.publish'),
    url(r'^synchronize$', 'views.synchronize'),

    #API - logging of user actions
    url(r'^log$', 'views.log'),
    url(r'^showlogs$', 'views.showlogs'),

    #API - load images and other vidoes
    url(r'^image$', 'views.image'),
    url(r'^videos$', 'views.videos'),
    url(r'^subtitles$', 'views.subtitles'),

    #API - dimension services (for fetching enrichments)
    url(r'^dimension$', 'views.dimension'),
    url(r'^dimensions$', 'views.dimensions'),

    #external/partner APIs
    url(r'^entityproxy$', 'views.entityproxy'),
    url(r'^entityexpand$', 'views.entityexpand'),
    url(r'^autocomplete$', 'views.autocomplete'),

    #these calls should be abstracted to something that can be reused for synchronizing (chapter) data with
    url(r'^updatesolr$', 'views.updatesolr'),
    url(r'^deletesolr$', 'views.deletesolr'),

)