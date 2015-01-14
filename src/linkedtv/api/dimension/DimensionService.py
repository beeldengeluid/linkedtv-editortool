#http://stackoverflow.com/questions/4382945/abstract-methods-in-python
#http://pymotw.com/2/abc/

"""
Each implementation of fetch should return an structure as follows:

{
	'enrichments' : [
		linkedtv.model.Enrichment(label='', url='', source='', entitities=[linkedtv.model.NamedEntity(), ...]),
		...
	],
	'queries' : ['http://someapi.com/q=somesearch', ...]
}

Note ('enrichments'): Make sure at least the properties indicated are filled in. See the Enrichment class for more info.
Note ('queries'): optional. Fill in if in config.js the logUserActions is set to true
"""

class DimensionService(object):

	def __init__(self, id):
		self.id = id

	def fetch(self, query, entities, params):
		return self.__formatResponse(self.__search(query, entities, params))

	def __search(self, query, entities, params):
		print 'Calling dimension service: %s' % self.id

	def __formatResponse(self, data):
		print 'Formatting dimension service response (%s)' % self.id
