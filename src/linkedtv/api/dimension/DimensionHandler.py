from linkedtv.api.dimension.ltv.TvEnricher import TvEnricher
from linkedtv.api.dimension.ltv.TvNewsEnricher import TvNewsEnricher
from linkedtv.api.dimension.ltv.IRAPI import IRAPI
from linkedtv.api.dimension.ltv.RelatedChapterEnricher import RelatedChapterEnricher

from linkedtv.api.dimension.public.EuropeanaAPI import EuropeanaAPI
from linkedtv.api.dimension.public.AnefoAPI import AnefoAPI
from linkedtv.api.dimension.public.NewsReaderAPI import NewsReaderAPI

"""
See the DimensionService class to see what data the fetch() function needs to return
"""
class DimensionHandler(object):

	def __init__(self):
		self.registeredServices = {
			'TvEnricher' : TvEnricher(),
			'TvNewsEnricher' : TvNewsEnricher(),
			'IRAPI' : IRAPI(),
			'RelatedChapterEnricher' : RelatedChapterEnricher(),
			'EuropeanaAPI' : EuropeanaAPI(),
			'AnefoAPI' : AnefoAPI(),
			'NewsReaderAPI' : NewsReaderAPI()
		}

	def getRegisteredServices(self):
		return self.registeredServices.keys()

	def fetch(self, query, entities, dimension):
		return self.registeredServices[dimension['service']['id']].fetch(query, entities, dimension)
