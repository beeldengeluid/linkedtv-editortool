from linkedtv.api.storage.publish.LinkedTVPublishingPoint import LinkedTVPublishingPoint

class PublishingHandler(object):

	def __init__(self):
		self.publishingPoints = {
			'LinkedTV' : LinkedTVPublishingPoint()
		}

	def publish(self, publishingPoint, data):
		return self.publishingPoints[publishingPoint].publish(data)

	def unpublish(self, publishingPoint, mediaResource):
		return self.publishingPoints[publishingPoint].unpublish(mediaResource)