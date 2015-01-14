# -*- coding: utf-8 -*-
import simplejson
import urllib
import httplib2
from lxml import etree
from datetime import datetime

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService

class IRAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'IRAPI')
		self.BASE_URL = 'http://ir.lmcloud.vse.cz/irapi/media-server'
		self.DESIRED_AMOUNT_OF_RESULTS = 20

	#TODO check if everything makes sense
	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			#first do a field query to get the most relevant results
			enrichments = self.__formatResponse(
				self.__search(query, entities, dimension, True, self.DESIRED_AMOUNT_OF_RESULTS),
				entities,
				dimension
			)
			if len(enrichments) < self.DESIRED_AMOUNT_OF_RESULTS:
				numResults = self.DESIRED_AMOUNT_OF_RESULTS - len(enrichments)
				moreEnrichments = self.__formatResponse(
					self.__search(query, entities, dimension, False, numResults),
					entities,
					dimension
				)
				enrichments = list(set(enrichments) | set(moreEnrichments))
			return { 'enrichments' : enrichments}
		return None

	def __isValidDimension(self, dimension):
		if dimension.has_key('service'):
			if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
				return dimension['service']['params'].has_key('domain')

	def __search(self, query, entities, dimension, strictQuery, numResults):
		http = httplib2.Http()
		url = self.__constructServiceQueryUrl(query, entities, dimension, strictQuery, numResults)
		if url:
			headers = {'Accept':'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return content
		return None

	def __constructServiceQueryUrl(self, query, entities, dimension, strictQuery, numResults):
		if query == '' and len(entities) > 0:
			if strictQuery:
				query = self.__constructStrictQuery(entities)
			else:
				query = self.__constructQuery(entities)
		else:
			query = urllib.quote(query.encode('utf8'))
		url = '%s?q=%s&row=%d&domain_source=%s&media_type=image'% (self.BASE_URL, query, numResults, dimension['service']['params']['domain'])
		print url
		return url

	def __constructStrictQuery(self, entities):
		queryParts = []
		for e in entities:
			queryParts.append('"%s"' % e['label'])
		return urllib.quote(' '.join(queryParts).encode('utf8'))

	def __constructQuery(self, entities):
		queryParts = []
		for i in range(0, len(entities) -1):
			queryParts.append('"%s"' % entities[i]['label'])
		return urllib.quote(' '.join(queryParts).encode('utf8'))


	#the data returnde from Anefo is in some RSS format
	def __formatResponse(self, data, entities, dimension):
		enrichments = []
		data = simplejson.loads(data)
		if not data.has_key('error'):
			for source in data.keys(): #all the available sources
				for e in data[source]: #each source contains a list of enrichments
					title = None
					if e.has_key('micropost') and e['micropost'].has_key('plainText'):
						title = e['micropost']['plainText']
					enrichment = Enrichment(
						title,
						url=e['micropostUrl'],
						source=source,
						entities=[entity['label'] for entity in entities]
					)
					if e.has_key('type'):
						enrichment.setEnrichmentType(e['type'])
					if e.has_key('mediaUrl'):
						enrichment.setPoster(e['mediaUrl'])
					enrichments.append(enrichment)
		return enrichments
