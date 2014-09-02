import simplejson
import urllib
import httplib2
from datetime import date, timedelta

class TvNewsEnricher():
	
	def __init__(self):
		self.BASE_URL = 'http://linkedtv.eurecom.fr/newsenricher/api'
		self.googleCustomSearchEngines = {
			'opinion' : 'https://www.google.com/cse/publicurl?cx=014567755836058125714:2yq5yptluxs',
			'othermedia' : 'https://www.google.com/cse/publicurl?cx=014567755836058125714:c1kdam3wyey',
			'indepth' : 'https://www.google.com/cse/publicurl?cx=014567755836058125714:0opyehd0oiu',
			'timeline' : 'https://www.google.com/cse/publicurl?cx=014567755836058125714:aeiq3vyfdw8'
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
		url = '%s/%s/query=%s&startdate=%s&enddate=%s&cse=%s&limit=%s' % (
			self.BASE_URL, 
			dimension, 
			query, 
			endDate.strftime('%Y%m%d'), 
			endDate.strftime('%Y%m%d'),
			self.googleCustomSearchEngines[dimension],
			self.searchLimit
		)
		print url
		return url

	def formatResponse(self, data, dimension):
		"""
		{
		  "title":"Stateless in the United States - The Washington Post",
		  "link":"http://www.washingtonpost.com/opinions/stateless-in-the-united-states/2013/07/04/ae4c7a72-debe-11e2-b2d4-ea6d8f477a01_story.html",
		  "snippet":"Jul 4, 2013 ... Edward Snowden\u0027s efforts to escape the transit zone of the Moscow ... But my \npetition for asylum was rejected in 1996, and I was ordered to ... I have sought \ntravel documents from     Armenia, Azerbaijan, Britain, Japan, Russia, ...",
		  "image":"http://img.washingtonpost.com/rf/image_1024w/2010-2019/WashingtonPost/2013/07/04/Outlook/Images/172583100-705.jpg",
		  "datepublished":"2013-07-04"
		}
		"""
		print 'Formatting data:'
		print data
		return None
