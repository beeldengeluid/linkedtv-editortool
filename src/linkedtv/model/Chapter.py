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

	def __init__(self, label, start, end, mfURI, annotationURI, bodyURI, relevance, confidence, poster = None, dimensions = {}):
		Annotation.__init__(self, label, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)
		self.poster = poster
		self.dimensions = dimensions

	def setPoster(self, poster):
		self.poster = poster

	def getPoster(self):
		return self.poster

	def setDimensions(self, dimensions):
		self.dimensions = dimensions

	def getDimensions(self):
		return self.dimensions
