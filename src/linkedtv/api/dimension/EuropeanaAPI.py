import simplejson
import urllib
import httplib2

from linkedtv.LinkedtvSettings import LTV_EUROPEANA
from linkedtv.api.dimension.DimensionService import DimensionService

class EuropeanaAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'EuropeanaAPI')
		self.API_KEY = LTV_EUROPEANA['apikey']
		self.BASE_URL = 'http://www.europeana.eu/api/v2/search.json'
		#1hfhGH67Jhs
		#KtbDppuVD

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			return self.__formatResponse(self.__search(query, entities, dimension), dimension)
		return None

	def __isValidDimension(self, dimension):
		if dimension.has_key('service'):
			if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
				return True
		return False

	def __search(self, query, entities, dimension):
		#http://www.europeana.eu/api/v2/search.json?wskey=KtbDppuVD&query=what:zilver&qf=COUNTRY:netherlands
		#http://www.europeana.eu/api/v2/search.json?wskey=KtbDppuVD&query=what:zilver&qf=where:Friesland&qf=YEAR:[1690+TO+1742]&qf=COUNTRY:netherlands
		http = httplib2.Http()
		url = self.__getServiceUrl(query, entities, dimension)
		if url:
			headers = {'Content-type': 'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return content
		return None

	def __getServiceUrl(self, query, entities, dimension):
		#print entities
		query = urllib.quote('what:%s' %  ''.join(query))
		url = '%s?wskey=%s&query=%s' % (self.BASE_URL, self.API_KEY, query)
		if dimension['service']['params'].has_key('queryParts'):
			for qf in dimension['service']['params']['queryParts']:
				url += '&qf=%s' % qf
		url += '&rows=100'
		print url
		return url

	def __formatResponse(self, data, dimension):
		return { 'enrichments' : simplejson.loads(data)}