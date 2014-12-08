from linkedtv.api.dimension.TvEnricher import TvEnricher
from linkedtv.api.dimension.TvNewsEnricher import TvNewsEnricher

from linkedtv.api.dimension.public.EuropeanaAPI import EuropeanaAPI
from linkedtv.api.dimension.public.AnefoAPI import AnefoAPI

"""
Todo make sure that all services return the same model!! (create an object model for this)
"""
class DimensionHandler(object):

	def __init__(self):
		self.registeredServices = {
			'TvEnricher' : TvEnricher(),
			'TvNewsEnricher' : TvNewsEnricher(),
			'EuropeanaAPI' : EuropeanaAPI(),
			'AnefoAPI' : AnefoAPI()
		}

	def getRegisteredServices(self):
		return self.registeredServices.keys()

	def fetch(self, query, entities, dimension):
		return self.registeredServices[dimension['service']['id']].fetch(query, entities, dimension)
