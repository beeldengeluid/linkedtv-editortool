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

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService

class TvNewsEnricher(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'TvNewsEnricher')
		self.BASE_URL = 'http://linkedtv.eurecom.fr/newsenricher/api'
		self.googleCustomSearchEngines = {
			'opinion' : '008879027825390475756:jttjpihzlns',
			'othermedia' : '008879027825390475756:jttjpihzlns',
			'indepth' : '008879027825390475756:jttjpihzlns',
			'timeline' : '008879027825390475756:jttjpihzlns'
		}
		self.periodInDays = 7
		self.searchLimit = 50

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			queryUrl, results = self.__search(query, entities, dimension)
			if queryUrl and results:
				return {'enrichments' : self.__formatResponse(results, dimension), 'queries' : [queryUrl]}
		return None

	def __isValidDimension(self, dimension):
		if dimension.has_key('service'):
			if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
				return dimension['service']['params'].has_key('dimension')
		return False

	def __search(self, query, entities, dimension):
		http = httplib2.Http()
		url = self.__getServiceUrl(query, entities, dimension)
		if url:
			headers = {'Content-type': 'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return url, content
		return None, None

	def __getServiceUrl(self, query, entities, dimension):
		if dimension['service'].has_key('params'):
			params = dimension['service']['params']

			#set the correct start & end date for the search period
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

			#create the query from the entity labels
			if query == '':
				query = ''.join(e['label'] for e in entities)
			query = urllib.quote(query.encode('utf8'))

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

	"""
	"source":{
            "name":"DW.DE"
         },
         "title":"Suicide attack in Afghanistan kills security officials | News | DW.DE ...",
         "url":"http://www.dw.de/suicide-attack-in-afghanistan-kills-security-officials/a-16552650",
         "media":{
            "thumbnail":"https://encrypted-tbn0.gstatic.com/images?q\u003dtbn:ANd9GcT8oIVSFtXnJgqBFAHAJMAjNMdATPibhSiGT7uxjXiHfaWSUdWDv26jZ6M",
            "url":"http://www.dw.de/image/0,,16123185_302,00.jpg",
            "type":"image"
         },
         "textURL":"",
         "text":"Jan 25, 2013 ... Kunduz is one of the sites of a major German military, or Bundeswehr, base in \nnortheastern Afghanistan. The German government plans, ..."
      },
	"""
	def __formatResponse(self, data, dimension):
		if data:
			data = simplejson.loads(data)
			enrichments = []
			for e in data:
				enrichment = Enrichment(
					e['title'],
					url=e['url']
				)
				if e.has_key('source'):
					enrichment.setSource(e['source']['name'])
				if e.has_key('media'):
					if e['media'].has_key('thumbnail'):
						enrichment.setPoster(e['media']['thumbnail'])
					if e['media'].has_key('type'):
						enrichment.setEnrichmentType(e['media']['type'])
				enrichments.append(enrichment)
			return enrichments
		return None
