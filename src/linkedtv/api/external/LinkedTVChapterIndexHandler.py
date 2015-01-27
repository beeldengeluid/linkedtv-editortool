#https://code.google.com/p/solrpy/
import solr
from linkedtv.utils.TimeUtils import TimeUtils
from linkedtv.LinkedtvSettings import LTV_SOLR_INDEX
from linkedtv.api.storage.SaveEndpoint import SaveEndpoint
from linkedtv.api.storage.load.ltv.LinkedTVSubtitleLoader import LinkedTVSubtitleLoader

class LinkedTVChapterIndexHandler(object):

	def __init__(self):
		self.SOLR_CONN_URL = 'http://%s:%d/solr' % (LTV_SOLR_INDEX['host'], LTV_SOLR_INDEX['port'])
		self.PROVIDER_MAPPING = {
			'rbb' : { 'index' : 'RBBindex', 'chapterType' : 'NewsItem'},
			'sv' : { 'index' : 'SVindex', 'chapterType' : 'ArtObject'}
		}

	#find the right chapter first
	def updateChapter(self, data):
		if data.has_key('chapter') and data.has_key('provider') and data.has_key('uri') and data.has_key('subtitles'):
			c = data['chapter']
			if not c:
				return None
			provider = data['provider']
			start = TimeUtils.toStringSeconds(c['start'])
			end = TimeUtils.toStringSeconds(c['end'])
			subtitles = self.extractSubtitleString(data)
			solrId = None
			if c.has_key('solrId'):
				solrId = c['solrId']
			conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
			doc = {
				'id' : c['mediaFragmentId'],
				'provider' : provider.upper(),
				'videoId' : data['uri'],
				'chapterTitle' : c['label'],
				'startTime' : start,
				'endTime' : end,
				'type' : 'Chapter',
				'chapterType' : self.PROVIDER_MAPPING[provider]['chapterType'],
				'subtitle' : subtitles, #fetch from subtitle collection on the client side
			}
			#if the solrId is different delete the old document first (fyi the boundaries of the chapter were changed)
			if solrId and solrId != c['mediaFragmentId']:
				print 'deleting the old SOLR document first: %s' % solrId
				conn.delete(id=solrId)
			conn.add(doc)
			conn.commit()
			conn.close()
			return c['mediaFragmentId']
		return None

	def synchronizeResourceWithIndex(self, resourceUri, provider):
		print 'Synchronizing %s with the SOLR index' % resourceUri
		sep = SaveEndpoint()
		mediaResource = sep.loadCuratedResource(resourceUri, False)
		print mediaResource
		if not mediaResource or not mediaResource.has_key('chapters') or not mediaResource.has_key('uri'):
			return False
		doc = None
		conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
		for c in mediaResource['chapters']:
			start = TimeUtils.toStringSeconds(c['start']) * 1000
			end = TimeUtils.toStringSeconds(c['end']) * 1000
			subLoader = LinkedTVSubtitleLoader()
			subtitles = subLoader.loadSubtitleFragmentByResourceUri(resourceUri, start, end)
			fragmentId = None
			solrId = None
			if c.has_key('mediaFragmentId'):
				fragmentId = c['mediaFragmentId']
			else:
				fragmentId = 'CONSTRUCTANID'
			if c.has_key('solrId'):
				solrId = c['solrId']
			doc = {
				'id' : fragmentId,
				'provider' : provider.upper(),
				'videoId' : mediaResource['uri'],
				'chapterTitle' : c['label'],
				'startTime' : start,
				'endTime' : end,
				'type' : 'Chapter',
				'chapterType' : self.PROVIDER_MAPPING[provider]['chapterType'],
				'subtitle' : subtitles, #fetch from subtitle collection on the client side
			}
			print doc
			#check if there is a solrId that does not match the mediafragmentId (out of synch)
			if solrId and solrId != fragmentId:
				print 'deleting the old SOLR document first: %s' % solrId
				conn.delete(id=solrId)

			#add the up to date solr document
			conn.add(doc)
		#conn.commit()
		conn.close()
		return True

	def deleteChapter(self, solrId, provider):
		conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
		conn.delete(id=solrId)
		res = conn.commit()
		conn.close()
		return True

	def extractSubtitleString(self, data):
		s = []
		if data.has_key('subtitles'):
			subs = data['subtitles']
			for sub in subs:
				s.append(sub['label'].strip())
		return ' '.join(s)
