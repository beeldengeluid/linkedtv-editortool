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

from linkedtv.api.dbpedia.AutoComplete import AutoComplete
from linkedtv.api.dbpedia.EntityProxy import EntityProxy
from linkedtv.api.external.EntityExpansionService import EntityExpansionService

from linkedtv.api.Api import *


def getErrorMessage(msg):
    return "{\"error\" : \"%s\"}" % msg;

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
Calls rendering HTML pages
*********************************************************************************************************
"""

def main(request):
    return render_to_response('index.html', {'user' : request.user})

def logout_user(request):
    logout(request)
    return render_to_response('index.html')

def trial(request):
    print 'Going to the trial page'
    return render_to_response('edit.html', {'user' : 'anonymous', 'trialId' : 'b967eefd-5ca2-492c-8fae-aa01dc0229cf'})

@login_required
def provider(request, pub = '', id = ''):
    authorized = False
    if pub:       
        for g in request.user.groups.all():            
            if(g.name.lower() == pub):
                authorized = True
                break
    if not authorized:
        print 'you (%s) are not authorized to view this page' % pub
        return render_to_response('index.html', {'user' : request.user})
    return render_to_response('edit.html', {'user' : request.user})
    
    
""" 
*********************************************************************************************************
REST API CALLS (loading & saving data, fetching images and video etc)
*********************************************************************************************************
"""

"""This is called to fetch the data of a single media resource (including the curated data from SPARQL!!!)"""
def load_ltv(request):
    resourceUri = request.GET.get('id', None)
    loadData = request.GET.get('ld', 'false') == 'true'
    clientIP = getClientIP(request)
    if resourceUri:
        api = Api()
        resp = api.load_ltv(resourceUri, clientIP, loadData)
        return HttpResponse(resp, mimetype='application/json')
    return HttpResponse(getErrorMessage('The resource does not exist'), mimetype='application/json')

"""This is called to fetched the curated data from the Redis store (which should later be synched with the SPARQL?)"""
def load_et(request):
    resourceUri = request.GET.get('id', None)
    if resourceUri:
        api = Api()
        resp = api.load_et(resourceUri)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse(getErrorMessage('Could not load curated data'), mimetype='application/json')

"""New Saving function"""
@csrf_exempt
def save_et(request):
    action = request.GET.get('action', None)
    saveData = request.body    
    api = Api()
    resp = api.save_et(saveData)
    if resp:
        return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse(getErrorMessage('Malformed POST data'), mimetype='application/json')
    

"""for exporting a resource to the LinkedTV platform"""
def export(request):
    publishingPoint = request.GET.get('pp', None)
    return HttpResponse(getErrorMessage('To be implemented!'), mimetype='application/json')


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

def videos(request):
    p = request.GET.get('p', None)
    if p:
        api = Api()
        resp = api.getVideosOfProvider(p)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
    return HttpResponse(getErrorMessage('Please provide the correct parameters'), mimetype='application/json')


def dimension(request):
    print 'Testing the new dimension'
    query = request.GET.get('q', None)
    dimensionService = request.GET.get('d', None)
    params = request.GET.get('params', None)
    if params:
        params = simplejson.loads(params)
    if query and dimensionService and params:
        api = Api()
        resp = api.dimension(query.split(','), dimensionService, params)
        if resp:
            return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
        else:
            return HttpResponse(getErrorMessage('No enrichments found'), mimetype='application/json')
    return HttpResponse(getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

def dimensions(request):
    api = Api()
    resp = api.dimensions()
    if resp:
        return HttpResponse(simplejson.dumps(resp), mimetype='application/json')    
    return HttpResponse(getErrorMessage('No services have been registered!'), mimetype='application/json')


""" 
*********************************************************************************************************
External APIs from LinkedTV WP2
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

def entityproxy(request):
    uri = request.GET.get('uri', None)
    lang = request.GET.get('lang', None)
    if uri:
        ep = EntityProxy()
        resp = ep.fetch(uri, lang)
        return HttpResponse(resp, mimetype='application/json')
    return HttpResponse(getErrorMessage('Please provide a DBPedia URI'), mimetype='application/json')

#TODO test this function
def entityexpand(request):
    url = request.GET.get('url', None)
    start = request.GET.get('start', -1)
    end = request.GET.get('end', -1)
    if url and (end > start or (end == -1 and start == -1)):
        ees = EntityExpansionService()
        resp = ees.fetch(url, start, end)
        if resp:
            return HttpResponse(resp, mimetype='text/plain')
            #return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
        else:
            return HttpResponse(getErrorMessage('Could not find any entities'), mimetype='application/json')
    return HttpResponse(getErrorMessage('Please provide the correct parameters'), mimetype='application/json')


