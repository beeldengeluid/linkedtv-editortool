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
		self.LTV_CHAPTER_PF = 'http://data.linkedtv.eu/chapter'
		self.LTV_ANNOTATION_PF = 'http://data.linkedtv.eu/annotation'
		self.LTV_MEDIA_FRAGMENT_PF = 'http://data.linkedtv.eu/media'

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
		return self.__saveMediaResourceTriples(mediaResource, self.DELETE_ACTION)		

	def __saveMediaResourceTriples(self, mediaResource, action):
		print 'Saving mediaresource: %s' % mediaResource.getId()
		for chapter in mediaResource.getChapters():
			if chapter.isCurated():
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
			print 'Saving dimension: %s' % k
			d = dimensions[k]
			for a in d.getAnnotations():
				resourceUris = self.__saveAnnotationTriples(mediaResourceUri, d, a, action)
				if resourceUris:
					a.setMfURI(resourceUris['mfURI'])
					a.setAnnotationURI(resourceUris['annotationURI'])
					a.setBodyURI(resourceUris['bodyURI'])

		print '-' * 150

		#prepare some variables
		start = TimeUtils.toStringSeconds(chapter.getStart())
		end = TimeUtils.toStringSeconds(chapter.getEnd())
		duration = TimeUtils.toStringSeconds(int(chapter.getEnd()) - int(chapter.getStart()))
		
		#Head part of the query
		query = self.__getQueryPrefix()

		#Construct the DELETE part of the query and make sure to initialize the mfURI, bodyURI and aURI
		query.append('WITH <%s> ' % self.SAVE_GRAPH)
		query.append('DELETE { ')
		#construct the media fragment URI
		if chapter.getMfURI():
			mfURI = chapter.getMfURI()
			query.append('<%s> ?p1 ?o1 . ' % mfURI)
		else:
			mfURI = '%s/%s#t=%s,%s' % (self.LTV_MEDIA_FRAGMENT_PF, uuid.uuid1(), start, end)
		#construct the body URI
		if chapter.getBodyURI():
			bodyURI = chapter.getBodyURI()
			query.append('<%s> ?p2 ?o2 . ' % bodyURI)
		else:
			bodyURI = '%s/%s' % (self.LTV_CHAPTER_PF, uuid.uuid1())  
		#construct the annotation URI
		if chapter.getAnnotationURI():
			aURI = chapter.getAnnotationURI()
			query.append('<%s> ?p3 ?o3' % aURI)
		else:
			aURI = '%s/%s' % (self.LTV_ANNOTATION_PF, uuid.uuid1())
		query.append('} ')
		
		#Do not INSERT data when the action is DELETE_ACTION
		if(action != self.DELETE_ACTION):
			query.append('INSERT { ')
			
			#media fragment
			query.append('<%s> rdf:type <%s> . ' % (mfURI, self.MEDIA_FRAGMENT))
			query.append('<%s> rdf:type <%s> . ' % (mfURI, self.MEDIA_FRAGMENT_NINSUNA))
			query.append('<%s> ma:isFragmentOf <%s/%s> . ' % (mfURI, self.LTV_MEDIA_FRAGMENT_PF, mediaResourceUri))
			query.append('<%s> ma:duration %s . ' % (mfURI, duration))
			query.append('<%s> nsa:temporalStart %s . ' % (mfURI, start))
			query.append('<%s> nsa:temporalEnd %s . ' % (mfURI, end))
			query.append('<%s> nsa:temporalUnit "npt" . ' % mfURI)

			#body -> type=chapter + label
			query.append('<%s> rdf:type <%sChapter> . ' % (bodyURI, self.LTV_ONTO_PF))
			query.append('<%s> rdfs:label "%s" . ' % (bodyURI, chapter.getLabel()))
			if chapter.getPoster():
				query.append('<%s> linkedtv:hasPoster <%s> . ' % (bodyURI, chapter.getPoster()))

			#annotation targets the media fragment & links to the body
			query.append('<%s> rdf:type <%s> . ' % (aURI, self.OA_ANNOTATION))
			query.append('<%s> rdf:type <%s> . ' % (aURI, self.PROV_ENTITY))
			query.append('<%s> oa:hasTarget <%s> . ' % (aURI, mfURI))
			query.append('<%s> oa:hasBody <%s> . ' % (aURI, bodyURI))
			query.append('<%s> prov:wasAttributedTo <%s> . ' % (aURI, self.PROV_ET_URI))
			query.append('<%s> prov:startedAtTime "%s"^^xsd:dateTime . ' % (aURI, self.__getCurrentDateTime()))


			query.append('} ')

		query.append('WHERE {')

		#Only for UPDATE and DELETE, otherwise only the INSERT part is executed (with an empty DELETE block)
		if chapter.getMfURI():
			query.append('<%s> ?p1 ?o1 . ' % mfURI)
			query.append('<%s> ?p2 ?o2 . ' % bodyURI)
			query.append('<%s> ?p3 ?o3' % aURI)
		query.append('}')
		
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
		
		start = TimeUtils.toStringSeconds(annotation.getStart())
		end = TimeUtils.toStringSeconds(annotation.getStart())
		duration = TimeUtils.toStringSeconds(int(annotation.getEnd()) - int(annotation.getStart()))
				   
		#Query head
		query = self.__getQueryPrefix()
		
		#The graph storing the ET data
		query.append('WITH <%s> ' % self.SAVE_GRAPH)
				
		query.append('DELETE { ')
		if annotation.getMfURI():
			mfURI = annotation.getMfURI()
			query.append('<%s> ?p1 ?o1 . ' % mfURI)
		else:
			mfURI = '%s/%s#t=%s,%s' % (self.LTV_MEDIA_FRAGMENT_PF, uuid.uuid1(), start, end)

		if annotation.getBodyURI():
			bodyURI = annotation.getBodyURI()
			query.append('<%s> ?p2 ?o2 . ' % bodyURI)
		else:
			bodyURI = '%s/%s' % (self.LTV_ENTITY_PF, uuid.uuid1())

		if annotation.getAnnotationURI():
			aURI = annotation.getAnnotationURI()
			query.append('<%s> ?p3 ?o3 . ' % aURI)
		else:
			aURI = '%s/%s' % (self.LTV_ANNOTATION_PF, uuid.uuid1())

		query.append('} ')        
		
		if(action != self.DELETE_ACTION):
			query.append('INSERT { ')
			
			#TODO make sure to refer to the chapter mediafragment

			#First create the media fragment => self.LTV_MEDIA_FRAGMENT_PF/UUID/#t=1931.24,1934.639
			query.append('<%s> rdf:type <%s> . ' % (mfURI, self.MEDIA_FRAGMENT))
			query.append('<%s> rdf:type <%s> . ' % (mfURI, self.MEDIA_FRAGMENT_NINSUNA))
			query.append('<%s> ma:isFragmentOf <%s/%s> . ' % (mfURI, self.LTV_MEDIA_FRAGMENT_PF, mediaResourceUri))
			query.append('<%s> ma:duration %s . ' % (mfURI, duration))
			query.append('<%s> nsa:temporalStart %s . ' % (mfURI, start))
			query.append('<%s> nsa:temporalEnd %s . ' % (mfURI, end))
			query.append('<%s> nsa:temporalUnit "npt" . ' % mfURI)     

			#Create the body containing the enrichment info            
			query.append('<%s> rdf:type <%s> . ' % (bodyURI, self.MEDIA_RESOURCE))
			query.append('<%s> rdf:type <%s> . ' % (bodyURI, self.RELATED_CONTENT))
			query.append('<%s> rdfs:label "%s" . ' % (bodyURI, annotation.getLabel()))
			query.append('<%s> dc:source <%s> . ' % (bodyURI, self.PROV_ET_SOURCE))
			query.append('<%s> prov:wasAttributedTo <%s> . ' % (bodyURI, self.PROV_ET_URI))
			query.append('<%s> ma:locator <%s> . ' % (bodyURI, annotation.getUri()))
			if annotation.getPoster():
				query.append('<%s> linkedtv:hasPoster <%s> . ' % (bodyURI, annotation.getPoster()))
			if annotation.getSource():
				query.append('<%s> dc:source <%s> . ' % (bodyURI, annotation.getSource()))
			if annotation.getCreator():
				query.append('<%s> dc:creator <%s> . ' % (bodyURI, annotation.getCreator()))
			if annotation.getDate():
				#TODO format the date
				query.append('<%s> dc:date %s . ' % (bodyURI, annotation.getDate()))

			#Then create the annotation to tie everything together
			query.append('<%s> rdf:type <%s> . ' % (aURI, self.OA_ANNOTATION))
			query.append('<%s> rdf:type <%s> . ' % (aURI, self.PROV_ENTITY))
			query.append('<%s> oa:motivatedBy <%s> . ' % (aURI, self.MOTIVATION_LINKING))
			query.append('<%s> oa:hasTarget <%s> . ' % (aURI, mfURI))
			query.append('<%s> oa:hasBody <%s> . ' % (aURI, bodyURI))
			query.append('<%s> prov:wasAttributedTo <%s> . ' % (aURI, self.PROV_ET_URI))
			query.append('<%s> prov:startedAtTime "%s"^^xsd:dateTime . ' % (aURI, self.__getCurrentDateTime()))
					 
			
			#Now create all derived entities and attach them to the annotation
			if annotation.getEntities():
				print '+' * 200
				print annotation.getEntities()
				#Then create the annotation body, which is an entity (the enrichments also refer to this entity!)
				#query.append('<%s> rdf:type <%sEntity> . ' % (bodyURI, self.LTV_ONTO_PF))
				#TODO find out what to fill in here (important for WP4!!!)
				#query.append('<%s> rdf:type <%s/%s> . ' % (bodyURI, self.DBPEDIA_ONTOLOGY_PF, 'Thing'))
				#query.append('<%s> owl:sameAs <%s/%s> . ' % (bodyURI, self.DBPEDIA_ONTOLOGY_PF, 'Thing'))
				#query.append('<%s> dc:type <%s/%s> . ' % (bodyURI, self.DBPEDIA_ONTOLOGY_PF, 'Thing')))			            
				#label, url & source
				#query.append('<%s> rdfs:label "%s" . ' % (bodyURI, annotation.getLabel()))
				#query.append('<%s> ma:locator "%s" . ' % (bodyURI, annotation.getUrl()))
				#query.append('<%s> dc:source "%s" . ' % (bodyURI, self.PROV_ET_SOURCE))
				#default confidence and relevance of 1
				#query.append('<%s> linkedtv:hasConfidence "%s" . ' % (bodyURI, self.ET_CONFIDENCE))
				#query.append('<%s> linkedtv:hasRelevance "%s" . ' % (bodyURI, self.ET_RELEVANCE))

				#relate them (simply create an Entity and related this to the annotation)
				#query.append('<%s> prov:wasDerivedFrom <%s> . ' % (eaURI, bodyURI))
				print 'TO IMPLEMENT (create entities and related them to the enrichment annotation)'

			query.append(' } ')
		
		#The WHERE part, used for the selection of sources (only for DELETE in this case)
		query.append('WHERE {')
		if annotation.getMfURI():
			query.append('<%s> ?p1 ?o1 . ' % mfURI)
			query.append('<%s> ?p2 ?o2 . ' % bodyURI)
			query.append('<%s> ?p3 ?o3 . ' % aURI)
			#todo add something to reference related entities            
		query.append('}')
		
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
		

	def __getCurrentDateTime(self):
		#2014-08-28T19:50:08.004Z    	
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
