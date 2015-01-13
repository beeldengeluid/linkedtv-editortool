

class MediaResource(object):

	def __init__(self, mediaResourceID = None, title = None, date = None, concepts = [], nes = [], shots = [], chapters = [],
		enrichments = [], videoMetadata = None, playoutUrl = None, thumbBaseUrl = None, srtUrl = None,
		curatedMediaResource = None, subtitles = None):
		self.id = mediaResourceID #URI (main identifier in the LinkedTV API)
		self.title = title
		self.date = date
		self.concepts = concepts #Concept
		self.nes = nes #NamedEntity
		self.shots = shots #Shot
		self.chapters = chapters #Chapter
		self.enrichments = enrichments #Enrichment
		self.videoMetadata = videoMetadata
		self.playoutUrl = playoutUrl
		self.thumbBaseUrl = thumbBaseUrl
		self.srtUrl = srtUrl
		self.curatedMediaResource = curatedMediaResource #MediaResource
		self.subtitles = subtitles #So far only used by RBB entity expansion

	def setId(self, mediaResourceID):
		self.id = mediaResourceID

	def getId(self):
		return self.id

	def setTitle(self, title):
		self.title = title

	def getTitle(self):
		return self.title

	def setDate(self, date): #yyyymmdd
		self.date = date

	def getDate(self):
		return self.date

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

	def setSubtitles(self, subtitles):
		self.subtitles = subtitles

	def getSubtitles(self):
		return self.subtitles
