# -*- coding: utf-8 -*-

"""
RDF LIB (not used right now)
http://stackoverflow.com/questions/20074620/installing-pyodbc-fails-on-osx-10-9-mavericks
http://river.styx.org/ww/2010/10/pyodbc-spasql/index
https://pythonhosted.org/virtuoso/installation.html

TIME FORMAT
2014-08-28T19:50:08.004Z

"""

from datetime import datetime
from subprocess import Popen, PIPE
import uuid
import urllib
import simplejson
from simplejson import JSONDecodeError
from linkedtv.api.storage.publish.PublishingPoint import PublishingPoint
from linkedtv.utils.TimeUtils import TimeUtils
#from linkedtv.LinkedtvSettings import LTV_SAVE_GRAPH, LTV_SPARQL_ENDPOINT


class LinkedTVPublishingPoint(PublishingPoint):

	def __init__(self):
		print self.__getCurrentDateTime()
		#connection details
		#self.SPARQL_ENDPOINT = 'http://zorin.beeldengeluid.nl:3020/sparql/'
		self.SPARQL_ENDPOINT = 'http://data.linkedtv.eu/sparql'
		self.SAVE_GRAPH = 'http://data.linkedtv.eu/graph/et_v2'

		#save types
		self.DELETE_ACTION = 'delete'
		self.SAVE_ACTION = 'save'

		#external ontology prefixes
		self.NERD_ONTO_PF = 'http://nerd.eurecom.fr/ontology#'
		self.DBPEDIA_ONTOLOGY_PF = 'http://dbpedia.org/ontology'

		#annotation type prefixes
		self.LTV_ONTO_PF = 'http://data.linkedtv.eu/ontologies/core#'
		self.LTV_ENTITY_PF = 'http://data.linkedtv.eu/entity'
		self.LTV_INFORMATION_CARD_PF = 'http://data.linkedtv.eu/informationcard'
		self.LTV_CHAPTER_PF = 'http://data.linkedtv.eu/chapter'
		self.LTV_ANNOTATION_PF = 'http://data.linkedtv.eu/annotation'
		self.LTV_MEDIA_PF = 'http://data.linkedtv.eu/media'

		#motivation
		self.MOTIVATION_LINKING = 'http://www.w3.org/ns/oa#linking'

		#RDF types
		self.MEDIA_FRAGMENT = 'http://www.w3.org/ns/ma-ont#MediaFragment'
		self.MEDIA_FRAGMENT_NINSUNA = 'http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#TemporalFragment'
		self.OA_ANNOTATION = 'http://www.w3.org/ns/oa#Annotation'
		self.PROV_ENTITY = 'http://www.w3.org/ns/prov#Entity'
		self.MEDIA_RESOURCE = 'http://www.w3.org/ns/ma-ont#MediaResource'
		self.RELATED_CONTENT = 'http://data.linkedtv.eu/ontologies/core#RelatedContent'

		#default confidence and relevance
		self.ET_CONFIDENCE = '1'
		self.ET_RELEVANCE = '1'

		#provenance
		self.PROV_ET_SOURCE = 'editor_tool'
		self.PROV_ET_URI = 'http://data.linkedtv.eu/organization/SV/EditorTool'

	def publish(self, mediaResource):		
		#TODO implement the adding of triples to the LinkedTV store
		return self.__saveMediaResourceTriples(mediaResource, self.SAVE_ACTION)

	def unpublish(self, mediaResource):
		print 'unpublishing this mediaresource'
		#return self.__saveMediaResourceTriples(mediaResource, self.DELETE_ACTION)
		self.__deleteCuratedDataFromMediaResource(mediaResource)
		return mediaResource

	def __saveMediaResourceTriples(self, mediaResource, action):
		self.__deleteCuratedDataFromMediaResource(mediaResource)
		print 'Saving mediaresource: %s' % mediaResource.getId()
		for chapter in mediaResource.getChapters():
			if chapter.getType() == 'curated':
				print 'Saving curated chapter'
				resourceUris = self.__saveChapterTriples(mediaResource.getId(), chapter, action)
				if resourceUris:
					chapter.setMfURI(resourceUris['mfURI'])
					chapter.setAnnotationURI(resourceUris['annotationURI'])
					chapter.setBodyURI(resourceUris['bodyURI'])
		return mediaResource


	def __saveChapterTriples(self, mediaResourceUri, chapter, action):
		print 'Saving chapter (%s): %s' % (action, chapter.getLabel())
		dimensions = chapter.getDimensions()
		for k in dimensions.keys():			
			d = dimensions[k]
			for a in d.getAnnotations():
				resourceUris = self.__saveAnnotationTriples(mediaResourceUri, d, a, action)
				if resourceUris:
					a.setMfURI(resourceUris['mfURI'])
					a.setAnnotationURI(resourceUris['annotationURI'])
					a.setBodyURI(resourceUris['bodyURI'])				
				for e in a.getEntities():
					etURI = self.__saveEntityTriples(a.getAnnotationURI(), e, action)
					e.setEtURI(etURI)

		print '-' * 150

		#prepare some variables
		start = TimeUtils.toStringSeconds(chapter.getStart())
		end = TimeUtils.toStringSeconds(chapter.getEnd())
		duration = TimeUtils.toStringSeconds(int(chapter.getEnd()) - int(chapter.getStart()))
		
		#Head part of the query
		query = self.__getQueryPrefix()

		#Construct the DELETE part of the query and make sure to initialize the mfURI, bodyURI and aURI
		query.append('WITH <%s> ' % self.SAVE_GRAPH)
		#query.append('DELETE { ')
		#construct the media fragment URI
		if chapter.getMfURI():
			mfURI = chapter.getMfURI()
			#query.append('<%s> ?p1 ?o1 . ' % mfURI)
		else:
			mfURI = '%s/%s#t=%s,%s' % (self.LTV_MEDIA_PF, uuid.uuid1(), start, end)
		#construct the body URI
		if chapter.getBodyURI():
			bodyURI = chapter.getBodyURI()
			#query.append('<%s> ?p2 ?o2 . ' % bodyURI)
		else:
			bodyURI = '%s/%s' % (self.LTV_CHAPTER_PF, uuid.uuid1())  
		#construct the annotation URI
		if chapter.getAnnotationURI():
			aURI = chapter.getAnnotationURI()
			#query.append('<%s> ?p3 ?o3' % aURI)
		else:
			aURI = '%s/%s' % (self.LTV_ANNOTATION_PF, uuid.uuid1())
		#query.append('} ')
		
		#Do not INSERT data when the action is DELETE_ACTION
		if(action == self.SAVE_ACTION):
			query.append('INSERT { ')
			
			#media fragment
			query.append('<%s> rdf:type <%s> ; ' % (mfURI, self.MEDIA_FRAGMENT))
			query.append('rdf:type <%s> ; ' % self.MEDIA_FRAGMENT_NINSUNA)
			query.append('ma:isFragmentOf <%s/%s> ; ' % (self.LTV_MEDIA_PF, mediaResourceUri))
			query.append('ma:duration "%s"^^xsd:float ; ' % duration)
			query.append('nsa:temporalStart "%s"^^xsd:float ; ' % start)
			query.append('nsa:temporalEnd "%s"^^xsd:float ; ' % end)
			query.append('nsa:temporalUnit "npt" . ')

			#body -> type=chapter + label
			query.append('<%s> rdf:type <%sChapter> ; ' % (bodyURI, self.LTV_ONTO_PF))
			query.append('rdfs:label "%s"' % chapter.getLabel())
			if chapter.getPoster():
				query.append(' ; linkedtv:hasPoster <%s>' % chapter.getPoster())
			query.append(' . ')

			#annotation targets the media fragment & links to the body
			query.append('<%s> rdf:type <%s> ; ' % (aURI, self.OA_ANNOTATION))
			query.append('rdf:type <%s> ; ' % self.PROV_ENTITY)
			query.append('oa:hasTarget <%s> ; ' % mfURI)
			query.append('oa:hasBody <%s> ; ' % bodyURI)
			query.append('prov:wasAttributedTo <%s> ; ' % self.PROV_ET_URI)
			query.append('prov:startedAtTime "%s"^^xsd:dateTime . ' % self.__getCurrentDateTime())


			query.append('} ')
		"""
		#query.append('WHERE {')
		#Only for UPDATE and DELETE, otherwise only the INSERT part is executed (with an empty DELETE block)
		if chapter.getMfURI():
			query.append('<%s> ?p1 ?o1 . ' % mfURI)
			query.append('<%s> ?p2 ?o2 . ' % bodyURI)
			query.append('<%s> ?p3 ?o3' % aURI)
		query.append('}')
		"""
		print '\n\nSAVING CHAPTER-------------------------------------'
		print ''.join(query)
		print '\nEND SAVING CHAPTER-------------------------------------'

		resp = self.__sendSearchRequest(''.join(query))
		jsonData = None
		try:
			print resp
			jsonData = simplejson.loads(resp)            
		except JSONDecodeError, e:
			print e
			return None
		
		return {'mfURI' : mfURI, 'bodyURI' : bodyURI, 'annotationURI' : aURI}		

	#TOOD fix dit: enrichments hebben geen mfURI en geen annotationURI!!!
	def __saveAnnotationTriples(self, mediaResourceUri, dimension, annotation, action):
		print 'Saving annotation (%s): %s' % (action, annotation.getLabel())
		isInformationCard = self.__isInformationCard(dimension)
		start = TimeUtils.toStringSeconds(annotation.getStart())
		end = TimeUtils.toStringSeconds(annotation.getStart())
		duration = TimeUtils.toStringSeconds(int(annotation.getEnd()) - int(annotation.getStart()))
				   
		#Query head
		query = self.__getQueryPrefix()
		
		#The graph storing the ET data
		query.append('WITH <%s> ' % self.SAVE_GRAPH)

		#query.append('DELETE { ')
		if annotation.getMfURI():
			mfURI = annotation.getMfURI()
			#query.append('<%s> ?p1 ?o1 . ' % mfURI)
		else:
			mfURI = '%s/%s#t=%s,%s' % (self.LTV_MEDIA_PF, uuid.uuid1(), start, end)

		if annotation.getBodyURI():
			bodyURI = annotation.getBodyURI()
			#query.append('<%s> ?p2 ?o2 . ' % bodyURI)
		else:
			if isInformationCard:
				bodyURI = '%s/%s' % (self.LTV_INFORMATION_CARD_PF, uuid.uuid1())
			else:
				bodyURI = '%s/%s' % (self.LTV_MEDIA_PF, uuid.uuid1())

		if annotation.getAnnotationURI():
			aURI = annotation.getAnnotationURI()
			#query.append('<%s> ?p3 ?o3 . ' % aURI)
		else:
			aURI = '%s/%s' % (self.LTV_ANNOTATION_PF, uuid.uuid1())

		#query.append('} ')        
		
		if(action == self.SAVE_ACTION):
			query.append('INSERT { ')
			
			#TODO make sure to refer to the chapter mediafragment

			#First create the media fragment => self.LTV_MEDIA_PF/UUID/#t=1931.24,1934.639
			query.append('<%s> rdf:type <%s> ; ' % (mfURI, self.MEDIA_FRAGMENT))
			query.append('rdf:type <%s> ; ' % self.MEDIA_FRAGMENT_NINSUNA)
			query.append('ma:isFragmentOf <%s/%s> ; ' % (self.LTV_MEDIA_PF, mediaResourceUri))
			query.append('ma:duration "%s"^^xsd:float ; ' % duration)
			query.append('nsa:temporalStart "%s"^^xsd:float ; ' % start)
			query.append('nsa:temporalEnd "%s"^^xsd:float ; ' % end)
			query.append('nsa:temporalUnit "npt" . ')			

			#Create the body containing the enrichment info            
			query.append('<%s> rdf:type <%s> ; ' % (bodyURI, self.MEDIA_RESOURCE))
			query.append('rdf:type <%s> ; ' % self.RELATED_CONTENT)
			query.append('rdfs:label "%s"' % annotation.getLabel())
			if annotation.getUri():
				query.append(' ; ma:locator <%s>' % annotation.getUri())#voor IC templates is deze leeg
			if annotation.getDescription():
				query.append(' ; rdfs:comment "%s"' % annotation.getDescription())
			if annotation.getPoster():
				query.append(' ; linkedtv:hasPoster <%s>' % annotation.getPoster())
			if annotation.getCreator():
				query.append(' ; dc:creator "%s"' % annotation.getCreator())
			if annotation.getDate():
				query.append(' ; dc:date "%s"' % annotation.getDate())#TODO format the date!
			if annotation.getSource():
				query.append(' ; dc:source "%s"' % annotation.getSource())
			else:
				query.append(' ; dc:source "%s"' % self.PROV_ET_SOURCE)
			query.append(' . ')

			#Then create the annotation to tie everything together
			query.append('<%s> rdf:type <%s> ; ' % (aURI, self.OA_ANNOTATION))
			query.append('rdf:type <%s> ; ' % self.PROV_ENTITY)
			query.append('oa:motivatedBy <%s> ; ' % self.MOTIVATION_LINKING)
			query.append('oa:hasTarget <%s> ; ' % mfURI)
			query.append('oa:hasBody <%s> ; ' % bodyURI)
			query.append('prov:wasAttributedTo <%s> ; ' % self.PROV_ET_URI)
			query.append('linkedtv:partOfDimension "%s" ; ' % dimension.getLabel())
			query.append('prov:startedAtTime "%s"^^xsd:dateTime . ' % self.__getCurrentDateTime())

			#moved to different function			


			query.append(' } ')
		
		#The WHERE part, used for the selection of sources (only for DELETE in this case)
		"""
		query.append('WHERE {')
		if annotation.getMfURI():
			query.append('<%s> ?p1 ?o1 . ' % mfURI)
			query.append('<%s> ?p2 ?o2 . ' % bodyURI)
			query.append('<%s> ?p3 ?o3 . ' % aURI)
			#todo add something to reference related entities            
		query.append('}')
		"""
		print '\n\nSAVING ANNOTATIONS & ENRICHMENTS-------------------------------------'
		print ''.join(query)
		print '\nEND SAVING ANNOTATIONS & ENRICHMENTS-------------------------------------'

		
		resp = self.__sendSearchRequest(''.join(query))
		jsonData = None
		try:
			print resp
			jsonData = simplejson.loads(resp)            
		except JSONDecodeError, e:
			print e
			return None
		
		return {'mfURI' : mfURI, 'bodyURI' : bodyURI, 'annotationURI' : aURI}
	
	"""TODO FINISH THIS!!!"""
	def __saveEntityTriples(self, annotationURI, entity, action):		
		query = self.__getQueryPrefix()
		query.append('WITH <%s> ' % self.SAVE_GRAPH)
		#query.append('DELETE { ')
		if entity.getEtURI():
			etURI = entity.getEtURI()
			#query.append('<%s> ?p1 ?o1 . ' % etURI)
		else:
			etURI = '%s/%s' % (self.LTV_ENTITY_PF, uuid.uuid1())

		#query.append('} ')
		if action == self.SAVE_ACTION:
			query.append('INSERT { ')

			#create the entity
			query.append('<%s> rdf:type <%sEntity> ; ' % (etURI, self.LTV_ONTO_PF))	
			query.append('rdf:type <%s/%s> ; ' % (self.DBPEDIA_ONTOLOGY_PF, entity.getType()))#get an actual type
			query.append('owl:sameAs <%s/%s> ; ' % (self.DBPEDIA_ONTOLOGY_PF, entity.getType()))#get an actual type
			query.append('dc:type <%s/%s> ; ' % (self.DBPEDIA_ONTOLOGY_PF, entity.getType()))#get an actual type					
			query.append('rdfs:label "%s" ; ' % entity.getLabel())
			query.append('ma:locator "%s" ; ' % entity.getUri())
			query.append('dc:source "%s" ; ' % self.PROV_ET_SOURCE)
			query.append('linkedtv:hasConfidence "%s" ; ' % self.ET_CONFIDENCE)
			query.append('linkedtv:hasRelevance "%s" . ' % self.ET_RELEVANCE)

			#relate the entity to the annotation
			query.append('<%s> prov:wasDerivedFrom <%s> . ' % (annotationURI, etURI))
			query.append(' } ')
		"""
		query.append('WHERE {')
		if entity.getEtURI():
			query.append('<%s> ?p1 ?o1 . ' % etURI)				 
		query.append('}')
		"""
		print '\n\nSAVING ENTITIES-------------------------------------'
		print ''.join(query)
		print '\nEND SAVING ENTITIES-------------------------------------'		
		resp = self.__sendSearchRequest(''.join(query))
		jsonData = None
		try:
			print resp
			jsonData = simplejson.loads(resp)            
		except JSONDecodeError, e:
			print e
			return None
		
		return etURI

	"""TODO implement this and get rid of the update code"""
	def __deleteCuratedDataFromMediaResource(self, mediaResource):
		print 'Deleting curated mediaResource data for %s' % mediaResource.getId()
		for chapter in mediaResource.getChapters():
			if chapter.getType() == 'curated':				
				self.__deleteResource(chapter.getMfURI())
				self.__deleteResource(chapter.getAnnotationURI())
				self.__deleteResource(chapter.getBodyURI())
				dimensions = chapter.getDimensions()
				for k in dimensions.keys():			
					d = dimensions[k]
					for a in d.getAnnotations():
						self.__deleteResource(a.getMfURI())
						self.__deleteResource(a.getAnnotationURI())
						self.__deleteResource(a.getBodyURI())
						for e in a.getEntities():
							self.__deleteResource(e.getEtURI())
				
		return True

	def __deleteResource(self, uri):
		print 'Deleting %s' % uri
		query = []
		query.append('WITH <http://data.linkedtv.eu/graph/et_v2> ')
		query.append('DELETE { <%s> ?p ?o }' % uri)
		query.append('WHERE { <%s> ?p ?o }' % uri)
		resp = self.__sendSearchRequest(''.join(query))
		jsonData = None
		try:
			print resp
			jsonData = simplejson.loads(resp)            
		except JSONDecodeError, e:
			print e
			return None

	def __isInformationCard(self, dimension):
		return dimension.getService() and dimension.getService().has_key('id') and dimension.getService()['id'] == 'informationCards'

	def __getCurrentDateTime(self):		
		return datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%fZ')	

	def __getQueryPrefix(self):
		query = []
		query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
		query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
		query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
		query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
		query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
		query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
		query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
		query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')
		query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')#only needed for annotations
		query.append('PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ')
		return query

	def __sendSearchRequest(self, query):
		cmd_arr = []
		cmd_arr.append('curl')
		cmd_arr.append('-X')
		cmd_arr.append('POST')
		cmd_arr.append(self.SPARQL_ENDPOINT)
		cmd_arr.append('-H')
		cmd_arr.append('Accept: application/sparql-results+json')
		cmd_arr.append('-d')
		cmd_arr.append('query=%s' % urllib.quote(query.encode('utf-8'), ''))
		p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
		stdout, stderr = p1.communicate()
		if stdout:
			return stdout
		else:
			logger.error(stderr)
		return None
