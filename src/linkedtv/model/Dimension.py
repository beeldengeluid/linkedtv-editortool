

class Dimension(object):
	
	def __init__(self, _id, description, annotations = [], service = None, organization = None):
		self.id = _id
		self.description = description
		self.annotations = annotations

	def setId(self, _id):
		self.id = id

	def getId(self):
		return self.id

	def setDescription(self, description):
		self.description = description

	def getDescription(self):
		return self.description

	def setAnnotations(self, annotations):
		self.annotations = annotations

	def getAnnotations(self):
		return self.annotations