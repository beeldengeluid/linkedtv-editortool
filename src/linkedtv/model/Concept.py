from linkedtv.model.Annotation import Annotation

class Concept(Annotation):

	def __init__(self, label, description = None, start = 0, end = 0 , link = None,
		annotationURI = None, relevance = 0, confidence = 0):
		Annotation.__init__(self, label, description, start, end, annotationURI, relevance, confidence)
		self.link = link

	def setLink(self, link):
		self.link = link

	def getLink(self):
		return self.link