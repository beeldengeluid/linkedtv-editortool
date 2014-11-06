

class Dimension(object):
	
	def __init__(self, _id, label, service = None, annotations = []):
		self.id = _id
		self.label = label		
		self.service = service
		self.annotations = annotations

	def setId(self, _id):
		self.id = id

	def getId(self):
		return self.id

	def setLabel(self, label):
		self.label = label

	def getLabel(self):
		return self.label

	def setAnnotations(self, annotations):
		self.annotations = annotations

	def getAnnotations(self):
		return self.annotations

	def setService(self, service):
		self.service = service

	def getService(self):
		return self.service
