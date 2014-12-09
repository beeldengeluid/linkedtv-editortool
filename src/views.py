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

from linkedtv.api.vocabulary.dbpedia.AutoComplete import AutoComplete
from linkedtv.api.vocabulary.dbpedia.EntityProxy import EntityProxy
from linkedtv.api.vocabulary.gtaa.OpenSKOSHandler import OpenSKOSHandler
from linkedtv.api.external.EntityExpansionService import EntityExpansionService

from linkedtv.api.Api import *


def __getErrorMessage(msg):
	return "{\"error\" : \"%s\"}" % msg;

"""This is called to fetch the IP of the connecting client"""
def __getClientIP(request):
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

def login_user(request):
	return HttpResponseRedirect('/user/%s/' % request.user)

def logout_user(request):
	logout(request)
	return render_to_response('index.html')

def trial(request):
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
	clientIP = __getClientIP(request)
	if resourceUri:
		api = Api()
		resp = api.load_ltv(resourceUri, clientIP, loadData)
		return HttpResponse(resp, mimetype='application/json')
	return HttpResponse(__getErrorMessage('The resource does not exist'), mimetype='application/json')

"""This is called to fetch the curated data from the LinkedTV platform"""
def load_curated_ltv(request):
	resourceUri = request.GET.get('id', None)
	if resourceUri:
		api = Api()
		resp = api.load_curated_ltv(resourceUri)
		if resp:
			return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Could not load curated data'), mimetype='application/json')

"""This is called to fetched the curated data from the Redis store"""
def load_curated_et(request):
	resourceUri = request.GET.get('id', None)
	if resourceUri:
		api = Api()
		resp = api.load_curated_et(resourceUri)
		if resp:
			httpResp = HttpResponse(simplejson.dumps(resp), mimetype='application/json')
			#to enable CORS
			httpResp['Access-Control-Allow-Origin'] = '*'
			return httpResp
	return HttpResponse(__getErrorMessage('Could not load curated data'), mimetype='application/json')

"""New Saving function"""
@csrf_exempt
def save_et(request):
	action = request.GET.get('action', None)
	saveData = request.body
	api = Api()
	resp = api.save_et(saveData)
	if resp:
		return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Malformed POST data'), mimetype='application/json')


"""for exporting a resource to the LinkedTV platform"""
@csrf_exempt
def publish(request):
	publishingPoint = request.GET.get('pp', None)
	delete = request.GET.get('del', 'false')
	saveData = request.body
	if publishingPoint:
		api = Api()
		try:
			saveData = simplejson.loads(saveData)
			resp = api.publish(publishingPoint, saveData, delete == 'true')
		except JSONDecodeError, e:
			print e
			return HttpResponse(__getErrorMessage('Save data was not valid JSON'), mimetype='application/json')
		if resp:
			return HttpResponse(resp, mimetype='application/json')
	return HttpResponse(__getErrorMessage('Failed to publish this media resource'), mimetype='application/json')


"""This is called to fetch an keyframe/thumbnail image from the Noterik server"""
def image(request):
	#id = request.GET.get('id', None)
	millis = request.GET.get('ms', None)
	baseUrl = request.GET.get('baseUrl', None)
	if millis and baseUrl:
		api = Api()
		resp = api.image(millis, baseUrl)
		if resp:
			return HttpResponse(resp, mimetype='image/jpeg')
		else:
			return HttpResponseRedirect('/site_media/images/snowscreen.gif')
	return HttpResponse("{'error' : 'Please provide the moment in time by milliseconds'}", mimetype='application/json')

def videos(request):
	p = request.GET.get('p', None)
	if p:
		api = Api()
		resp = api.videos(p)
		if resp:
			return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

@csrf_exempt
def dimension(request):
	print 'Testing the new dimension'
	data = request.body
	try:
		data = simplejson.loads(data)
	except JSONDecodeError, e:
		print 'Data not formatted properly!'
		print data
		data = None
	if data:
		api = Api()
		resp = api.dimension(data['query'], data['entities'], data['dimension'])
		if resp:
			return HttpResponse(simplejson.dumps(resp, default=lambda obj: obj.__dict__), mimetype='application/json')
		else:
			return HttpResponse(__getErrorMessage('No enrichments found'), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

def dimensions(request):
	api = Api()
	resp = api.dimensions()
	if resp:
		return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('No services have been registered!'), mimetype='application/json')


"""
*********************************************************************************************************
External APIs from LinkedTV WP2
*********************************************************************************************************
"""

"""This is called when using a DBPedia autocomplete field in the UI"""
def autocomplete(request):
	term = request.GET.get('term', None)
	vocab = request.GET.get('vocab', 'DBpedia')
	conceptScheme = request.GET.get('cs', None) #only for GTAA
	options = None
	if term:
		if vocab == 'DBpedia':
			ac = AutoComplete()
			options = ac.autoComplete(term)
			if options:
				resp = simplejson.dumps(options)
				return HttpResponse(resp, mimetype='application/json')
			else:
				return HttpResponse(self.__getErrorMessage('Nothing found'), mimetype='application/json')
		elif vocab == 'GTAA':
			handler = OpenSKOSHandler()
			resp = handler.autoCompleteTable(term.lower(), conceptScheme)
			return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(self.__getErrorMessage('Please specify a search term'), mimetype='application/json')

def entityproxy(request):
	uri = request.GET.get('uri', None)
	lang = request.GET.get('lang', None)
	if uri:
		ep = EntityProxy()
		resp = ep.fetch(uri, lang)
		return HttpResponse(resp, mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide a DBPedia URI'), mimetype='application/json')

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
			return HttpResponse(__getErrorMessage('Could not find any entities'), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')


