from linkedtv.api.dimension.TvEnricher import TvEnricher
from linkedtv.api.dimension.TvNewsEnricher import TvNewsEnricher
from linkedtv.api.dimension.EuropeanaAPI import EuropeanaAPI

class DimensionHandler(object):

	def __init__(self):
		self.registeredServices = {
			'TvEnricher' : TvEnricher(),
			'TvNewsEnricher' : TvNewsEnricher(),
			'EuropeanaAPI' : EuropeanaAPI()
		}

	def getRegisteredServices(self):
		return self.registeredServices.keys()

	def fetch(self, query, dimension, params):
		print dimension
		return self.registeredServices[dimension].fetch(query, params)
		