class Entity(object):

	def __init__(self, uri, label, entityType=None):
		self.uri = uri
		self.label = label
		self.type = entityType

	def setUri(self, uri):
		self.uri = uri

	def getUri(self):
		return self.uri

	def setLabel(self, label):
		self.label = label

	def getLabel(self):
		return self.label

	def setType(self, entityType):
		self.type = entityType

	def getType(self):
		return self.type
