from linkedtv.model.Annotation import Annotation

"""
{"annotationURI":"http://data.linkedtv.eu/annotation/5ddb90a8-49e9-4a8b-acc9-79a54068788e",
"end":34000,
"bodyURI":"",
"poster":"nullh/0/m/0/sec7.jpg",
"confidence":"",
"label":"Introduction",
"start":7000,
"mfURI":"",
"relevance":"",
"guid":"chapter_1",
"type":"curated",
"dimensions":{}
"""

class Chapter(Annotation):

	def __init__(self, label, description = None, start = 0, end = 0, mfURI = None, annotationURI = None, bodyURI = None,
			relevance = 1, confidence = 1, poster = None, dimensions = None, _type = 'auto'):
		Annotation.__init__(self, label, description, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)
		self.poster = poster
		self.dimensions = dimensions
		self.type = _type

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
