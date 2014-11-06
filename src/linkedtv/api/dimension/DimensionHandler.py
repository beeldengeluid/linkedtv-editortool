from linkedtv.api.dimension.TvEnricher import TvEnricher
from linkedtv.api.dimension.TvNewsEnricher import TvNewsEnricher
from linkedtv.api.dimension.EuropeanaAPI import EuropeanaAPI

"""
Todo make sure that all services return the same model!! (create an object model for this)
"""

class DimensionHandler(object):

	def __init__(self):
		self.registeredServices = {
			'TvEnricher' : TvEnricher(),
			'TvNewsEnricher' : TvNewsEnricher(),
			'EuropeanaAPI' : EuropeanaAPI()
		}

	def getRegisteredServices(self):
		return self.registeredServices.keys()

	def fetch(self, query, dimension):
		return self.registeredServices[dimension['service']['id']].fetch(query, dimension)
		