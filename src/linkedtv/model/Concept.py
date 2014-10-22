from linkedtv.model.Annotation import Annotation

class Concept(Annotation):

	def __init__(self, label, start, end, link, mfURI, annotationURI, bodyURI, relevance, confidence):
		Annotation.__init__(self, label, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)
		self.link = link

	def setLink(self, link):
		self.link = link

	def getLink(self):
		return self.link