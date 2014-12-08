import simplejson
import urllib
import httplib2

from linkedtv.model import Enrichment
from linkedtv.LinkedtvSettings import LTV_EUROPEANA
from linkedtv.api.dimension.DimensionService import DimensionService

"""
http://www.europeana.eu/portal/api-search-json.html
"""

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
		if query == '':
			query = ' '.join(e['label'] for e in entities)
		query = urllib.quote(query.encode('utf8'))
		query = urllib.quote('what:%s' %  query)

		print query

		url = '%s?wskey=%s&query=%s' % (self.BASE_URL, self.API_KEY, query)
		if dimension['service']['params'].has_key('queryParts'):
			for qf in dimension['service']['params']['queryParts']:
				url += '&qf=%s' % qf
		url += '&rows=100'
		print url
		return url

	"""
	{
			'index':0,
			'guid':'http://www.europeana.eu/portal/record/2021609/objecten_7064.html?utm_source=api&utm_medium=api&utm_campaign=1hfhGH67Jhs',
			'rights':[
				'http://creativecommons.org/licenses/by/3.0/',
				u''
			],
			'completeness':10,
			'edmTimespanLabelLangAware':{
				'ru':[
					u'4-\u044f \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u044c 18-\u0433\u043e \u0432\u0435\u043a\u0430'
				],
				'fr':[
					u'4e quart 18e si\xe8cle'
				],
				'en':[
					'4 quarter of the 18th century'
				],
				'def':[
					'1778'
				]
			},
			'language':[
				'nl'
			],
			'title':[
				'Rechthoekige witte geboorteplaquette met geschulpte rand, met "Elisabeth Muijs geboore den 24 augustus 1778, gedoopt den 27 augustus, in den jaare 1778 te Rotterdam"'
			],
			'europeanaCompleteness':10,
			'edmDatasetName':[
				'2021609_Ag_NL_DigitaleCollectie_museum-rotterdam'
			],
			'year':[
				'1778'
			],
			'edmTimespanLabel':[
				{
					'def':'4 quarter of the 18th century'
				},
				{
					'def':u'4-\u044f \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u044c 18-\u0433\u043e \u0432\u0435\u043a\u0430'
				},
				{
					'def':u'4e quart 18e si\xe8cle'
				},
				{
					'def':'1778'
				}
			],
			'link':'http://europeana.eu/api/v2/record/2021609/objecten_7064.json?wskey=1hfhGH67Jhs',
			'europeanaCollectionName':[
				'2021609_Ag_NL_DigitaleCollectie_museum-rotterdam'
			],
			'provider':[
				'Digitale Collectie'
			],
			'edmIsShownAt':[
				'http://europeana.eu/api/22681434/redirect?shownAt=http%3A%2F%2Fcollectie.museumrotterdam.nl%2Fobjecten%2F7064%3Fbt%3Deuropeanaapi&provider=Digitale+Collectie&id=http%3A%2F%2Fwww.europeana.eu%2Fresolve%2Frecord%2F2021609%2Fobjecten_7064&profile=standard'
			],
			'score':3.316001,
			'edmPreview':[
				'http://europeanastatic.eu/api/image?uri=http%3A%2F%2Fcollectie.museumrotterdam.nl%2Fbeeld%2F7064_1.jpg&size=LARGE&type=IMAGE'
			],
			'dataProvider':[
				'Museum Rotterdam'
			],
			'type':'IMAGE',
			'id':'/2021609/objecten_7064'
		}
	"""
	def __formatResponse(self, data, dimension):
		data = simplejson.loads(data)
		enrichments = []
		if data.has_key('items'):
			for e in data['items']:
				if e.has_key('title') and len(e['title']) > 0:
					enrichment = Enrichment(
						e['title'][0],
						url=e['guid'],
						enrichmentType=e['type']
					)
					if e.has_key('dataProvider'):
						enrichment.setSource(e['dataProvider'][0])
					if e.has_key('edmPreview'):
						enrichment.setPoster(e['edmPreview'][0])
					enrichments.append(enrichment)
		return { 'enrichments' : enrichments}
