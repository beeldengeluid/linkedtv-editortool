class DimensionService(object):
	
	def __init__(self, id):
		self.id = id
		print 'here I am %s' % self.id

	def fetch(self, query, params):
		print 'Fetching data using dimension %s' % self.id
