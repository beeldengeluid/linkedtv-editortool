from linkedtv.model.Annotation import Annotation

class NamedEntity(Annotation):

	def __init__(self, label, description = None, entityType = None, subTypes = None, disambiguationURL = None,
		start =0 , end = 0 , mfURI = None, annotationURI = None, bodyURI = None,
		relevance = 0 , confidence = 0):
		Annotation.__init__(self, label, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)
		self.type = entityType
		self.subTypes = subTypes
		self.disambiguationURL = disambiguationURL

	def setType(self, entityType):
		self.type = entityType

	def getType(self):
		return self.type

	def setSubTypes(self, subTypes):
		self.subTypes = subTypes

	def getSubTypes(self):
		return self.subTypes

	def setDisambiguationUrl(self, disambiguationURL):
		self.disambiguationURL = disambiguationURL

	def getdisambiguationUrl(self):
		return self.disambiguationURL