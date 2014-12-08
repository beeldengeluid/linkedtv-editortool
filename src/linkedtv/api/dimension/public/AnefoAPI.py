import simplejson
import urllib
import httplib2
import feedparser
from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService

class AnefoAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'AnefoAPI')
		self.BASE_URL = 'http://www.gahetna.nl'

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			return self.__formatResponse(self.__search(query, entities, dimension), dimension)
		return None

	def __isValidDimension(self, dimension):
		return True

	def __search(self, query, entities, dimension):
		print 'searching Anefo'
		http = httplib2.Http()
		url = self.__getServiceUrl(query, entities, dimension)
		if url:
			headers = {'Accept':'text/html,application/xhtml+xml,application/xml'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return content
		return None

	def __getServiceUrl(self, query, entities, dimension):
		#Trefwoorden: Geografisch_trefwoord:
		query = urllib.quote(''.join(query))
		params = 'searchTerms='
		if entities and len(entities) > 0:
			for e in entities:
				params += urllib.quote(e['label'])
		else:
			params += query
		params += '&count=10&startIndex=1';
		url = '%s/beeldbank-api/opensearch/?%s' % (self.BASE_URL, params)
		print url
		return url

	""" SOURCE DATA:
	['updated_parsed', 'links', 'updated', 'rights_detail', u'ese_isshownby', 'dc_ispartof',
	'published_parsed', 'title', u'ese_type', 'id', 'field', 'title_detail', u'ese_provider',
	'summary_detail', 'link', 'authors', u'ese_isshownat', 'author_detail', u'memorix_memorix', 'dc_type', 'rights',
	 'author', 'value', 'summary', 'guidislink', 'published']
	"""
	#the data returnde from Anefo is in some RSS format
	def __formatResponse(self, data, dimension):
		data = feedparser.parse(data)
		enrichments = []
		for e in data['entries']:
			print e
			print '\n\n'
			enrichments.append(Enrichment(
				e['title'],
				url=e['link'],
				description=e['summary'],
				poster=self.__getPoster(e),
				enrichmentType=e['dc_type'],
				source=e['ese_provider']
			))
		return { 'enrichments' : enrichments}

	def __getPoster(self, anefoEnrichment):
		if anefoEnrichment.has_key('ese_isshownby'):
			return anefoEnrichment['ese_isshownby']
		return None