"""
[Opinion]
curl -X GET "http://linkedtv.eurecom.fr/newsenricher/api/opinion?
query=snowden+russian+asylum&startdate=20130703&enddate=20130716&cse=CSE_ID&limit=50" 
--header "Content-Type:application/json" -v

[Other media]
curl -X GET "http://linkedtv.eurecom.fr/newsenricher/api/othermedia?
query=snowden+russian+asylum&startdate=20130703&enddate=20130716&cse=CSE_ID&limit=50" 
--header "Content-Type:application/json" -v

[Timeline]
curl -X GET "http://linkedtv.eurecom.fr/newsenricher/api/timeline?
query=snowden&startdate=20130313&enddate=20140116&cse=CSE_ID&limit=50" 
--header "Content-Type:application/json" -v

[In depth]
curl -X GET "http://linkedtv.eurecom.fr/newsenricher/api/indepth?
query=snowden&startdate=20130313&enddate=20140116&cse=CSE_ID&limit=50" 
--header "Content-Type:application/json" -v

[Tweets]
curl -X GET "http://linkedtv.eurecom.fr/newsenricher/api/tweets?
query=snowden+asylum&startdate=20140421&enddate=20140429&limit=50" 
--header "Content-Type:application/json" -v

curl -X GET "http://linkedtv.eurecom.fr/newsenricher/api/tweets?
query=snowden+asylum&startdate=20140421&enddate=20140429&lat=51.5085300&lon=-0.1257400&rad=50&limit=50" 
--header "Content-Type:text/xml" -v

"""

import simplejson
import urllib
import httplib2
from datetime import date, timedelta

from linkedtv.api.dimension.DimensionService import DimensionService

class TvNewsEnricher(DimensionService):
	
	def __init__(self):
		DimensionService.__init__(self, 'TvNewsEnricher')
		self.BASE_URL = 'http://linkedtv.eurecom.fr/newsenricher/api'
		self.googleCustomSearchEngines = {#https://www.google.com/cse/publicurl?cx=		
			'opinion' : '014567755836058125714:2yq5yptluxs',
			'othermedia' : '014567755836058125714:c1kdam3wyey',
			'indepth' : '014567755836058125714:0opyehd0oiu',
			'timeline' : '014567755836058125714:aeiq3vyfdw8'
		}
		self.searchPeriod = 7 # days
		self.searchLimit = 50

	def fetch(self, query, params):
		return self.__formatResponse(self.__search(query, params))

	def __search(self, query, params):
		DimensionService.__search(self, query, params)
		http = httplib2.Http()		
		url = self.__getServiceUrl(params['dimension'], query)
		headers = {'Content-type': 'application/json'}
		resp, content = http.request(url, 'GET', headers=headers)		
		if content:
			return self.__formatResponse(content, params['dimension'])
		else:
			return None
		print 'fetching enrichments: %s (%s)' % (query, params['dimension'])

	def __formatResponse(self, data):		
		print 'Implement this!'
		return data

	def __getServiceUrl(self, dimension, query):
		endDate = date.today()
		startDate = endDate-timedelta(days=self.searchPeriod)

		#TODO define the date somewhere
		query = '+'.join(query)

		url = '%s/%s?query=%s&startdate=%s&enddate=%s&limit=%s' % (
			self.BASE_URL,
			dimension,
			query,
			endDate.strftime('%Y%m%d'),
			endDate.strftime('%Y%m%d'),
			self.searchLimit
		)
		if dimension != 'tweets':
			url = '%s&cse=%s' % (url, self.googleCustomSearchEngines[dimension])
		print url
		return url

	def __formatResponse(self, data, dimension):
		resp = { 'enrichments' : simplejson.loads(data) }
		return resp
