import simplejson
from elasticsearch import Elasticsearch

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService
from linkedtv.LinkedtvSettings import LTV_ES_SETTINGS
from linkedtv.utils.TimeUtils import TimeUtils

class ESRelatedVideoEnricher(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'ESChapterEnricher')
		self.es = Elasticsearch(host=LTV_ES_SETTINGS['host'], port=LTV_ES_SETTINGS['port'])
		self.indexName = LTV_ES_SETTINGS['index']
		self.docType = LTV_ES_SETTINGS['doc-type']
		self.searchLimit = 50

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			queryUrl, results = self.__search(query, entities, dimension)
			if queryUrl and results:
				return {'enrichments' : self.__formatResponse(results, dimension), 'queries' : [queryUrl]}
		return None

	def __isValidDimension(self, dimension):
		return True

	#TODO switch to the HTTP endpoint?
	def __search(self, query, entities, dimension):
		query = {"query":
					{"bool":
						{"must":[
							{"query_string":{"default_field":"subtitles","query": '\"%s\"' % query}}
						]
						,"must_not":[],
						"should":[]
						}
					},
					"from":0,
					"size":self.searchLimit,
					"facets":{}
		}

		print query
		resp = self.es.search(index=self.indexName, doc_type=self.docType, body=query, timeout="10s")
		if resp:
			return query, resp
		return None, None

	#TODO die afrondingen voor tijd kloppen voor geen meter!
	def __formatResponse(self, data, dimension):
		if data:
			enrichments = []
			total = data['hits']['total']
			for hit in data['hits']['hits']:
				vid = hit['_source']
				#get the video data for the episode title and the poster
				if vid['id'].find('e') == -1:
					enrichment = Enrichment(
						vid['title'],
						description=vid['description'],
						url=vid['videoUrl'],
						source='RBB'
					)
					if vid.has_key('thumbnail'):
						enrichment.setPoster(vid['thumbnail'])
					enrichments.append(enrichment)
			return enrichments
		return None
