from linkedtv.api.storage.load.ltv.LinkedTVDataLoader import LinkedTVDataLoader
from linkedtv.api.storage.load.beng.BengDataLoader import BengDataLoader
from linkedtv.api.storage.load.europeanaspace.EuropeanaSpaceDataLoader import EuropeanaSpaceDataLoader

class DataLoadHandler(object):

	def __init__(self):
		self.platforms = {
			'linkedtv' : LinkedTVDataLoader(),
			'europeanaspace' : EuropeanaSpaceDataLoader(),
			'beng' : BengDataLoader()
		}

	def loadMediaResourceData(self, platform, resourceUri, clientIP, loadAnnotations):
		if self.platforms.has_key(platform):
			return self.platforms[platform].loadMediaResourceData(resourceUri, clientIP, loadAnnotations)
		return None

	def loadMediaResources(self, platform, provider):
		if self.platforms.has_key(platform):
			return self.platforms[platform].loadMediaResources(provider)
		return None