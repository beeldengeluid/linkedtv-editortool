
"""
See implemented DimensionService classes to see what data the fetch() function needs to return
"""
class DimensionHandler(object):

	#TODO loop through the dimension package
	def getRegisteredServices(self):
		return []

	def fetch(self, query, entities, dimension):
		return self.__getDimensionService(dimension['service']['class']).fetch(query, entities, dimension)

	def __getDimensionService(self, fullPath):
		className = fullPath.split('.')[-1]
		mod = __import__(fullPath, fromlist=[className])
		cl = getattr(mod, className)
		return cl()
