from linkedtv.model.Annotation import Annotation

class Enrichment(Annotation):

	def __init__(self, label,  description = None, start = 0, end = 0, mfURI = None, annotationURI = None, bodyURI = None,
		relevance = 1, confidence = 1, uri = None, poster = None, source=None, creator=None, date=None, entities=None,
		socialInteraction=None, DCType=None, url=None):
		Annotation.__init__(self, label, description, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)
		self.uri = uri #actually it should be url, but it's too much hassle too update for now
		self.poster = poster
		self.source = source
		self.creator = creator
		self.date = date
		self.entities = entities #Entity
		self.socialInteraction = socialInteraction
		self.DCType = DCType
		self.url = url

	def setUri(self, uri):
		self.uri = uri

	def getUri(self):
		return self.uri

	def setPoster(self, poster):
		self.poster = poster

	def getPoster(self):
		return self.poster

	def setSource(self, source):
		self.source = source

	def getSource(self):
		return self.source

	def setCreator(self, creator):
		self.creator = creator

	def getCreator(self):
		return self.creator

	def setDate(self, date):
		self.date = date

	def getDate(self):
		return self.date

	def setEntities(self, entities):
		self.entities = entities

	def getEntities(self):
		return self.entities

	def setSocialInteraction(self, socialInteraction):
		self.socialInteraction = socialInteraction

	def getSocialInteraction(self):
		return self.socialInteraction

	def setDCType(self, DCType):
		self.DCType = DCType

	def getDCType(self):
		return self.DCType

	def setUrl(self, url):
		self.url = url

	def getUrl(self):
		return self.url
