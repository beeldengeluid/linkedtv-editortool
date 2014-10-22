from linkedtv.api.storage.publish.PublishingPoint import PublishingPoint

class LinkedTVPublishingPoint(PublishingPoint):

	def __init__(self):
		PublishingPoint.__init__(self, 'LinkedTV platform')

	def publish(self, data):
		PublishingPoint.publish(self, data)
		return None