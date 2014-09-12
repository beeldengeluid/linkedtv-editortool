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
from linkedtv.api.dbpedia.EntityProxy import EntityProxy
from linkedtv.api.external.MediaCollector import MediaCollector
from linkedtv.api.external.UnstructuredSearch import UnstructuredSearch
from linkedtv.api.external.TvEnricher import TvEnricher

from linkedtv.api import SaveEndpoint as ET
from linkedtv.api.Api import *

def getErrorMessage(msg):
    return "{\"error\" : \"%s\"}" % msg;

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

"""This is called to fetch the data of a single media resource (including the curated data from SPARQL!!!)"""
def resource(request):
    resourceUri = request.GET.get('id', None)
    loadData = request.GET.get('ld', 'false') == 'true'
    clientIP = getClientIP(request)
    if resourceUri:
        resourceData = {}
        api = Api()
        if loadData:
            resourceData = api.getAllAnnotationsOfResource(resourceUri, True)
        """Get the mediaresource metadata and the playout URL"""
        videoMetadata = simplejson.loads(api.getVideoData(resourceUri))
        if videoMetadata:
            vph = VideoPlayoutHandler()
            resourceData['videoMetadata'] = videoMetadata
            playoutURL = 'none' #vph.getPlayoutURL(videoMetadata['mediaResource']['locator'], clientIP)                
            resourceData['locator'] = playoutURL
            if videoMetadata['mediaResource']['mediaResourceRelationSet']:
                for mrr in videoMetadata['mediaResource']['mediaResourceRelationSet']:
                    if mrr['relationType'] == 'thumbnail-locator':
                        resourceData['thumbBaseUrl'] = mrr['relationTarget']
        resp = simplejson.dumps(resourceData)
        return HttpResponse(resp, mimetype='application/json')
        

    return HttpResponse(getErrorMessage('The resource does not exist'), mimetype='application/json')

"""This is called to fetched the curated data from the Redis store (which should later be synched with the SPARQL?)"""
def curatedresource(request):
    resourceUri = request.GET.get('id', None)
    if resourceUri:
        sep = ET.SaveEndpoint()
        resp = sep.loadCuratedResource(resourceUri)
        print resp
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse(getErrorMessage('Could not load curated data'), mimetype='application/json')


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
    #id = request.GET.get('id', None)
    millis = request.GET.get('ms', None)
    baseUrl = request.GET.get('baseUrl', None)
    if millis and baseUrl:
        fetcher = ImageFetcher()
        resp = fetcher.getNoterikThumbnailByMillis(millis, baseUrl)
        if resp:
            return HttpResponse(resp, mimetype='image/jpeg')
        else:
            return HttpResponseRedirect('/site_media/images/snowscreen.gif')
    """
    elif id:
        fetcher = ImageFetcher()
        resp = fetcher.getEnrichmentThumb(id)
        if resp:
            return HttpResponse(resp)
        else:
            return HttpResponseRedirect('/site_media/images/snowscreen.gif')
    """    
    return HttpResponse("{'error' : 'Please provide the moment in time by milliseconds'}", mimetype='application/json')

""" 
*********************************************************************************************************
Old Saving functions
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
New Saving functions
*********************************************************************************************************
"""

@csrf_exempt
def saveresource(request):
    action = request.GET.get('action', None)
    saveData = request.body
    print 'Got the shit'
    sep = ET.SaveEndpoint()
    #TODO check the action
    try:
        resp = sep.saveVideo(simplejson.loads(saveData))
    except JSONDecodeError, e:
        return HttpResponse(getErrorMessage('Malformed POST data'), mimetype='application/json')
    return HttpResponse(simplejson.dumps(resp), mimetype='application/json')

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
    print options;
    resp = simplejson.dumps(options)
    return HttpResponse(resp, mimetype='application/json')
    
    
""" 
*********************************************************************************************************
New API calls
*********************************************************************************************************
"""

def video(request):
    r = request.GET.get('r', None)
    if r:
        api = Api()
        resp = api.getVideoData(r)
        if resp:
            return HttpResponse(resp, mimetype='application/json')
    return HttpResponse("{'error' : 'Please provide the correct parameters'}", mimetype='application/json')

def videos(request):
    p = request.GET.get('p', None)
    if p:
        api = Api()
        resp = api.getVideosOfProvider(p)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'Please provide the correct parameters'}", mimetype='application/json')

def chapters(request):
    r = request.GET.get('r', None)
    if r:
        api = Api()
        resp = api.getChaptersOfResource(r)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'Please provide the correct parameters'}", mimetype='application/json')

#this function should be updated to fetch the entities of a chapter (once the LinkedTV API supports this)
def entities(request):
    r = request.GET.get('r', None)
    if r:
        api = Api()
        resp = api.getEntitiesOfResource(r)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse("{'error' : 'Please provide the correct parameters'}", mimetype='application/json')

def enrichments(request):    
    query = request.GET.get('q', None)
    provider = request.GET.get('p', None)
    dimension = request.GET.get('d', None)
    service = request.GET.get('s', None)
    if provider and query and dimension and service:
        print 'GOing to fetch enrichments!'
        provider = str(provider).upper()
        api = Api()
        resp = api.getEnrichmentsOnDemand(query.split(','), provider, dimension, service, False)
        print resp
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse(getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

""" 
*********************************************************************************************************
External APIs from LinkedTV WP2
*********************************************************************************************************
"""

def entityproxy(request):
    uri = request.GET.get('uri', None)
    lang = request.GET.get('lang', None)
    if uri:
        ep = EntityProxy()
        resp = ep.fetch(uri, lang)
        return HttpResponse(resp, mimetype='application/json')
    return HttpResponse(getErrorMessage('Please provide a DBPedia URI'), mimetype='application/json')
