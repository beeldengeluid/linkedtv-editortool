from linkedtv.model.Annotation import Annotation

class Shot(Annotation):

	def __init__(self, label, description = None, start = 0 , end = 0, mfURI = None,
		annotationURI = None, bodyURI = None, relevance = 0, confidence = 0):
		Annotation.__init__(self, label, description, start, end, mfURI, annotationURI, bodyURI, relevance, confidence)