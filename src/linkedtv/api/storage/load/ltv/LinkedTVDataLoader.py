import simplejson
from simplejson import JSONDecodeError
import logging
import redis
import base64
import httplib2

from linkedtv.api.storage.load.ltv.LinkedTVSubtitleLoader import LinkedTVSubtitleLoader
from linkedtv.api.storage.load.ltv.LinkedTVDataUtils import LinkedTVDataUtils
from linkedtv.api.storage.load.ltv.video.VideoPlayoutHandler import VideoPlayoutHandler
from linkedtv.utils.TimeUtils import *
from linkedtv.text.TextAnalyzer import *
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN, LTV_SPARQL_ENDPOINT, LTV_STOP_FILE
from linkedtv.model import *
from linkedtv.api.storage.load.DataLoader import DataLoader
from linkedtv.api.entities.ltv.TopicIdentificationService import TopicIdentificationService

logger = logging.getLogger(__name__)

"""
TODO properly handle communications in case the Redis store is not running
"""

class LinkedTVDataLoader(DataLoader):

	def __init__(self):
		super(DataLoader, self).__init__()
		#due to possible slow loading times, this dataloader also offers caching possibilities
		self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])
		self.GRAPH = 'http://data.linkedtv.eu/graph/linkedtv'

	#implementation of DataLoader function
	def loadMediaResourceData(self, resourceUri, clientIP, loadAnnotations):
		mediaResource = MediaResource()
		#load the annotations if desired
		if loadAnnotations:
			mediaResource = self.__getAllAnnotationsOfResource(resourceUri, False)

		#fetch the video metadata
		videoMetadata = self.__getVideoData(resourceUri)
		vd = None
		if videoMetadata:
			vd = simplejson.loads(videoMetadata)
		mr = None
		if vd and mediaResource:
			#set the all the video metadata to be sure
			mediaResource.setVideoMetadata(vd)

			#make sure there is a mediaresource
			if vd.has_key('mediaResource'):
				mr = vd['mediaResource']

				#get the playout URL
				if mr.has_key('locator'):
					vph = VideoPlayoutHandler()
					playoutURL = vph.getPlayoutURL(mr['locator'], clientIP)
					mediaResource.setPlayoutUrl(playoutURL)

				#set the video metadata in the mediaresource
				mediaResource.setTitle(mr['titleName'])
				mediaResource.setDate(self.__getDateFromVideoTitle(mr['titleName']))
				if mr.has_key('mediaResourceRelationSet'):
					for mrr in mr['mediaResourceRelationSet']:
						if mrr['relationType'] == 'thumbnail-locator':
							mediaResource.setThumbBaseUrl(mrr['relationTarget'])
						elif mrr['relationType'] == 'srt':
							mediaResource.setSrtUrl(mrr['relationTarget'])
						elif mrr['relationType'] == 'asr-srt':#todo test this!
							mediaResource.setSrtUrl(mrr['relationTarget'])

		#get the subtitles if desired
		subLoader = LinkedTVSubtitleLoader()
		subs = subLoader.loadSubtitles(resourceUri)
		mediaResource.setSubtitles(subs)

		#transform the mediaresource object to JSON and return it
		resp = simplejson.dumps(mediaResource, default=lambda obj: obj.__dict__)
		return resp

	#implementation of DataLoader function
	def loadMediaResources(self, provider):
		videos = []
		videoUris = self.__loadMediaResources(provider)
		for uri in videoUris['videos']:
			vd = None
			thumbBaseUrl = None
			video = None
			vd = self.__getVideoData(uri)
			if vd:
				vd = simplejson.loads(vd)
				if vd['mediaResource']:
					if vd['mediaResource'].has_key('mediaResourceRelationSet') and vd['mediaResource']['mediaResourceRelationSet']:
						for mrr in vd['mediaResource']['mediaResourceRelationSet']:
							if mrr['relationType'] == 'thumbnail-locator':
								thumbBaseUrl = mrr['relationTarget']
					video = {
						'id' : vd['mediaResource']['id'],
						'title' : vd['mediaResource']['titleName'],
						'date' : self.__getDateFromVideoTitle(vd['mediaResource']['titleName']),
						'locator' : vd['mediaResource']['locator'],
						'thumbBaseUrl' : thumbBaseUrl,
						'thumbUrl' : '%sh/0/m/1/sec0.jpg' % thumbBaseUrl,
						'dateInserted' : vd['mediaResource']['dateInserted']#TODO convert to pretty date
					}
					videos.append(video)
		return {'videos' : videos}

	def reindex(self, provider = None):
		return False

	#directly uses the linkedTV platform
	def __getVideoData(self, resourceUri):
		pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
		http = httplib2.Http()
		url = 'http://api.linkedtv.eu/mediaresource/%s' % resourceUri
		headers = {
		'Accept' : 'application/json',
		'Authorization' : 'Basic %s' % pw,
		}
		resp, content = http.request(url, 'GET', headers=headers)
		if resp and resp['status'] == '200':
			return content
		return None

	def __getDateFromVideoTitle(self, title):
		#e.g. TITLE= rbb AKTUELL vom 26.01.2013 Teil 2 - Kein Zug fur Meyenburg
		date = None
		if title:
			t_arr = title.split(' ')
			for t in t_arr:
				if t.find('.') != -1:
					d_arr = t.split('.')
					if len(d_arr) == 3:
						date = '%s%s%s' % (d_arr[2], d_arr[1], d_arr[0])
						break
		return date

	def __getAllAnnotationsOfResource(self, resourceUri, fetchFromCache=False):
		print 'Getting %s from the API or cache' % resourceUri
		data = None
		if fetchFromCache:
			if self.cache.exists(resourceUri):
				print 'Exists in cache!'
				data = simplejson.loads(self.cache.get(resourceUri))
			else:
				print 'No cache for you, one year!'
				data = self.__loadMediaResourceData(MediaResource(resourceUri))
				self.cache.set(resourceUri, simplejson.dumps(data))
		else:
			print 'fetching from API'
			data = self.__loadMediaResourceData(MediaResource(resourceUri))
			self.cache.set(resourceUri, simplejson.dumps(data, default=lambda obj: obj.__dict__))
			return data

	def __loadMediaResources(self, publisher, format='json'):
		query = []
		query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
		query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
		query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
		query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
		query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
		query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
		query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
		query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
		query.append('SELECT DISTINCT ?locator ?medialocator ')
		query.append('FROM <%s> ' % self.GRAPH)
		query.append('WHERE { ')
		query.append('?medialocator ma:locator ?locator . ')
		query.append('?mf ma:isFragmentOf ?medialocator . ')
		query.append('?mf rdf:type ma:MediaFragment . ')
		query.append('?annotation oa:hasTarget ?mf . ')
		query.append('}')
		#print ''.join(query)
		resp = LinkedTVDataUtils.sendSearchRequest(''.join(query))
		jsonData = None
		try:
			jsonData = simplejson.loads(resp)
		except JSONDecodeError, e:
			print e
		locs = []
		found = False
		if jsonData:
			for k in jsonData['results']['bindings']:
				if k.has_key('medialocator') and k.has_key('locator'):
					if publisher == 'sv':
						found = k['locator']['value'].find('SV') != -1 or k['locator']['value'].find('avro') != -1
					else:
						found = k['locator']['value'].find(publisher) != -1
					if found:
						loc = k['medialocator']['value']
						loc = loc[len(LinkedTVDataUtils.LINKEDTV_MEDIA_RESOURCE_PF):]
						locs.append(loc)
		return {'videos' : locs}

	def __loadMediaResourceData (self, mediaResource):
		"""Otherwise get query it from the SPARQL end-point"""
		query = []
		query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
		query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
		query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
		query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
		query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
		query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
		query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
		query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')

		query.append('SELECT DISTINCT ?annotation ?start ?end ?label ?RDFType ?DCType ?OWLSameAs ?c ?r ')
		query.append('FROM <%s> ' % self.GRAPH)
		query.append('WHERE { ')
		query.append('?mf ma:isFragmentOf <%s%s> . ' % (LinkedTVDataUtils.LINKEDTV_MEDIA_RESOURCE_PF, mediaResource.getId()))
		query.append('?mf nsa:temporalStart ?start . ')
		query.append('?mf nsa:temporalEnd ?end . ')
		query.append('?annotation oa:hasTarget ?mf . ')
		query.append('?annotation rdf:type <http://www.w3.org/ns/oa#Annotation> . ')
		query.append('?annotation oa:hasBody ?body . ')

		"""To make sure that no enrichments are selected"""
		query.append('OPTIONAL { ?annotationy oa:motivatedBy ?motivation . FILTER (?annotation = ?annotationy) . } ')
		query.append('FILTER ( !BOUND(?annotationy) ) ')

		query.append('OPTIONAL {?body dc:type ?DCType } ') #dit wordt gebruikt voor NE extractor types
		query.append('OPTIONAL {?body rdf:type ?RDFType} ') #dit wordt gebruikt voor de NERD & CERTH ontologies
		query.append('OPTIONAL {?body owl:sameAs ?OWLSameAs} ') #dit wordt gebruikt voor CERTH en ook NE wiki/dbpedia links
		query.append('OPTIONAL {?body linkedtv:hasConfidence ?c } ')
		query.append('OPTIONAL {?body linkedtv:hasRelevance ?r } ')
		query.append('OPTIONAL {?body rdfs:label ?label}')
		query.append('}')
		print '\n\n'
		print ''.join(query)
		#logger.debug(''.join(query))
		resp = LinkedTVDataUtils.sendSearchRequest(''.join(query))
		jsonData = None
		try:
			jsonData = simplejson.loads(resp)
		except JSONDecodeError, e:
			logger.error(e)
		if jsonData:
			concepts = []
			nes = []
			shots = []
			chapters = []
			for k in jsonData['results']['bindings']:
				annotationURI = label = RDFType = DCType = OWLSameAs = r = c = ''
				start = end = 0
				if k.has_key('annotation'): annotationURI = k['annotation']['value']
				if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
				if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
				if k.has_key('label'): label = k['label']['value']
				if k.has_key('c'): c = k['c']['value']
				if k.has_key('r'): r = k['r']['value']
				if k.has_key('RDFType'): RDFType = k['RDFType']['value']
				if k.has_key('DCType'): DCType = k['DCType']['value']
				if k.has_key('OWLSameAs'): OWLSameAs = k['OWLSameAs']['value']
				if RDFType == '%sConcept' % LinkedTVDataUtils.LINKEDTV_ONTOLOGY_PF:
					concepts.append(Concept(
						label,
						start=start,
						end=end,
						link=OWLSameAs,
						annotationURI=annotationURI,
						relevance=r,
						confidence=c
						))
				elif RDFType == '%sShot' % LinkedTVDataUtils.LINKEDTV_ONTOLOGY_PF:
					shots.append(Shot(
						label,
						start=start,
						end=end,
						annotationURI=annotationURI,
						relevance=r,
						confidence=c
						))
				elif RDFType == '%sChapter' % LinkedTVDataUtils.LINKEDTV_ONTOLOGY_PF:
					chapters.append(Chapter(
						label,
						start=start,
						end=end,
						annotationURI=annotationURI,
						relevance=r,
						confidence=c
						))
				elif RDFType.find(LinkedTVDataUtils.NERD_ONTOLOGY_PF) != -1:
					nes.append(NamedEntity(
						label,
						entityType=LinkedTVDataUtils.getNEType(DCType, RDFType, OWLSameAs),
						subTypes=LinkedTVDataUtils.getDCTypes(DCType),
						disambiguationURL=OWLSameAs,
						start=start,
						end=end,
						annotationURI=annotationURI,
						relevance=r,
						confidence=c
						))

			#load the autogenerated enrichments
			#enrichments = self.__loadAutogenEnrichmentsOfMediaResource(mediaResource.getId())
			enrichments = []

			#add all of the loaded data to the media resource
			mediaResource.setConcepts(concepts)
			mediaResource.setShots(shots)
			mediaResource.setChapters(chapters)
			mediaResource.setEnrichments(enrichments)

			#do some processing on the entities before adding them to the mediaResource
			#tis = TopicIdentificationService()
			temp = LinkedTVDataUtils.filterStopWords(nes)
			#tis.categorizeEntities(temp) TODO the service response needs to be improved first
			mediaResource.setNamedEntities(temp)

			return mediaResource
		return None

	"""
	This function (should) return a dictionary with key=NElabel value=list of hyperlinks
	TODO: the RDF data is not yet available and therefore this function has to be tested still!!
	"""
	def __loadAutogenEnrichmentsOfMediaResource(self, mediaResourceID):
		query = []
		query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
		query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
		query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
		query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
		query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
		query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
		query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
		query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
		query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')

		query.append('SELECT DISTINCT ?annotation ?entity ?entityLabel ?source ?date ?creator ?deeplink ?partOf ?poster ?socialInteraction ')
		query.append('?DCType ?start ?end ')
		query.append('FROM <%s> ' % self.GRAPH)
		query.append('WHERE { ')
		query.append('?mf ma:isFragmentOf <%s%s> . ' % (LinkedTVDataUtils.LINKEDTV_MEDIA_RESOURCE_PF, mediaResourceID))
		query.append('?mf nsa:temporalStart ?start . ')
		query.append('?mf nsa:temporalEnd ?end . ')
		query.append('?annotation oa:hasTarget ?mf . ')
		query.append('?annotation rdf:type <http://www.w3.org/ns/oa#Annotation> . ')
		query.append('?annotation oa:motivatedBy oa:linking . ')
		query.append('?annotation oa:hasBody ?body . ')

		#later on there could be more than one related entity!!! Need to update this!
		query.append('?annotation prov:wasDerivedFrom ?entity . ')
		query.append('?entity rdfs:label ?entityLabel ')

		query.append('OPTIONAL {?body dc:type ?DCType } ')
		query.append('OPTIONAL {?body linkedtv:hasPoster ?poster } ')
		query.append('OPTIONAL {?body linkedtv:hasSocialInteraction ?socialInteraction } ')
		#query.append('OPTIONAL {?body rdf:type ?RDFType} ')
		query.append('OPTIONAL {?body dc:source ?source} ')
		query.append('OPTIONAL {?body dc:date ?date } ')
		query.append('OPTIONAL {?body ma:locator ?deeplink} ')
		query.append('OPTIONAL {?body dc:isPartOf ?partOf} ')
		query.append('OPTIONAL {?body dc:creator ?creator} ')
		#query.append('OPTIONAL {?body dc:description ?desc . ?desc <http://nlp2rdf.lod2.eu/schema/string/label> ?label}')
		query.append('}')
		print ''.join(query)
		resp = LinkedTVDataUtils.sendSearchRequest(''.join(query))
		jsonData = None
		try:
			jsonData = simplejson.loads(resp)
		except JSONDecodeError, e:
			print e
		enrichments = []
		if jsonData:
			for k in jsonData['results']['bindings']:
				uri = entityURI = entityLabel = source = date = creator = deeplink = partOf = enrichmentType = ''
				socialInteraction = poster = annotationURI = ''
				start = end = 0
				if k.has_key('entity'): entityURI = k['entity']['value']
				if k.has_key('annotation'): annotationURI = k['entity']['value']
				if k.has_key('entityLabel'): entityLabel = k['entityLabel']['value']
				if k.has_key('source'): source = k['source']['value']
				if k.has_key('date'): date = k['date']['value']
				if k.has_key('creator'): creator = k['creator']['value']
				if k.has_key('deeplink'): deeplink = k['deeplink']['value']
				if k.has_key('partOf'): partOf = k['partOf']['value']
				if k.has_key('DCType'): enrichmentType = k['DCType']['value'] # either image/video or something else...
				if k.has_key('poster'): poster = k['poster']['value']
				if k.has_key('socialInteraction'): socialInteraction = k['socialInteraction']['value']
				if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
				if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])

				#TODO update when there are more!
				entities = [Entity(entityURI, entityLabel)]
				enrichments.append(Enrichment(
					entityLabel,
					annotationURI=annotationURI,
					start=start,
					end=end,
					relevance=1,
					confidence=1,
					url=deeplink,
					poster=poster,
					source=source,
					creator=creator,
					date=date,
					entities=entities,
					enrichmentType=enrichmentType
					))

		return enrichments
