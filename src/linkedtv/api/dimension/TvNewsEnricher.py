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
from datetime import datetime, date, timedelta

from linkedtv.api.dimension.DimensionService import DimensionService

class TvNewsEnricher(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'TvNewsEnricher')
		self.BASE_URL = 'http://linkedtv.eurecom.fr/newsenricher/api'
		self.googleCustomSearchEngines = {#https://www.google.com/cse/publicurl?cx=
			'opinion' : '008879027825390475756:xnwxm5pcj8w',#'014567755836058125714:2yq5yptluxs',
			'othermedia' : '008879027825390475756:korkyyeroum', #'014567755836058125714:c1kdam3wyey',
			'indepth' : '008879027825390475756:jttjpihzlns',#'014567755836058125714:0opyehd0oiu',
			'timeline' : '008879027825390475756:jttjpihzlns' #'014567755836058125714:aeiq3vyfdw8'
		}
		self.periodInDays = 7
		self.searchLimit = 50

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			return self.__formatResponse(self.__search(query, entities, dimension), dimension)
		return None

	def __isValidDimension(self, dimension):
		if dimension.has_key('service'):
			if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
				return dimension['service']['params'].has_key('dimension')
		return False

	def __search(self, query, entities, dimension):
		http = httplib2.Http()
		url = self.__getServiceUrl(query, dimension)
		if url:
			headers = {'Content-type': 'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				print content
				return content
		return None

	def __getServiceUrl(self, query, dimension):
		print 'Building the TvNewsEnricher URL'
		if dimension['service'].has_key('params'):
			params = dimension['service']['params']

			#set the correct start & end date for the search period
			print params
			if params.has_key('endDate') and params['endDate']:
				try:
					print 'Found a date: %s' % params['endDate']
					endDate = datetime.strptime(params['endDate'], '%Y%m%d')
				except ValueError, e:
					endDate = date.today()
			else:
				endDate = date.today()
			if params.has_key('periodInDays'):
				startDate = endDate-timedelta(days=params['periodInDays'])
			else:
				startDate = endDate-timedelta(days=self.periodInDays)

			d = params['dimension']
			#TODO define the date somewhere
			query = '+'.join(query)

			url = '%s/%s?query=%s&startdate=%s&enddate=%s&limit=%s' % (
				self.BASE_URL,
				d,
				query,
				startDate.strftime('%Y%m%d'),
				endDate.strftime('%Y%m%d'),
				self.searchLimit
			)
			if d != 'tweets':
				url = '%s&cse=%s' % (url, self.googleCustomSearchEngines[d])
			print url
			return url
		return None

	def __formatResponse(self, data, dimension):
		return { 'enrichments' : simplejson.loads(data)}
