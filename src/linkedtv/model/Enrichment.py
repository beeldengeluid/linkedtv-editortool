from linkedtv.model.Annotation import Annotation

class Enrichment(Annotation):

	def __init__(self, label,  description = None, start = 0, end = 0, annotationURI = None, relevance = 1,
		confidence = 1, uri = None, poster = None, source=None, creator=None, date=None,
		entities=None,	enrichmentType=None, url=None, additionalProperties=None):
		Annotation.__init__(self, label, description, start, end, annotationURI, relevance, confidence)
		self.uri = uri #only used for information cards
		self.url = url #used for regular enrichments
		self.poster = poster
		self.source = source #also used for filtering in the UI
		self.creator = creator
		self.date = date
		self.enrichmentType = enrichmentType #video/audio/image, but possibly other things...
		self.entities = entities #Entity + also used in the UI for filtering
		self.additionalProperties = additionalProperties #stores all properties that do not fit this class

	def setUri(self, uri):
		self.uri = uri

	def getUri(self):
		return self.uri

	def setUrl(self, url):
		self.url = url

	def getUrl(self):
		return self.url

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

	def setEnrichmentType(self, enrichmentType):
		self.enrichmentType = enrichmentType

	def getEnrichmentType(self):
		return self.enrichmentType

	def setEntities(self, entities):
		self.entities = entities

	def getEntities(self):
		return self.entities

	def setAdditionalProperties(self, additionalProperties):
		self.additionalProperties = additionalProperties

	def getAdditionalProperties(self):
		return additionalProperties

	def __eq__(self, other):
		if self.uri:
			return self.uri == other.uri
		elif self.url:
			return self.url == other.url
		else:
			return self.label == other.label

	def __hash__(self):
		if self.uri:
			return hash(self.uri)
		elif self.url:
			return hash(self.url)
		else:
			return hash(self.label)
