# -*- coding: utf-8 -*-
import simplejson
import urllib
import httplib2
from lxml import etree
import time

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService

class IRAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'IRAPI')
		self.BASE_URL = 'http://ir.lmcloud.vse.cz/irapi/media-server'
		self.DESIRED_AMOUNT_OF_RESULTS = 50
		self.MAX_QUERY_SIZE = 20

	#TODO check if everything makes sense
	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			queries = []
			#first do a field query to get the most relevant results
			queryUrl, results = self.__search(query, entities, dimension, None, self.MAX_QUERY_SIZE)
			enrichments = self.__formatResponse(
				results,
				entities,
				dimension
			)
			queries.append(queryUrl)
			#try to add some videos
			if len(enrichments) < self.DESIRED_AMOUNT_OF_RESULTS:
				numResults = self.DESIRED_AMOUNT_OF_RESULTS - len(enrichments)
				queryUrl, results = self.__search(query, entities, dimension, 'video', numResults)
				if queryUrl and results:
					moreEnrichments = self.__formatResponse(
						results,
						entities,
						dimension
					)
					queries.append(queryUrl)
					enrichments = list(set(enrichments) | set(moreEnrichments))
			#try to search for images
			if len(enrichments) < self.DESIRED_AMOUNT_OF_RESULTS:
				numResults = self.DESIRED_AMOUNT_OF_RESULTS - len(enrichments)
				queryUrl, results = self.__search(query, entities, dimension, 'image', numResults)
				if queryUrl and results:
					moreEnrichments = self.__formatResponse(
						results,
						entities,
						dimension
					)
					queries.append(queryUrl)
					enrichments = list(set(enrichments) | set(moreEnrichments))

			return {'enrichments' : enrichments, 'queries' : queries}
		print 'dimension not VALID'
		return None

	def __isValidDimension(self, dimension):
		if dimension.has_key('service'):
			if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
				return dimension['service']['params'].has_key('domain')

	def __search(self, query, entities, dimension, mediaType, numResults):
		http = httplib2.Http()
		url = self.__constructServiceQueryUrl(query, entities, dimension, mediaType, numResults)
		print url
		if url:
			headers = {'Accept':'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return url, content
		return None, None

	def __constructServiceQueryUrl(self, query, entities, dimension, mediaType, numResults):
		if query == '' and len(entities) > 0:
			query = self.__constructQuery(entities)
		else:
			query = urllib.quote(query.encode('utf8'))
		if query:
			if numResults > self.MAX_QUERY_SIZE:
				numResults = self.MAX_QUERY_SIZE
			url = '%s?q=%s&row=%d&domain_source=%s'% (self.BASE_URL, query, numResults, dimension['service']['params']['domain'])
			if mediaType:
				url += '&media_type=%s' % mediaType
			return url
		return None

	def __constructQuery(self, entities):
		queryParts = []
		for e in entities:
			queryParts.append('"%s"' % e['label'])
		return urllib.quote(' '.join(queryParts).encode('utf8'))

	#the data returnde from Anefo is in some RSS format
	def __formatResponse(self, data, entities, dimension):
		enrichments = []
		data = simplejson.loads(data)

		if not data.has_key('error'):
			for source in data.keys(): #all the available sources
				for e in data[source]: #each source contains a list of enrichments
					title = None
					if e.has_key('micropost'):
						if e['micropost'].has_key('title'):
							title = e['micropost']['title']
						elif e['micropost'].has_key('plainText'):
							title = e['micropost']['plainText']
					enrichment = Enrichment(
						title,
						url=e['micropostUrl'],
						source=source,
						entities=[entity['label'] for entity in entities]
					)
					if e.has_key('micropost'):
						if e['micropost'].has_key('html'):
							enrichment.setDescription(e['micropost']['html'])
						elif e['micropost'].has_key('plainText'):
							enrichment.setDescription(e['micropost']['plainText'])
					if e.has_key('type'):
						eType = e['type']
						if e.has_key('mediaUrl'):
							if e['micropostUrl'] == e['mediaUrl']:
								eType = 'webpage'
						enrichment.setEnrichmentType(eType)
					if e.has_key('mediaUrl'):
						enrichment.setPoster(e['mediaUrl'])
					"""
					if e.has_key('publicationDate'):
						enrichment.setDate(self.__formatDate(e['publicationDate']))
					"""
					#also add all of the properties to the enrichment
					enrichment.setNativeProperties(e)
					enrichments.append(enrichment)
		return enrichments

	#Formats e.g. 'Sat Oct 11 08:27:41 CEST 2014' to '11-11-2014'
	def __formatDate(self, d):
		if d:
			try:
				t = time.strptime(d, '%a %b %d %H:%M:%S CEST %Y')
				return time.strftime('%d-%M-%Y', t)
			except ValueError, e:
				pass
		return None
