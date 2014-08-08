import urllib
import httplib2

from linkedtv.LinkedtvSettings import LTV_DBPEDIA_PROXY

class EntityProxy():

	def fetch(self, entityUri, lang):
		http = httplib2.Http()
		url = '%s?url=%s&lang=%s' % (LTV_DBPEDIA_PROXY, entityUri, lang)
		headers = {'Content-type': 'application/json'}
		resp, content = http.request(url, 'GET', headers=headers)		
		return content