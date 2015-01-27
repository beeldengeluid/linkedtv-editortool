import simplejson
import redis
from simplejson import JSONDecodeError
from linkedtv.api.storage.load.ltv.LinkedTVDataUtils import LinkedTVDataUtils
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN
from linkedtv.utils.TimeUtils import *

class LinkedTVSubtitleLoader():

	def __init__(self):
		self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

	"""Fetching subtitles via the LinkedTV SPARQL end-point, using media resource URIs"""

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

	def loadSubtitleFragmentByResourceUri(self, resourceUri, start, end):
		print 'Fetching subs:'
		noTimeCheck = start == -1 and end == -1
		fragments = []
		if self.cache.exists('%s.subtitles' % resourceUri):
			print 'Found subs in cache!'
			subs = simplejson.loads(self.cache.get('%s.subtitles' % resourceUri))
		else:
			subs = self.loadSubtitles(resourceUri)
			self.cache.set('%s.subtitles' % resourceUri, simplejson.dumps(subs))
		if subs:
			for sub in subs:
				if (sub['start'] >= start and sub['start'] < end and sub['end'] <= end and sub['end'] > start) or noTimeCheck:
					fragments.append(sub['label'])
		return ''.join(fragments)

	"""Fetching subtitles using LinkedTV URLs to SRT files"""

	def getSubtitleFragmentBySrtUrl(self, srtUrl, date = None, start = -1, end = -1):
		transcriptText = None
		if self.cache.exists(srtUrl):
			print 'Got it from cache: %s' % srtUrl
			transcriptText = self.cache.get(srtUrl)
		else:
			transcriptText = self.__getSrtData(srtUrl)
		return self.__srtFragmentToPlainText(transcriptText, start, end)

	def __getSrtData(self, srtUrl):
		print 'Fetching srt from the server'
		pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
		http = httplib2.Http()
		headers = {
			'Accept' : 'text/plain',
			'Authorization' : 'Basic %s' % pw,
		}
		resp, content = http.request(srtUrl, 'GET', headers=headers)
		print resp
		if resp and resp['status'] == '200':
			self.cache.set(srtUrl, content)
			return content
		return None

	def __srtFragmentToPlainText(self, text, start, end):
		print 'fetching %d to %d' % (start, end)
		noTimeCheck = start == -1 and end == -1
		result = []
		c = 0
		t = ''
		l = None
		s = 0
		e = 0
		RE_ITEM = re.compile(r'(?P<index>\d+).'
			r'(?P<start>\d{2}:\d{2}:\d{2},\d{3}) --> '
			r'(?P<end>\d{2}:\d{2}:\d{2},\d{3}).'
			r'(?P<text>.*?)(\n\n|$)', re.DOTALL)
		for i in RE_ITEM.finditer(text):
			s = TimeUtils.srtTimeToMillis(i.group('start'))
			e = TimeUtils.srtTimeToMillis(i.group('end'))
			if (s >= start and s < end and e <= end and e > start) or noTimeCheck:
				result.append((i.group('index'), i.group('start'), i.group('end'), i.group('text')))
				l = result[c][3].replace('\n', '')
				l = " ".join(l.split())
				t = '%s %s' % (t, l)
				c += 1
		print t
		return t