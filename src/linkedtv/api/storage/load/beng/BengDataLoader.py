from linkedtv.api.storage.load.DataLoader import DataLoader

class BengDataLoader(DataLoader):

	def __init__(self):
		print 'to be implemented'

	def loadMediaResourceData(self, resourceUri, clientIP, loadAnnotations):
		return None

	def loadMediaResources(self, provider):
		return None

	def reindex(self, provider = None):
		return False