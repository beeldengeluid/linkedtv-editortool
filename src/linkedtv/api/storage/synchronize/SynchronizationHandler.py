from linkedtv.api.storage.synchronize.ltv.LinkedTVSOLRIndex import LinkedTVSOLRIndex

class SynchronizationHandler(object):

	def __init__(self):
		self.platforms = {
			'LinkedTVSOLR' : LinkedTVSOLRIndex()
		}

	def synchronize(self, platform, resourceUri, provider):
		if self.platforms.has_key(platform):
			syncher = self.platforms[platform]
			return syncher.synchronize(resourceUri, provider)
		return False

	def synchronizeChapter(self, platform, data):
		if self.platforms.has_key(platform):
			syncher = self.platforms[platform]
			return syncher.synchronizeChapter(data)
		return None

	def disconnectChapter(self, platform, externalId, provider):
		if self.platforms.has_key(platform):
			syncher = self.platforms[platform]
			return syncher.disconnectChapter(externalId, provider)
		return False
