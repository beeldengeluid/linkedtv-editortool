import simplejson
import urllib
import httplib2

from linkedtv.model import Enrichment
from linkedtv.LinkedtvSettings import LTV_EUROPEANA
from linkedtv.api.dimension.DimensionService import DimensionService

"""
SEARCH API DOCS:
	http://www.europeana.eu/portal/api-search-json.html

FOR THE RIGHTS/LICENSES CHECK:
	http://pro.europeana.eu/share-your-data/rights-statement-guidelines/available-rights-statements
"""

class EuropeanaAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'EuropeanaAPI')
		self.API_KEY = LTV_EUROPEANA['apikey']
		self.BASE_URL = 'http://www.europeana.eu/api/v2/search.json'
		self.RIGHTS = {
			'http://creativecommons.org/publicdomain/mark/1.0/' : ['open'],
			'http://www.europeana.eu/rights/out-of-copyright-non-commercial/' : ['restricted'],
			'http://creativecommons.org/publicdomain/zero/1.0/' : ['open'],
			'http://creativecommons.org/licenses/by/4.0/' : ['credit'],
			'http://creativecommons.org/licenses/by-sa/4.0/' : ['sa'],
			'http://creativecommons.org/licenses/by-nd/4.0/' : ['nd', 'sa'],
			'http://creativecommons.org/licenses/by-nc/4.0/' : ['nc'],
			'http://creativecommons.org/licenses/by-nc-sa/4.0/' : ['nc', 'sa'],
			'http://creativecommons.org/licenses/by-nc-nd/4.0/' : ['nc', 'nd'],
			'http://www.europeana.eu/rights/rr-f/' : ['restricted'],
			'http://www.europeana.eu/rights/rr-p/' : ['restricted', 'paid'],
			'http://www.europeana.eu/rights/orphan-work-eu/' : ['orphan'],
			'http://www.europeana.eu/rights/unknown/' : ['unknown']
		}
		self.DESIRED_AMOUNT_OF_RESULTS = 300
		#1hfhGH67Jhs
		#KtbDppuVD

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			queryUrl, results = self.__search(query, entities, dimension)
			if queryUrl and results:
				return { 'enrichments' : self.__formatResponse(results, dimension), 'queries' : [queryUrl]}
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
				return url, content
		return None, None

	def __getServiceUrl(self, query, entities, dimension):
		if query == '':
			query = ' '.join(e['label'] for e in entities)
		query = urllib.quote(query.encode('utf8'))
		#query = urllib.quote('what:%s' %  query)
		#query = urllib.quote(query)

		print query

		url = '%s?wskey=%s&query=%s' % (self.BASE_URL, self.API_KEY, query)
		if dimension['service']['params'].has_key('queryParts'):
			for qf in dimension['service']['params']['queryParts']:
				url += '&qf=%s' % qf
		url += self.__getRightsUrlPart(dimension)
		url += '&rows=%d' % self.DESIRED_AMOUNT_OF_RESULTS
		print url
		return url

	def __getRightsUrlPart(self, dimension):
		if dimension['service']['params'].has_key('rights'):
			#url += '&qf=rights:%s' % ','.join(dimension['service']['params']['rights'])
			rights = dimension['service']['params']['rights']
			requestedRights = []
			for r in rights:
				for key in self.RIGHTS.keys():
					if r in self.RIGHTS[key]:
						requestedRights.append(key)
			print requestedRights
			return  '&qf=RIGHTS:%s' % '&qf=RIGHTS:'.join(requestedRights)
		return ''

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
						enrichmentType=e['type'],
						description=e['title'][0]
					)
					if e.has_key('dataProvider'):
						enrichment.setSource(e['dataProvider'][0])
					if e.has_key('year'):
						enrichment.setDate(e['year'][0])
					if e.has_key('edmPreview'):
						enrichment.setPoster(e['edmPreview'][0])
					enrichment.setNativeProperties(e)
					enrichments.append(enrichment)
		return enrichments
