from linkedtv.model.Annotation import Annotation

class Chapter(Annotation):

	def __init__(self, label, start, end, mfURI, annotationURI, bodyURI, relevance, confidence):
		Annotation.__init__(self, label, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)