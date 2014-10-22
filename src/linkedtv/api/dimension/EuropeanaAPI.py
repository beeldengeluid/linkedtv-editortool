from linkedtv.LinkedtvSettings import LTV_EUROPEANA
from linkedtv.api.dimension.DimensionService import DimensionService

class EuropeanaAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'EuropeanaAPI')
		self.API_KEY = LTV_EUROPEANA['apikey']

	def fetch(self, query, params):
		#http://www.europeana.eu/api/v2/search.json?wskey=1hfhGH67Jhs&query=amsterdam&qf=PROVIDER%3A%22EUscreen+Project%22
		print 'Implement this sirra'