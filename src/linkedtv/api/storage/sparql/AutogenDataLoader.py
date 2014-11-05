import simplejson
from simplejson import JSONDecodeError
import logging

from linkedtv.LinkedtvSettings import LTV_SAVE_GRAPH
from linkedtv.utils.TimeUtils import *
from linkedtv.model import *
from linkedtv.api.storage.sparql.DataLoader import DataLoader

logger = logging.getLogger(__name__)

class AutogenDataLoader(DataLoader):

	def __init__(self):
		super(AutogenDataLoader, self).__init__()
		self.LINKEDTV_MEDIA_RESOURCE_PF = 'http://data.linkedtv.eu/media/'
		
		"""Prefixes/ontologies used for the annotation body type, i.e. rdf:type"""
		self.LINKEDTV_ONTOLOGY_PF = 'http://data.linkedtv.eu/ontologies/core#' #'http://data.linkedtv.eu/ontology/'
		self.LINKEDTV_DATA_PF = 'http://data.linkedtv.eu/'
		self.NERD_ONTOLOGY_PF = 'http://nerd.eurecom.fr/ontology#'
		
		self.PROV_ET = 'http://data.linkedtv.eu/organization/SV/EditorTool'
		self.ET_GRAPH = LTV_SAVE_GRAPH
		
		self.GRAPH = 'http://data.linkedtv.eu/graph/linkedtv'
		
		"""Used for the owl:sameAs"""
		self.DBPEDIA_ONTOLOGY_PF = 'http://dbpedia.org/ontology/'
		self.NL_WIKIPEDIA_PF = 'http://nl.wikipedia.org/wiki/'
		self.DE_WIKIPEDIA_PF = 'http://de.wikipedia.org/wiki/'
		self.EN_WIKIPEDIA_PF = 'http://en.wikipedia.org/wiki/'

	"""maps to videos API call"""
	def getMediaResources(self, publisher, format='json'):
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
		resp = super(AutogenDataLoader, self).sendSearchRequest(''.join(query))
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
						loc = loc[len(self.LINKEDTV_MEDIA_RESOURCE_PF):]
						locs.append(loc)
		return {'videos' : locs}
	

	"""maps to load_ltv API call"""
	def loadMediaResource(self, mediaResourceID, locator = None):
		mr = MediaResource(mediaResourceID)		
		mr = self.__loadAutogenMediaResourceData(mr)
		print mr
		return mr       
	
	def __loadAutogenMediaResourceData (self, mediaResource):        
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
		
		query.append('SELECT DISTINCT ?mf ?annotation ?body ?start ?end ?label ?RDFType ?DCType ?OWLSameAs ?c ?r ')
		query.append('FROM <%s> ' % self.GRAPH)
		query.append('WHERE { ')
		query.append('?mf ma:isFragmentOf <%s%s> . ' % (self.LINKEDTV_MEDIA_RESOURCE_PF, mediaResource.getId()))
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
		print ''.join(query)
		#logger.debug(''.join(query))
		resp = super(AutogenDataLoader, self).sendSearchRequest(''.join(query))
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
				mfURI = annotationURI = bodyURI = label = RDFType = DCType = OWLSameAs = r = c = ''
				start = end = 0
				if k.has_key('mf'): mfURI = k['mf']['value']
				if k.has_key('annotation'): annotationURI = k['annotation']['value']
				if k.has_key('body'): bodyURI = k['body']['value']                
				if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
				if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
				if k.has_key('label'): label = k['label']['value']
				if k.has_key('c'): c = k['c']['value']
				if k.has_key('r'): r = k['r']['value']
				if k.has_key('RDFType'): RDFType = k['RDFType']['value']
				if k.has_key('DCType'): DCType = k['DCType']['value']
				if k.has_key('OWLSameAs'): OWLSameAs = k['OWLSameAs']['value']                
				if RDFType == '%sConcept' % self.LINKEDTV_ONTOLOGY_PF:                    
					concepts.append(Concept(label, start, end, OWLSameAs, mfURI, annotationURI, bodyURI, r, c))
				elif RDFType == '%sShot' % self.LINKEDTV_ONTOLOGY_PF:                    
					shots.append(Shot(label, start, end, mfURI, annotationURI, bodyURI, r, c))
				elif RDFType == '%sChapter' % self.LINKEDTV_ONTOLOGY_PF:
					chapters.append(Chapter(label, start, end, mfURI, annotationURI, bodyURI, r, c))
				elif RDFType.find(self.NERD_ONTOLOGY_PF) != -1:
					nes.append(NamedEntity(label, super(AutogenDataLoader, self).getNEType(DCType, RDFType, OWLSameAs), 
						super(AutogenDataLoader, self).getDCTypes(DCType), OWLSameAs, start, end, mfURI, annotationURI, bodyURI, r, c))
			
			#load the autogenerated enrichments        
			enrichments = self.__loadAutogenEnrichmentsOfMediaResource(mediaResource.getId())

			#add all of the loaded data to the media resource
			mediaResource.setConcepts(concepts)
			mediaResource.setNamedEntities(super(AutogenDataLoader, self).filterStopWords(nes))
			mediaResource.setShots(shots)
			mediaResource.setChapters(chapters)
			mediaResource.setEnrichments(enrichments)
			
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
		
		query.append('SELECT DISTINCT ?body ?entity ?entityLabel ?source ?date ?creator ?deeplink ?partOf ?poster ?socialInteraction ')
		query.append('?DCType ?start ?end ')
		query.append('FROM <%s> ' % self.GRAPH)
		query.append('WHERE { ')
		query.append('?mf ma:isFragmentOf <%s%s> . ' % (self.LINKEDTV_MEDIA_RESOURCE_PF, mediaResourceID))
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
		logger.debug(''.join(query))
		resp = super(AutogenDataLoader, self).sendSearchRequest(''.join(query))
		jsonData = None
		try:
			jsonData = simplejson.loads(resp)
		except JSONDecodeError, e:
			print e
		enrichments = []
		if jsonData:
			for k in jsonData['results']['bindings']:
				uri = entityURI = entityLabel = source = date = creator = deeplink = partOf = DCType = ''
				socialInteraction = poster = ''
				start = end = 0
				if k.has_key('body'): bodyURI = k['body']['value']            
				if k.has_key('entity'): entityURI = k['entity']['value']
				if k.has_key('entityLabel'): entityLabel = k['entityLabel']['value']
				if k.has_key('source'): source = k['source']['value']
				if k.has_key('date'): date = k['date']['value']
				if k.has_key('creator'): creator = k['creator']['value']
				if k.has_key('deeplink'): deeplink = k['deeplink']['value']
				if k.has_key('partOf'): partOf = k['partOf']['value']
				if k.has_key('DCType'): DCType = k['DCType']['value']
				if k.has_key('poster'): poster = k['poster']['value']
				if k.has_key('socialInteraction'): socialInteraction = k['socialInteraction']['value']
				if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
				if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
				
				#TODO update when there are more!
				entities = [Entity(entityURI, entityLabel)]
				enrichments.append(Enrichment(entityLabel, start, end, None, None, bodyURI, 1, 1, deepLink, poster, source,
					creator, date, entities, socialInteraction, DCType))

		return enrichments
	
