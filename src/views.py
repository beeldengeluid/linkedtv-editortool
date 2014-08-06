import simplejson
from simplejson import JSONDecodeError

from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django.core.context_processors import csrf
from django.template import RequestContext

from linkedtv.api.sparql.SaveEndpoint import SaveEndpoint
from linkedtv.images.ImageFetcher import ImageFetcher
from linkedtv.video.VideoPlayoutHandler import VideoPlayoutHandler

from linkedtv.api.dbpedia.AutoComplete import AutoComplete
from linkedtv.api.external.MediaCollector import MediaCollector
from linkedtv.api.external.UnstructuredSearch import UnstructuredSearch
from linkedtv.api.external.TvEnricher import TvEnricher

from linkedtv.api.Api import *

""" 
*********************************************************************************************************
For loading the login/logout pages
*********************************************************************************************************
"""

def logout_user(request):
    logout(request)
    return render_to_response('index.html')

""" 
*********************************************************************************************************
For loading the main page
*********************************************************************************************************
"""

def main(request): 
    return render_to_response('index.html', {'user' : request.user})

""" 
*********************************************************************************************************
For loading a the page that lists the available mediaresources/videos per provider
*********************************************************************************************************
"""

@login_required
def provider(request, pub = '', id = ''):
    authorized = False
    if pub:       
        for g in request.user.groups.all():            
            if(g.name.lower() == pub):
                authorized = True
                break
    print request.user
    if not authorized:
        print 'you (%s) are not authorized to view this page' % pub
        return render_to_response('index.html', {'user' : request.user})
    return render_to_response('edit.html', {'user' : request.user})


""" 
*********************************************************************************************************
For loading a single mediaresource (for populating the main detail page of a video)
*********************************************************************************************************
"""

"""This is called to fetch the data of a single media resource"""
def resource(request):
    resourceUri = request.GET.get('id', None)
    data = request.GET.get('ld', 'false') == 'true'
    clientIP = getClientIP(request)
    if resourceUri:        
        """Get the playout URL"""
        
        vph = VideoPlayoutHandler()
        playoutURL = 'none'#vph.getPlayoutURL(resourceUri, clientIP)                
        imgf = ImageFetcher()
        thumbURL =  imgf.getThumbnailLocatorFromAPI(resourceUri)

        """Only if there is a playout URL get the annotation data"""        
        if playoutURL:
            mr = {}
            if data:
                api = Api()
                mr = api.getEntireResource(resourceUri, True)
                print 'Loaded data from the SPARL endpoint'
            mr['locator'] = playoutURL
            mr['thumb_base'] = thumbURL
            resp = simplejson.dumps(mr)
            return HttpResponse(resp, mimetype='application/json')
        else:
            return HttpResponse("{error: 'no play-out URL found!'}", mimetype='application/json')

    return HttpResponse("{error: 'resource does not exist'}", mimetype='application/json')

"""This is called to fetch the IP of the connecting client"""
def getClientIP(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

""" 
*********************************************************************************************************
For loading keyframes from the Noterik server
*********************************************************************************************************
"""

"""This is called to fetch an keyframe/thumbnail image from the Noterik server"""
def image(request):
    millis = request.GET.get('ms', None)
    id = request.GET.get('id', None)
    if millis:
        fetcher = ImageFetcher()
        resp = fetcher.getNoterikThumbnailByMillis(id, millis)
        if resp:
            return HttpResponse(resp, mimetype='image/jpeg')
        else:
            return HttpResponseRedirect('/site_media/images/snowscreen.gif')
    elif id:
        fetcher = ImageFetcher()
        resp = fetcher.getEnrichmentThumb(id)
        if resp:
            return HttpResponse(resp)
        else:
            return HttpResponseRedirect('/site_media/images/snowscreen.gif')
        
    return HttpResponse("{'error' : 'Please provide the moment in time by milliseconds'}", mimetype='application/json')

""" 
*********************************************************************************************************
Saving functions
*********************************************************************************************************
"""

"""This is called to save a single chapter"""
@csrf_exempt
def savechapter(request):
    savedata = request.POST.get('savedata', None)
    sep = SaveEndpoint()
    try:
        saveURIs = sep.saveChapter(simplejson.loads(savedata))
    except JSONDecodeError, e:
        return HttpResponse("{'error' : 'malformed save data'}", mimetype='application/json')
    return HttpResponse(simplejson.dumps(saveURIs), mimetype='application/json')


"""This is called to save a single annotation (containing a URL to an online resource + multiple enrichments)"""
@csrf_exempt
def saveannotation(request):
    savedata = request.POST.get('savedata', None)
    sep = SaveEndpoint()
    try:
        saveURIs = sep.saveAnnotation(simplejson.loads(savedata))
    except JSONDecodeError, e:
        return HttpResponse("{'error' : 'malformed save data'}", mimetype='application/json')
    return HttpResponse(simplejson.dumps(saveURIs), mimetype='application/json')


""" 
*********************************************************************************************************
DBPedia Spotlight autocomplete
*********************************************************************************************************
"""

"""This is called when using a DBPedia autocomplete field in the UI"""
def autocomplete(request):
    prefix = request.GET.get('term', None)
    ac = AutoComplete()
    options = ac.autoComplete(prefix)
    resp = simplejson.dumps(options)
    return HttpResponse(resp, mimetype='application/json')
    
    
""" 
*********************************************************************************************************
New API calls
*********************************************************************************************************
"""

def videos(request):
    p = request.GET.get('p', None)
    if p:
        api = Api()
        resp = api.getVideosOfProvider(p)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'What a piece of junk'}", mimetype='application/json')

def chapters(request):
    r = request.GET.get('r', None)
    if r:
        api = Api()
        resp = api.getChaptersOfResource(r)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'What a piece of junk'}", mimetype='application/json')

#this function should be updated to fetch the entities of a chapter (once the LinkedTV API supports this)
def entities(request):
    r = request.GET.get('r', None)
    if r:
        api = Api()
        resp = api.getEntitiesOfResource(r)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'What a piece of junk'}", mimetype='application/json')

def enrichments(request):
    q = request.GET.get('q', None)
    p = request.GET.get('p', None)
    if p and q:
        p = str(p).upper()
        api = Api()
        resp = api.getEnrichmentsOnDemand(q.split(','), p)
        print resp
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'What a piece of junk'}", mimetype='application/json')

""" 
*********************************************************************************************************
External APIs from LinkedTV WP2
*********************************************************************************************************
"""

def mediacollector(request):
    s = request.GET.get('s', None)
    provider = request.GET.get('p') 
    if s:
        mc = MediaCollector()
        print 'Searching (MC) for %s (%s)' % (s, provider)
        resp = mc.search(s, provider)
        return HttpResponse(resp, mimetype='application/json')
    return HttpResponse("{'error' : 'Could not find anything'}", mimetype='application/json')

def unstructuredsearch(request):
    s = request.GET.get('s', None)
    provider = request.GET.get('p') 
    if s:
        us = UnstructuredSearch()
        print 'Searching (US) for %s (%s)' % (s, provider)
        resp = us.search(s, provider)
        return HttpResponse(resp, mimetype='application/json')
    return HttpResponse("{'error' : 'Could not find anything'}", mimetype='application/json')

def tvenricher(request):
    call = request.GET.get('call', None)
    uuid = request.GET.get('id', None)
    resp = 'Nothing to see here'
    tve = TvEnricher()
    if call == 'list':  
        resp = tve.getProcessedResources()
    elif id:
        resp = tve.getProcessedResource(uuid)
    print resp
    return HttpResponse(resp)#, mimetype='text/xml'
        
    