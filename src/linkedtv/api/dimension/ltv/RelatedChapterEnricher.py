import simplejson
import urllib
import httplib2
import solr
import base64

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService
from linkedtv.LinkedtvSettings import LTV_PLATFORM_LOGIN
from linkedtv.utils.TimeUtils import TimeUtils

class RelatedChapterEnricher(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'RelatedChapterEnricher')
		self.SOLR_CONN_URL = 'http://data.linkedtv.eu:8983/solr'
		self.PROVIDER_MAPPING = {
			'rbb' : { 'index' : 'RBBindex', 'chapterType' : 'NewsItem'},
			'sv' : { 'index' : 'SVindex', 'chapterType' : 'ArtObject'}
		}
		self.searchLimit = 50

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			queryUrl, results = self.__search(query, entities, dimension)
			enrichments = self.__formatResponse(results, dimension)
			if queryUrl and results:
				return {'enrichments' : enrichments, 'queries' : [queryUrl]}
		return None

	def __isValidDimension(self, dimension):
		if dimension.has_key('service'):
			if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
				return dimension['service']['params'].has_key('provider') and dimension['service']['params'].has_key('curatedOnly')
		return False

	#TODO switch to the HTTP endpoint?
	def __search(self, query, entities, dimension):
		provider = dimension['service']['params']['provider']
		curatedOnly = dimension['service']['params']['curatedOnly']
		if curatedOnly:
			curatedOnly = 'true'
		else:
			curatedOnly = 'false'
		if self.PROVIDER_MAPPING.has_key(provider):
			#create the query
			if query == '':
				query = ''.join(e['label'] for e in entities)
			query = urllib.quote(query.encode('utf8'))

			#send to SOLR
			conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
			select = conn.select
			res = select.__call__(
				q='%s AND type:Chapter AND curated:%s' % (query, curatedOnly),
				fields=['id', 'chapterTitle', 'videoId', 'startTime', 'endTime', 'type'],
				rows=100
			)
			if res:
				return query, res
		return None, None

	def __getMediaFragmentData(self, resourceUri, startTime):
		pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
		http = httplib2.Http()
		url = 'http://api.linkedtv.eu/mediaresource/%s' % resourceUri
		headers = {
			'Accept' : 'application/json',
			'Authorization' : 'Basic %s' % pw,
		}
		resp, content = http.request(url, 'GET', headers=headers)
		if resp and resp['status'] == '200':
			if content:
				videoData = simplejson.loads(content)
				video = {}
				if videoData.has_key('mediaResource') and videoData['mediaResource']:
					video['title'] = videoData['mediaResource']['titleName']
					if videoData['mediaResource']['mediaResourceRelationSet']:
						for mrr in videoData['mediaResource']['mediaResourceRelationSet']:
							if mrr['relationType'] == 'thumbnail-locator' and startTime:
								t = TimeUtils.toTimeTuple(str(startTime))
								video['poster'] = '%sh/%d/m/%d/sec%d.jpg' % (mrr['relationTarget'], t[0], t[1], t[2])
				return video
		return None

	#TODO die afrondingen voor tijd kloppen voor geen meter!
	def __formatResponse(self, data, dimension):
		if data:
			enrichments = []
			for e in data:
				#get the video data for the episode title and the poster
				videoData = self.__getMediaFragmentData(e['videoId'], e['startTime'])
				if e.has_key('chapterTitle'):
					title = e['chapterTitle']
					if videoData.has_key('title'):
						title = '%s [%s]' % (e['chapterTitle'], videoData['title'])
					enrichment = Enrichment(
						title,
						description=title,
						url='http://api.linkedtv.eu/mediaresource/%s' % e['id'], #the ide is the mediafragment id
						start=int(e['startTime'] * 1000),
						end=int(e['endTime'] * 1000),
						source='LinkedTV'
					)
					if videoData.has_key('poster'):
						enrichment.setPoster(videoData['poster'])
					enrichments.append(enrichment)
			return enrichments
		return None
