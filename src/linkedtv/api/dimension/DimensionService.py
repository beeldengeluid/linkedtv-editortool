#http://stackoverflow.com/questions/4382945/abstract-methods-in-python
#http://pymotw.com/2/abc/

class DimensionService(object):
	
	def __init__(self, id):
		self.id = id
		print 'here I am %s' % self.id

	def fetch(self, query, params):
		return self.__formatResponse(self.__search(query, params))

	def __search(self, query, params):
		print 'Calling dimension service: %s' % self.id
	
	def __formatResponse(self, data):
		print 'Formatting dimension service response (%s)' % self.id
