class Entity(object):

	def __init__(self, uri, label, entityType = None, etURI = None):
		self.uri = uri
		self.label = label		
		self.type = entityType
		self.etURI = etURI

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

	def setEtURI(self, etURI):
		self.etURI = etURI

	def getEtURI(self):
		return self.etURI
