"""
super class of: Concept, Shot, Chapter and NamedEntity
"""

class Annotation(object):

	def __init__(self, label, description = None, start = 0, end = 0, annotationURI = None, relevance = 0, confidence = 0):
		self.label = label
		self.description = description
		self.start = start
		self.end = end
		self.annotationURI = annotationURI
		self.relevance = relevance
		self.confidence = confidence

	def setLabel(self, label):
		self.label = label

	def getLabel(self):
		return self.label

	def setDescription(self, description):
		self.description = description

	def getDescription(self):
		return self.description

	def setStart(self, start):
		self.start = start

	def getStart(self):
		return self.start

	def setEnd(self, end):
		self.end = end

	def getEnd(self):
		return self.end

	def setAnnotationURI(self, annotationURI):
		self.annotationURI = annotationURI

	def getAnnotationURI(self):
		return self.annotationURI

	def setRelevance(self, relevance):
		self.relevance = relevance

	def getRelevance(self):
		return self.relevance

	def setConfidence(self, confidence):
		self.confidence = confidence

	def getConfidence(self):
		return self.confidence

