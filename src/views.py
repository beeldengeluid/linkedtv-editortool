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

#external services (relocate this somewhere else)
from linkedtv.api.vocabulary.dbpedia.AutoComplete import AutoComplete
from linkedtv.api.vocabulary.dbpedia.EntityProxy import EntityProxy
from linkedtv.api.vocabulary.gtaa.OpenSKOSHandler import OpenSKOSHandler
from linkedtv.api.entities.ltv.EntityExpansionService import EntityExpansionService

from linkedtv.api.Api import *


"""
*********************************************************************************************************
Local helper functions
*********************************************************************************************************
"""

def __getErrorMessage(msg):
	return "{\"error\" : \"%s\"}" % msg

def __getOkMessage():
	return "{\"success\" : \"OK\"}"

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
API - Loading / saving / publishing / synchronizing
*********************************************************************************************************
"""

"""This is called to fetch the data of a single media resource"""
def load(request):
	platform = request.GET.get('p', None)
	resourceUri = request.GET.get('id', None)
	loadData = request.GET.get('ld', 'false') == 'true'
	clientIP = __getClientIP(request)
	if platform and resourceUri:
		api = Api()
		resp = api.load(platform, resourceUri, clientIP, loadData)
		return HttpResponse(resp, mimetype='application/json')
	return HttpResponse(__getErrorMessage('The resource does not exist'), mimetype='application/json')

"""This is called to fetched the curated data from the Redis store"""
def load_curated(request):
	resourceUri = request.GET.get('id', None)
	loadGroundTruth = request.GET.get('gt', None) == 'true'
	if resourceUri:
		api = Api()
		resp = api.load_curated(resourceUri, loadGroundTruth)
		if resp:
			httpResp = HttpResponse(simplejson.dumps(resp), mimetype='application/json')
			#to enable CORS
			httpResp['Access-Control-Allow-Origin'] = '*'
			return httpResp
	return HttpResponse(__getErrorMessage('Could not load curated data'), mimetype='application/json')

@csrf_exempt
def save(request):
	saveData = request.body
	api = Api()
	resp = api.save(saveData)
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

def synchronize(request):
	resourceUri = request.GET.get('uri', None)
	platform = request.GET.get('platform', None)
	provider = request.GET.get('p', None)
	if resourceUri and platform and provider:
		api = Api()
		success = api.synchronize(platform, resourceUri, provider)
		if success:
			return HttpResponse(__getOkMessage(), mimetype='application/json')
		else:
			return HttpResponse(__getErrorMessage('Failed to synchronize with the SOLR index'), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

@csrf_exempt
def synchronize_chapter(request):
	data = request.body
	try:
		data = simplejson.loads(data)
	except JSONDecodeError, e:
		data = None
	if data and data.has_key('platform'):
		api = Api()
		solrId = api.synchronize_chapter(data['platform'], data)
		resp = {'solrId' : solrId, 'guid' : data['chapter']['guid']}#solrId should be abstracted
		return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct POST data'), mimetype='application/json')

@csrf_exempt
def disconnect_chapter(request):
	data = request.body
	try:
		data = simplejson.loads(data)
	except JSONDecodeError, e:
		data = None
	if data.has_key('id') and data.has_key('provider') and data.has_key('platform'):
		api = Api()
		success = api.disconnect_chapter(data['platform'], data['id'], data['provider'])
		if success:
			return HttpResponse(__getOkMessage(), mimetype='application/json')
		else:
			return HttpResponse(__getErrorMessage('Failed to delete the chapter from the index'), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct POST data'), mimetype='application/json')

"""
*********************************************************************************************************
API - Content related calls
*********************************************************************************************************
"""

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
	platform = request.GET.get('p', None)
	contentProvider = request.GET.get('cp', None)
	if platform and contentProvider:
		api = Api()
		resp = api.videos(platform, contentProvider)
		if resp:
			return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

def reindex(request):
	platform = request.GET.get('p', None)
	contentProvider = request.GET.get('cp', None)
	if platform:
		api = Api()
		resp = api.reindex(platform, contentProvider)
		if resp:
			return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')


def subtitles(request):
	resourceUri = request.GET.get('uri', None)
	start = request.GET.get('start', -1)
	end = request.GET.get('end', -1)
	if resourceUri and (int(end) > int(start) or (end == -1 and start == -1)):
		api = Api()
		resp = api.subtitles(resourceUri, int(start), int(end))
		if resp:
			return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')

"""
*********************************************************************************************************
API - Dimension services
*********************************************************************************************************
"""

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
			print resp
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
API - Logging user actions
*********************************************************************************************************
"""

@csrf_exempt
def log(request):
	logData = request.body
	if logData:
		api = Api()
		success = api.log(simplejson.loads(logData))
		if success:
			return HttpResponse(__getOkMessage(), mimetype='application/json')
	return HttpResponse(__getErrorMessage('There was an error while processing the log data'), mimetype='application/json')

def showlogs(request):
	api = Api()
	resp = api.showlogs()
	if resp:
		return HttpResponse(simplejson.dumps(resp), mimetype='application/json')
	return HttpResponse(__getErrorMessage('There are currently no log records available'), mimetype='application/json')

"""
*********************************************************************************************************
External APIs from LinkedTV WP2
*********************************************************************************************************
"""

#TODO move the logic in this function to a dedicated handler class
def autocomplete(request):
	term = request.GET.get('term', None)
	vocab = request.GET.get('vocab', 'DBpedia')
	conceptScheme = request.GET.get('cs', None) #only for GTAA (not used yet!!)
	if term:
		options = None
		if vocab == 'DBpedia':
			ac = AutoComplete()
			options = ac.autoComplete(term)
		elif vocab == 'GTAA':
			handler = OpenSKOSHandler()
			options = handler.autoCompleteTable(term.lower(), conceptScheme)
		if options:
			return HttpResponse(simplejson.dumps(options), mimetype='application/json')
		else:
			return HttpResponse(__getErrorMessage('Nothing found'), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please specify a search term'), mimetype='application/json')

#TODO move the logic in this function to a dedicated handler class
def entityproxy(request):
	uri = request.GET.get('uri', None)
	lang = request.GET.get('lang', None)
	if uri:
		if uri.find('http://data.beeldengeluid.nl/gtaa') == -1:
			ep = EntityProxy()
			resp = ep.fetch(uri, lang)
		else:
			skos = OpenSKOSHandler()
			resp = skos.getConceptDetails(uri)
		return HttpResponse(resp, mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide a DBPedia URI'), mimetype='application/json')

#TODO relocate this to a generic handler that takes care of (named) entities
def entityexpand(request):
	url = request.GET.get('url', None)
	start = request.GET.get('start', -1)
	end = request.GET.get('end', -1)
	date = request.GET.get('date', None)
	if url and (int(end) > int(start) or (end == -1 and start == -1)):
		ees = EntityExpansionService()
		resp = ees.fetch(url, date, int(start), int(end))
		if resp:
			return HttpResponse(simplejson.dumps(resp, default=lambda obj: obj.__dict__), mimetype='application/json')
		else:
			return HttpResponse(__getErrorMessage('Could not find any entities'), mimetype='application/json')
	return HttpResponse(__getErrorMessage('Please provide the correct parameters'), mimetype='application/json')
