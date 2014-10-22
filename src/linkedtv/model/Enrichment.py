class Enrichment(object):

	def __init__(self, url, label, poster, start, end, source=None, creator=None, date=None, entities=None,
		socialInteraction=None, bodyURI=None, DCType=None):
		self.url = url
		self.label = label
		self.poster = poster
		self.start = start
		self.end = end
		self.source = source
		self.creator = creator
		self.date = date
		self.entities = entities
		self.socialInteraction = socialInteraction
		self.bodyURI = bodyURI
		self.DCType = DCType

	def setUrl(self, url):
		self.url = url

	def getUrl(self):
		return self.url

	def setLabel(self, label):
		self.label = label

	def getLabel(self):
		return self.label

	def setPoster(self, poster):
		self.poster = poster

	def getPoster(self):
		return self.poster

	def setStart(self, label):
		self.start = start

	def getStart(self):
		return self.start

	def setEnd(self, end):
		self.end = end

	def getEnd(self):
		return self.end

	"""------------------optional properties-----------------"""

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

	def setBodyURI(self, bodyURI):
		self.bodyURI = bodyURI

	def getBodyURI(self):
		return self.bodyURI

	def setDCType(self, DCType):
		self.DCType = DCType

	def getDCType(self):
		return self.DCType


