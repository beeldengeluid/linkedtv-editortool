import simplejson
from simplejson import JSONDecodeError
from linkedtv.api.storage.load.ltv.LinkedTVDataUtils import LinkedTVDataUtils
from linkedtv.utils.TimeUtils import *

class LinkedTVSubtitleLoader():

	def loadSubtitles(self, resourceUri):
		query = []
		query.append('SELECT DISTINCT ?start ?end ?label ')
		query.append('WHERE { ')
		query.append('?mediaFragment ma:isFragmentOf <http://data.linkedtv.eu/media/%s> . ' % resourceUri)
		query.append('?mediaFragment linkedtv:hasSubtitle ?subtitle . ')
		query.append('?mediaFragment nsa:temporalStart ?start . ')
		query.append('?mediaFragment nsa:temporalEnd ?end . ')
		query.append('?subtitle <http://nlp2rdf.lod2.eu/schema/string/label> ?label ')
		query.append('} ')
		print ''.join(query)
		resp = LinkedTVDataUtils.sendSearchRequest(''.join(query))
		jsonData = None
		try:
			jsonData = simplejson.loads(resp)
		except JSONDecodeError, e:
			print e
		subs = []
		found = False
		if jsonData:
			start = 0
			end = 0
			label = None
			temp = {}
			for k in jsonData['results']['bindings']:
				if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
				if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
				if k.has_key('label'): label = k['label']['value']
				label = label.strip()
				if label and len(label) > 0 and not temp.has_key(start):
					subs.append({
						'start' : start,
						'end' : end,
						'label' : label
					})
					temp[start] = True
				subs.sort(key=lambda x: x['start'], reverse=False)
		return subs