

class MediaResource(object):
	
	def __init__(self, mediaResourceID=None):
		self.id = mediaResourceID #URI (main identifier in the LinkedTV API)
		self.concepts = [] #Concept
		self.nes = [] #NamedEntity
		self.shots = [] #Shot
		self.chapters = [] #Chapter
		self.enrichments = [] #Enrichment		
		self.videoMetadata = None
		self.playoutUrl = None
		self.thumbBaseUrl = None
		self.srtUrl = None
		self.curatedMediaResource = None #MediaResource

	def setId(self, mediaResourceID):
		self.id = mediaResourceID

	def getId(self):
		return self.id

	def setConcepts(self, concepts):
		self.concepts = concepts

	def getConcepts(self):
		return self.concepts

	def setNamedEntities(self, nes):
		self.nes = nes

	def getNamedEntities(self):
		return self.nes

	def setShots(self, shots):
		self.shots = shots

	def getShots(self):
		return self.shots

	def setChapters(self, chapters):
		self.chapters = chapters

	def getChapters(self):
		return self.chapters

	def setEnrichments(self, enrichments):
		self.enrichments = enrichments

	def getEnrichments(self):
		return self.enrichments

	def setVideoMetadata(self, videoMetadata):
		self.videoMetadata = videoMetadata

	def getVideoMetadata(self):
		return videoMetadata

	def setPlayoutUrl(self, playoutUrl):
		self.playoutUrl = playoutUrl

	def getPlayoutUrl(self):
		return self.playoutUrl

	def setThumbBaseUrl(self, thumbBaseUrl):
		self.thumbBaseUrl = thumbBaseUrl

	def getThumbBaseUrl(self):
		return self.thumbBaseUrl

	def setSrtUrl(self, srtUrl):
		self.srtUrl = srtUrl

	def getSrtUrl(self):
		return self.srtUrl

	def setCuratedMediaResource(self, curatedMediaResource):
		self.curatedMediaResource = curatedMediaResource

	def getCuratedMediaResource(self):
		return self.curatedMediaResource
