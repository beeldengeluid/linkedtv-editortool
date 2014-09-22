import requests
import redis
import httplib2
import simplejson
import base64
import re
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN

class EntityExpansionService:
	
	def __init__(self):
		self.BASE_URL = 'http://linkedtv.eurecom.fr/entitycontext/api/'
		self.GOOGLE_CSE = '014567755836058125714:alz73j11kbk'
		self.REPRESENTATIVE = '/entities/representative'
		self.RELEVANT = '/entities/relevant'
		self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

	def fetch(self, srtUrl, start = -1, end = -1):
		#curl -X POST --data-binary @snowden.txt 
		#"http://linkedtv.eurecom.fr/entitycontext/api/entities/relevant?startdate=20130703&enddate=20130716&cse=CSE_ID&limit=50" 
		#--header "Content-Type:application/json" -v
		transcriptText = None
		if self.cache.exists(srtUrl):
			print 'Got it from cache: %s' % srtUrl
			transcriptText = self.cache.get(srtUrl)
		else:
			transcriptText = self.getTranscriptText(srtUrl)

		return transcriptText
		"""
		url = '%s%s?startdate=%s&enddate=%s&cse=%s&limit=%d' % (
			self.BASE_URL, self.RELEVANT, '20130703', '20130716', self.GOOGLE_CSE, 50
		)
		print url
		r = requests.post(url, files={'subtitles.txt': open(srtUrl, 'rb')})
		print r.text
		return None
		"""

	def getTranscriptText(self, srtUrl):
		print 'Fetching it from the server'
		pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
		http = httplib2.Http()
		headers = {
			'Accept' : 'text/plain',
			'Authorization' : 'Basic %s' % pw,
		}
		resp, content = http.request(srtUrl, 'GET', headers=headers)
		print resp
		if resp and resp['status'] == '200':
			plainText = self.toPlainText(content)
			self.cache.set(srtUrl, plainText)
		return None

	def toPlainText(self, text):
		result = []
		c = 0
		t = ''
		l = None
		RE_ITEM = re.compile(r'(?P<index>\d+).'
			r'(?P<start>\d{2}:\d{2}:\d{2},\d{3}) --> '
			r'(?P<end>\d{2}:\d{2}:\d{2},\d{3}).'
			r'(?P<text>.*?)(\n\n|$)', re.DOTALL)
		for i in RE_ITEM.finditer(text):
			result.append((i.group('index'), i.group('start'), i.group('end'), i.group('text')))
			l = result[c][3].replace('\n', '')
			l = " ".join(l.split())
			t = '%s %s' % (t, l)
			c += 1
		return t
