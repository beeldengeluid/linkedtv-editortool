"""
super class of: Concept, Shot, Chapter and NamedEntity
"""

class Annotation(object):

	def __init__(self, label, start, end, mfURI = None, annotationURI = None, bodyURI = None, relevance = 0, confidence = 0):
		self.label = label
		self.start = start
		self.end = end
		self.mfURI = mfURI
		self.annotationURI = annotationURI
		self.bodyURI = bodyURI
		self.relevance = relevance
		self.confidence = confidence

	def setLabel(self, label):
		self.label = label

	def getLabel(self):
		return self.label

	def setStart(self, label):
		self.start = start

	def getStart(self):
		return self.start

	def setEnd(self, end):
		self.end = end

	def getEnd(self):
		return self.end

	def setMfURI(self, mfURI):
		self.mfURI = mfURI

	def getMfURI(self):
		return self.mfURI

	def setAnnotationURI(self, annotationURI):
		self.annotationURI = annotationURI

	def getAnnotationURI(self):
		return self.annotationURI

	def setBodyURI(self, bodyURI):
		self.bodyURI = bodyURI

	def getBodyURI(self):
		return self.bodyURI

	def setRelevance(self, relevance):
		self.relevance = relevance

	def getRelevance(self):
		return self.relevance

	def setConfidence(self, confidence):
		self.confidence = confidence

	def getConfidence(self):
		return self.confidence

