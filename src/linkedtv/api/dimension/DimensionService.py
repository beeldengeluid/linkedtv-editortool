#http://stackoverflow.com/questions/4382945/abstract-methods-in-python
#http://pymotw.com/2/abc/

class DimensionService(object):

	def __init__(self, id):
		self.id = id

	def fetch(self, query, entities, params):
		return self.__formatResponse(self.__search(query, entities, params))

	def __search(self, query, entities, params):
		print 'Calling dimension service: %s' % self.id

	def __formatResponse(self, data):
		print 'Formatting dimension service response (%s)' % self.id
