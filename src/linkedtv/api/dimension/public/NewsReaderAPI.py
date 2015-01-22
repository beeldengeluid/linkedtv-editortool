# -*- coding: utf-8 -*-
import simplejson
import urllib
import httplib2
from lxml import etree
from datetime import datetime

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService

"""
SPARQL END-POINT
https://nwr_hack:london_2014@knowledgestore2.fbk.eu/nwr/cars-hackathon/sparql

ACCESSIBLE YASGUI
http://yasgui.laurensrietveld.nl/

https://newsreader.scraperwiki.com/

http://www.newsreader-project.eu/domain-ontology/
http://www.newsreader-project.eu/

http://www.comsode.eu/
"""

class NewsReaderAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'AnefoAPI')
		self.BASE_URL = 'http://newsreader.scraperwiki.com'
		self.DESIRED_AMOUNT_OF_RESULTS = 50

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			#first do a field query to get the most relevant results
			results = self.__search(query, entities, dimension, True, self.DESIRED_AMOUNT_OF_RESULTS)
			queries, enrichments = self.__formatResponse(
				results,
				dimension
			)
			#queries.append(queryUrl)
			return { 'enrichments' : enrichments, 'queries' : queries}
		return None

	def __isValidDimension(self, dimension):
		return True

	def __search(self, query, entities, dimension, fieldQuery, numResults):
		print entities
		http = httplib2.Http()
		#create the query
		if query == '':
			#query = ''.join(e['label'] for e in entities)
			for e in entities:
				if e['uri'].find('dbpedia') != -1:
					query += e['uri'][e['uri'].rfind('/') + 1:]
		query = urllib.quote(query.encode('utf8'))

		#construct the url
		#http://newsreader.scraperwiki.com/cars/summary_of_events_with_event_label?filter=bribe&datefilter=2010
		responses = []
		url = '%s/cars/summary_of_events_with_event_label?filter=%s&datefilter=2010&output=json' % (self.BASE_URL, query)
		if url:
			headers = {'Accept':'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				responses.append({'query' : url, 'data' : content})
		#try to look for
		#https://newsreader.scraperwiki.com/summary_of_events_with_actor?uris.0=dbpedia:Hartmut_Mehdorn
		url =  '%s/cars/summary_of_events_with_actor?uris.0=dbpedia:%s&output=json' % (self.BASE_URL, query.replace('"', '').replace('%20', '_'))
		if url:
			headers = {'Accept':'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				responses.append({'query' : url, 'data' : content})
		url =  '%s/cars/event_details_filtered_by_actor?uris.0=dbpedia:%s&output=json' % (self.BASE_URL, query.replace('"', '').replace('%20', '_'))
		if url:
			headers = {'Accept':'application/json'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				responses.append({'query' : url, 'data' : content})

		return responses

	def __constructQuery(self, entities):
		queryParts = []
		for e in entities:
			queryParts.append('"%s"' % urllib.quote(e['label'].encode('utf8')))
		return ' '.join(queryParts)

	"""
	{"count": 2, "next page": "https://newsreader.scraperwiki.com/cars/summary_of_events_with_event_label/page/2?filter=berlin&datefilter=2010&output=json",
	 "page number": 1, "payload": [{"datetime": "2010-05-05",
	 "event": "http://www.newsreader-project.eu/data/cars/2010/05/05/7YCX-WJS1-2SHG-X1M8.xml#ev17",
	 "event_label": "BERLIN", "event_size": "5"}, {"datetime": "2010-06-02",
	 "event": "http://www.newsreader-project.eu/data/cars/2010/06/02/7YM4-G8G1-2PP8-S20K.xml#ev45",
	 "event_label": "berlin", "event_size": "5"}]}
	"""

	#the data returnde from Anefo is in some RSS format
	def __formatResponse(self, data, dimension):
		enrichments = []
		queries = []
		urls = {}
		for i in data:
			d = i['data']
			q = i['query']
			results = simplejson.loads(d)
			if results and results.has_key('payload'):
				for r in results['payload']:
					if not urls.has_key(r['event']):
						label = None
						source = 'NewsReader'
						date = None
						metadata = self.getEventMetadata(r['event'])
						print metadata
						if metadata:
							if metadata.has_key('title'):
								label = metadata['title']
							if metadata.has_key('source'):
								source = metadata['source']
							if metadata.has_key('date'):
								date = metadata['date']
						e = Enrichment(
							label,
							url=r['event'],#'%s%s' % ('https://newsreader.scraperwiki.com/get_document_metadata?uris.0=', r['event']) ,
							source=source,
							date=date
						)
						urls[r['event']] = True
						enrichments.append(e)
			queries.append(q)
		return queries, enrichments

	def getEventMetadata(self, eventUrl):
		http = httplib2.Http()
		url = 'https://newsreader.scraperwiki.com/get_document_metadata?uris.0=%s' % eventUrl
		print url
		headers = {'Accept':'application/json'}
		resp, content = http.request(url, 'GET', headers=headers)
		md = {}
		if content:
			results = simplejson.loads(content)
			if results.has_key('payload'):
				payload = results['payload']
				if payload.has_key('@graph'):
					g = payload['@graph'][0]
					if g.has_key('dct:created'):
						md['date'] = g['dct:created']['@value']
					if g.has_key('dct:title'):
						md['title'] = g['dct:title']['@value']
					if g.has_key('dct:source'):
						md['source'] = g['dct:source']['@id']
					return md
		return None

