from linkedtv.api.storage.synchronize.ltv.LinkedTVSOLRIndex import LinkedTVSOLRIndex

"""
TODO move chapter synchronization here as well
"""

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
