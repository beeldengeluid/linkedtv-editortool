from linkedtv.api.storage.publish.LinkedTVPublishingPoint import LinkedTVPublishingPoint

class PublishingHandler(object):

	def __init__(self):
		self.publishingPoints = {
			'LinkedTV' : LinkedTVPublishingPoint()
		}

	def publish(self, publishingPoint, data):
		self.publishingPoints[publishingPoint].publish(data)

	def unpublish(self, publishingPoint, mediaResource):
		self.publishingPoints[publishingPoint].unpublish(mediaResource)