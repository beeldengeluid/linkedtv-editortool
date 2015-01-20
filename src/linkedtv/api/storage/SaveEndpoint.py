import simplejson
import redis
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS

class SaveEndpoint():

	def __init__(self):
		self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

	def saveVideo(self, saveData):
		print 'Saving to: %s' % saveData['uri']
		sd = {'chapters' : saveData['chapters'], 'uri' : saveData['uri']}#leave out the subtitles (for now :s)
		self.cache.set('__%s' % saveData['uri'], simplejson.dumps(sd))
		return {'uri' : saveData['uri']}

	def loadCuratedResource(self, uri):
		print 'Getting %s from cache' % uri
		if self.cache.exists('__%s' % uri):
			return simplejson.loads(self.cache.get('__%s' % uri))
		return None
