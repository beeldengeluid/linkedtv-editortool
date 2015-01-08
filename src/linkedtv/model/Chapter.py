from linkedtv.model.Annotation import Annotation

class Chapter(Annotation):

	def __init__(self, label, description = None, start = 0, end = 0, annotationURI = None,	relevance = 1,
		confidence = 1, poster = None, dimensions = None, _type = 'auto', guid = None):
		Annotation.__init__(self, label, description, start, end, annotationURI, relevance, confidence)
		self.poster = poster
		self.dimensions = dimensions
		self.type = _type
		self.guid = guid

	def setPoster(self, poster):
		self.poster = poster

	def getPoster(self):
		return self.poster

	def setDimensions(self, dimensions):
		self.dimensions = dimensions

	def getDimensions(self):
		return self.dimensions

	def setType(self, _type):
		self.type = _type

	def getType(self):
		return self.type

	def setGuid(self, guid):
		self.guid = guid

	def getGuid(self):
		return self.guid
