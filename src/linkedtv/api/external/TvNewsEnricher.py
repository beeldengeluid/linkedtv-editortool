import simplejson
import urllib
import httplib2
from datetime import date, timedelta

class TvNewsEnricher():
	
	def __init__(self):
		self.BASE_URL = 'http://linkedtv.eurecom.fr/newsenricher/api'
		self.googleCustomSearchEngines = {#https://www.google.com/cse/publicurl?cx=		
			'opinion' : '014567755836058125714:2yq5yptluxs',
			'othermedia' : '014567755836058125714:c1kdam3wyey',
			'indepth' : '014567755836058125714:0opyehd0oiu',
			'timeline' : '014567755836058125714:aeiq3vyfdw8'
		}
		self.searchPeriod = 7 # days
		self.searchLimit = 50


	def search(self, entities, provider, dimension, useDummyEnrichments = False):				
		http = httplib2.Http()		
		url = self.getServiceUrl(dimension, entities)
		headers = {'Content-type': 'application/json'}
		resp, content = http.request(url, 'GET', headers=headers)
		print resp
		if content:
			return self.formatResponse(content, dimension)
		else:
			return None
		print 'fetching enrichments: %s (%s)' % (query, dimension)

	def getServiceUrl(self, dimension, entities):
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
		endDate = date.today()
		startDate = endDate-timedelta(days=self.searchPeriod)

		#TODO define the date somewhere
		query = '+'.join(entities)

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

	def formatResponse(self, data, dimension):
		print data
		resp = { 'enrichments' : simplejson.loads(data) }
		return resp
