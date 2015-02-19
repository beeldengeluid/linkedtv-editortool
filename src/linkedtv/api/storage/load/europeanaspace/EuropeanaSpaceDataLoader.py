import simplejson
import redis
from simplejson import JSONDecodeError
from linkedtv.model import *
from linkedtv.api.storage.load.DataLoader import DataLoader
from linkedtv.api.storage.load.ltv.video.VideoPlayoutHandler import VideoPlayoutHandler

class EuropeanaSpaceDataLoader(DataLoader):

	def __init__(self):
		self.cache = redis.Redis(host='localhost', port=6379, db=2)
		self.BASE_SPRINGFIELD_URL = 'http://stream19.noterik.com/progressive/stream19'

	#implementation of DataLoader function
	def loadMediaResourceData(self, resourceUri, clientIP, loadAnnotations):
		mediaResource = MediaResource(resourceUri)

		#load the annotations (only named entities in this case)
		mediaResource = self.__getAllAnnotationsOfResource(mediaResource)

		#fetch the video metadata
		mediaResource = self.__getAllVideoMetadata(mediaResource, clientIP)

		#transform the mediaresource object to JSON and return it
		resp = simplejson.dumps(mediaResource, default=lambda obj: obj.__dict__)
		return resp

	#implementation of DataLoader function
	def loadMediaResources(self, provider):
		videos = []
		vids = []
		#todo actually load the videos from somewhere
		keys = self.cache.hkeys('espacevids')
		for k in keys:
			vids.append(simplejson.loads(self.cache.hget('espacevids', k)))
		for vd in vids:
			if vd['id'].find('e') == -1: #only add german movies for now
				video = {
					'id' : vd['id'],
					'title' : vd['title'],
					'date' : vd['date'],
					'locator' : vd['videoUrl'],
					'thumbUrl' : vd['thumbUrl'],
					'thumbBaseUrl' : vd['thumbUrl'][0:vd['thumbUrl'].find('h/0')]
				}
				videos.append(video)
		return {'videos' : videos}


	"""TODO create some function that reads named entities from some cache"""
	def __getAllAnnotationsOfResource(self, mediaResource):
		nes = []
		"""
		nes.append(NamedEntity(
			label,
			entityType=LinkedTVDataUtils.getNEType(DCType, RDFType, OWLSameAs),
			subTypes=LinkedTVDataUtils.getDCTypes(DCType),
			disambiguationURL=OWLSameAs,
			start=start,
			end=end,
			annotationURI=annotationURI,
			relevance=r,
			confidence=c
			)
		)
		"""
		mediaResource.setNamedEntities(nes)

		return mediaResource

	def __getAllVideoMetadata(self, mediaResource, clientIP):
		print mediaResource.getId()
		vd = simplejson.loads(self.cache.hget('espacevids', mediaResource.getId()))
		print vd
		mediaResource.setVideoMetadata(vd)

		#load the video URL from Noterik
		if vd.has_key('videoUrl'):
			vph = VideoPlayoutHandler()
			playoutURL = vph.getPlayoutURL('%s%s' % (self.BASE_SPRINGFIELD_URL, vd['videoUrl']), clientIP)
			#playoutURL = '%s%s%s' % (self.BASE_SPRINGFIELD_URL, vd['videoUrl'], '/rawvideo/2/raw.mp4')
			print vd['videoUrl']
			print playoutURL
			mediaResource.setPlayoutUrl(playoutURL)

		#set the video metadata in the mediaresource
		mediaResource.setTitle(vd['title'])
		mediaResource.setDate(vd['date'])
		mediaResource.setThumbBaseUrl(vd['thumbUrl'][0:vd['thumbUrl'].find('h/0')])
		mediaResource.setSrtUrl(vd['subtitleFile'])#TODO add a base url
		mediaResource.setSubtitles(vd['subtitles'])

		return mediaResource
