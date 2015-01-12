class LinkedTVSubtitleLoader():

	def __init__(self):
		print 'To be implemented further'

	def getSubtitles(self, resourceUri):
		query = []
		query.append('SELECT * ')
		query.append('WHERE { ')
		query.append('?mediaFragment ma:isFragmentOf <http://data.linkedtv.eu/media/%s> . ' % resourceUri)
		query.append('?mediaFragment linkedtv:hasSubtitle ?subtitle . ')
		query.append('?mediaFragment nsa:temporalStart ?start . ')
		query.append('?mediaFragment nsa:temporalEnd ?end . ')
		query.append('?subtitle <http://nlp2rdf.lod2.eu/schema/string/label> ?label ')
		query.append('} ')
		return None