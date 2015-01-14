#https://code.google.com/p/solrpy/
#import solr

class LinkedTVChapterIndexHandler(object):

	def __init__(self):
		print '__initializing LinkedTVChapterIndexHandler__'
		self.BASE_URL = 'http://data.linkedtv.eu/solr/#/RBBindex/query'
		self.SOLR_HOST = ''#read from the config
		self.SOLR_PORT = ''#read from the config

	def updateIndex(self, chapter):
		#s = solr.SolrConnection('http://data.LinkedTVChapterIndexHandler__.eu:8983/solr')
		return None