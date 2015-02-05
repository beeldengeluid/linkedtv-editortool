#https://code.google.com/p/solrpy/
import solr

from linkedtv.api.storage.synchronize.Synchronizer import Synchronizer
from linkedtv.api.storage.SaveEndpoint import SaveEndpoint
from linkedtv.api.storage.load.ltv.LinkedTVSubtitleLoader import LinkedTVSubtitleLoader

from linkedtv.LinkedtvSettings import LTV_SOLR_INDEX

from linkedtv.utils.TimeUtils import TimeUtils

from linkedtv.utils.IdUtils import IdUtils

class LinkedTVSOLRIndex(Synchronizer):

	def __init__(self):
		self.SOLR_CONN_URL = 'http://%s:%d/solr' % (LTV_SOLR_INDEX['host'], LTV_SOLR_INDEX['port'])
		self.PROVIDER_MAPPING = {
			'rbb' : { 'index' : 'RBBindex', 'chapterType' : 'NewsItem'},
			'sv' : { 'index' : 'SVindex', 'chapterType' : 'ArtObject'}
		}

	#This function is used for synching on page load (see synchronize.syncOnLoad in config.js)
	def synchronize(self, resourceUri, provider):
		print 'Synchronizing %s with the SOLR index' % resourceUri
		sep = SaveEndpoint()
		mediaResource = sep.loadCuratedResource(resourceUri, False)
		#print mediaResource
		if not mediaResource or not mediaResource.has_key('chapters') or not mediaResource.has_key('uri'):
			return False
		doc = None
		conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
		for c in mediaResource['chapters']:
			subLoader = LinkedTVSubtitleLoader()
			subtitles = subLoader.loadSubtitleFragmentByResourceUri(resourceUri, c['start'], c['end'])
			fragmentId = None
			solrId = None
			if c.has_key('mediaFragmentId'):
				fragmentId = c['mediaFragmentId']
			else:
				fragmentId = IdUtils.generateMediaFragmentId(mediaResource['uri'], c['start'], c['end'])
			if c.has_key('solrId'):
				solrId = c['solrId']
			doc = {
				'id' : fragmentId,
				'curated' : True,
				'provider' : provider.upper(),
				'videoId' : mediaResource['uri'],
				'chapterTitle' : c['label'],
				'startTime' : c['start'],
				'endTime' : c['end'],
				'type' : 'Chapter',
				'chapterType' : self.PROVIDER_MAPPING[provider]['chapterType'],
				'subtitle' : subtitles, #fetch from subtitle collection on the client side
			}
			#check if there is a solrId that does not match the mediafragmentId (out of synch)
			if solrId and solrId != fragmentId:
				conn.delete(id=solrId)

			#add the up to date solr document
			conn.add(doc)
		conn.commit()
		conn.close()
		return True

	#This function is used for synching individual chapters (see synchronize.syncOnSave in config.js)
	def synchronizeChapter(self, data):
		if data.has_key('chapter') and data.has_key('provider') and data.has_key('uri') and data.has_key('subtitles'):
			c = data['chapter']
			if not c:
				return None
			provider = data['provider']
			start = TimeUtils.toStringSeconds(c['start'])
			end = TimeUtils.toStringSeconds(c['end'])
			subtitles = self.__extractSubtitleString(data)
			solrId = None
			if c.has_key('solrId'):
				solrId = c['solrId']
			conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
			doc = {
				'id' : c['mediaFragmentId'],
				'curated' : True,
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
				conn.delete(id=solrId)
			conn.add(doc)
			conn.commit()
			conn.close()
			return c['mediaFragmentId']
		return None

	#this function is called when deleting a chapter (and synchronization.syncOnSave == true in config.js)
	def disconnectChapter(self, solrId, provider):
		conn = solr.Solr('http://data.linkedtv.eu:8983/solr/%s' % self.PROVIDER_MAPPING[provider]['index'])
		conn.delete(id=solrId)
		conn.commit()
		conn.close()
		return True

	def __extractSubtitleString(self, data):
		s = []
		if data.has_key('subtitles'):
			subs = data['subtitles']
			for sub in subs:
				s.append(sub['label'].strip())
		return ' '.join(s)
