import simplejson
import httplib2
import urllib

class TopicIdentificationService():

	def __init__(self):
		self.baseURL = 'http://multimedia.iti.gr/api/topic_detection'

	def categorizeEntities(self, entities):
		entityURIs = self.formatEntities(entities)
		if entityURIs:
			http = httplib2.Http()
			url = '%s' % self.baseURL
			headers = {'Content-type' : 'application/json'}
			print entityURIs
			resp, content = http.request(url, 'POST', simplejson.dumps(entityURIs), headers=headers)
			print 'RESPONSE:'
			print resp
			if resp and resp['status'] == '200':
				return self.formatResponse(content)
		return None

	"""
	{"topics":[{"art":"1.0"},{"arts_culture_entertainment":"1.0"},{"computer_science":"1.0"},{"currency":"1.0"},
	{"economy_business_finance":"1.0"},{"film":"1.0"},{"formal_sciences":"1.0"},{"internet":"1.0"},
	{"music":"1.0"},{"music_genres":"1.0"},{"musical":"1.0"},{"science":"1.0"},
	{"science_technology":"1.0"},{"technology":"1.0"}]}
	"""
	def formatResponse(self, data):
		print data
		return None

	"""
	{
	"entityURIs": [
		{"URI": "http://de.dbpedia.org/resource/Claudia_Kemfert"},
		{"URI": "http://nl.dbpedia.org/resource/Nelleke_van_der_Krogt"},
		{"URI": "http://dbpedia.org/ontology/Politician"}
	]
	}
	"""
	def formatEntities(self, entities):
		entityURIs = []
		uri = None
		if entities and len(entities) > 0:
			for e in entities:
				uri = e.getDisambiguationUrl()
				if uri and uri.find('dbpedia.org') != -1:
					entityURIs.append({
						'URI' : e.getDisambiguationUrl()
					})
			return {'entityURIs' : entityURIs }
		return None


