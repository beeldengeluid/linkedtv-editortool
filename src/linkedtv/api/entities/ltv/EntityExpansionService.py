import requests
import redis
import httplib2
import urllib
import simplejson
import base64
import re
from datetime import datetime, date, timedelta
from linkedtv.model import NamedEntity
from linkedtv.api.storage.load.ltv.LinkedTVDataUtils import LinkedTVDataUtils
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN
from linkedtv.utils.TimeUtils import TimeUtils

"""

TODO integrate with the LinkedTVSubtitleLoader and remove all subtitle fetching code here
"""

class EntityExpansionService():

	def __init__(self):
		self.BASE_URL = 'http://linkedtv.eurecom.fr/entitycontext/api'
		self.GOOGLE_CSE = '014567755836058125714:alz73j11kbk'
		self.REPRESENTATIVE = '/entities/representative'
		self.RELEVANT = '/entities/relevant'
		self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])
		self.periodInDays = 7
		self.TAG_RE = re.compile(r'<[^>]+>')

	def fetch(self, srtUrl, date = None, start = -1, end = -1):
		transcriptText = None
		if self.cache.exists(srtUrl):
			print 'Got it from cache: %s' % srtUrl
			transcriptText = self.cache.get(srtUrl)
		else:
			transcriptText = self.__getSrtData(srtUrl)
		isSrt = srtUrl.find('_asr.srt') == -1
		transcriptText = self.__toPlainText(transcriptText, start, end, isSrt)
		return self.__formatResponse(self.__sendRequest(transcriptText, date), start, end)


	def __sendRequest(self, text, videoDate):
		#curl -X POST --data-binary @snowden.txt
		#"http://linkedtv.eurecom.fr/entitycontext/api/entities/relevant?startdate=20130703&enddate=20130716&cse=CSE_ID&limit=50"
		#--header "Content-Type:application/json" -v
		endDate = startDate = None
		try:
			endDate = datetime.strptime(videoDate, '%Y%m%d')
		except ValueError, e:
			endDate = date.today()
		except TypeError, e:
			endDate = date.today()
		startDate = endDate-timedelta(days=self.periodInDays)

		url = '%s%s?startdate=%s&enddate=%s&cse=%s&limit=%d' % (
			self.BASE_URL, self.RELEVANT, startDate.strftime('%Y%m%d'), endDate.strftime('%Y%m%d'), self.GOOGLE_CSE, 50
		)
		headers = {'Content-type': 'application/json'}
		print url
		http = httplib2.Http()
		resp, content = http.request(url, 'POST', urllib.quote(text).replace('%20', ' '), headers=headers)
		print 'RESPONSE:'
		if resp and resp['status'] == '200':
			return content
		return None

	"""
		[
		{"label":"Cottbus",
		"totalRelevance":0.013888888888888888,
		"maxExtractorRelevance":0.255723,
		"appearancesVideo":0,
		"appearancesDocuments":8,
		"startChar":0,
		"endChar":0,
		"nerdType":"http://nerd.eurecom.fr/ontology#Location",
		"extractorType":"DBpedia:Place,PopulatedPlace,Settle
	"""
	def __formatResponse(self, data, start, end):
		if not data:
			return None
		nes = []
		data = simplejson.loads(data)
		for ne in data:
			print ne
			nes.append(NamedEntity(
				ne['label'],
				disambiguationURL=ne['uri'],
				entityType=LinkedTVDataUtils.getNEType(None, ne['nerdType'], None),
				subTypes=LinkedTVDataUtils.getDCTypes(ne['extractorType']),
				start=start,
				end=end,
				relevance=ne['totalRelevance']
				))
		return nes


	def __getSrtData(self, srtUrl):
		print 'Fetching srt from the server'
		pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
		http = httplib2.Http()
		headers = {
			'Accept' : 'text/plain',
			'Authorization' : 'Basic %s' % pw,
		}
		resp, content = http.request(srtUrl, 'GET', headers=headers)
		if resp and resp['status'] == '200':
			self.cache.set(srtUrl, content)
			return content
		return None

	def __toPlainText(self, text, start, end, isSrt = True):
		print 'fetching %d to %d' % (start, end)
		i = 0
		#print repr(text)
		noTimeCheck = start == -1 and end == -1
		result = []
		c = 0
		t = ''
		l = None
		s = 0
		e = 0
		RE_ITEM = None
		if isSrt:
			RE_ITEM = re.compile(r'(?P<index>\d+).'
			r'(?P<start>\d{2}:\d{2}:\d{2},\d{3}) --> '
			r'(?P<end>\d{2}:\d{2}:\d{2},\d{3}).'
			r'(?P<text>.*?)(\n\n|$)', re.DOTALL)
		else:
			RE_ITEM = re.compile(r'(?P<index>\d+)\r\n'
				r'(?P<start>\d{2}:\d{2}:\d{2},\d{3}) --> '
				r'(?P<end>\d{2}:\d{2}:\d{2},\d{3})\r\n'
				r'(?P<text>.*?)(\r\n\r\n|$)', re.DOTALL)

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
		return self.__removeTags(t)

	def __removeTags(self, text):
		return self.TAG_RE.sub('', text)
