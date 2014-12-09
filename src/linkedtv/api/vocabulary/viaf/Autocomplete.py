class Autocomplete():
	
	def __init__(self):
		#https://platform.worldcat.org/api-explorer/VIAF
		#http://www.viaf.org/viaf/AutoSuggest?query=rembrandt
		self.BASE_URL = 'http://www.viaf.org/viaf'

	def autocomplete(self, query, maxHits = 10):
		http = httplib2.Http()
		url = '%s?query=' % (self.BASE_URL, query)
		headers = {
			'Accept' : 'application/json'
		}
		resp, content = http.request(url, 'GET', headers=headers)		
		if resp and resp['status'] == '200':
			return content
		return None
