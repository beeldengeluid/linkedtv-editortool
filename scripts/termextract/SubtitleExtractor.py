#!/usr/bin/python

# -*- coding: latin-1 -*-
from elasticsearch import Elasticsearch
from elasticsearch import helpers
import httplib2
import simplejson
import ngram
import re
import codecs

"""
Thoughts of improvement:
- depending on the length of the supplied text the settings, especially related to term frequency, must be adjusted
- the tokenizer is fine for finding 'onderwerpen', another tokenizer should be build specifically for matching GTAA terms
	- do we want to use elasticsearch for this??? Hmmm should not be necessary
- add a separate function to find GTAA candidates


https://pythonhosted.org/ngram/ngram.html
"""

"""
varianten van namen:
- W.G. de Hulst
- Joop van den Ende
- Hans van de berg
- Pieter over Maan
-

"""

class SubtitleExtractor():

	def __init__(self):
		self._es = Elasticsearch()
		self.TE_BASE_URL = 'http://localhost:8080/term-extractor-service/termextract'
		self.XTAS_BASE_URL = 'http://api.904labs.com/xtas'
		self.XTAS_API_KEY = '32gQ7zQydlFRVXA3kSgGq3IzCq5CF58jUnGPqYwi'#?api_key=32gQ7zQydlFRVXA3kSgGq3IzCq5CF58jUnGPqYwi
		self.STOP_FILE = '/Users/jblom/workspace/linkedtv-et-v2/resources/stoplist_tno.tab'
		self._stopwords = self.readStopWordsFile()

		#for look ahead functionality
		self.INFIXES = ['van', 'de', 'der', 'den']
		self.START_DUAL_INFIX = ['van', 'over']
		self.UP = 0
		self.LOW = 1
		self.INFIX = 2
		self.DUAL_INFIX = 3


	def readStopWordsFile(self, strStopFile = None):
		if not strStopFile:
			strStopFile = self.STOP_FILE
		stopWords = {}
		try:
			f = codecs.open(strStopFile,'rU','utf-8')  # NB. Use 'U'-mode for UniversalNewline Support
			for line in f.readlines():
				word = line.partition('::')[0].strip()#.decode('utf-8')
				stopWords[word] = 1
			f.close()
		except IOError, e:
			msg =  'Can\'t open stopfile %s for reading. %s' % (strStopFile, str(e))
			return None
		return stopWords

	def extractTerms(self, text):
		#curl -H 'Content-Type: application/json' -X POST 'http://localhost:8080/term-extractor-service/termextract' -d@teinput.txt
		print 'Going to extract some terms bromeister'
		http = httplib2.Http()
		data = {
			'settings' : {
				#term extraction parameters ('onderwerpen')
				'tokenizer.min.gram': '2',#min n-gram size
				'tokenizer.max.gram': '3',#max n-gram size
				'tokenizer.min.score': '5',#for matching in elasticsearch
				'tokenizer.min.token.frequency': '1',#min occurances of n-gram
				'tokenizer.min.norm.frequency': '0.01',#min TF-IDF score

				#named entity extraction settings ('persons', 'locations', 'organizations', 'misc')
				'namedentity.repository': 'xtas',#xtas, xtas-local, cltl, textraxor
				'namedentity.min.token.frequency': '2',#not sure if this is ever used, maybe for unknown types
				'namedentity.person.min.score': '6',#for matching in elasticsearch
				'namedentity.person.min.token.frequency': '1',#min occurances of persons
				'namedentity.location.min.score': '6',#for matching in elasticsearch
				'namedentity.location.min.token.frequency': '1',#min occurances of locations
				'namedentity.organization.min.score': '6',#for matching in elasticsearch
				'namedentity.organization.min.token.frequency': '1',#min occurances of organizations
				'namedentity.misc.min.score': '6',#for matching in elasticsearch
				'namedentity.misc.min.token.frequency': '1'#min occurances of misc concepts
			},
			'text' : text
		}
		url = '%s' % self.TE_BASE_URL
		headers = {'Content-Type' : 'application/json'}
		resp, content = http.request(url, 'POST', simplejson.dumps(data), headers=headers)
		print resp
		print content
		return None

	def xtas(self, text):
		print 'Going to extract some terms from xtas'
		data = simplejson.dumps({
			'data' : text,
			'arguments' : {'output': 'saf'}
		})
		http = httplib2.Http()
		url = '%s/run/frog?api_key=%s' % (self.XTAS_BASE_URL, self.XTAS_API_KEY)
		print url

		headers = {'Content-Type' : 'application/json', 'Content-Length' : str(len(data))}
		resp, content = http.request(url, 'POST', data, headers=headers)
		print resp
		if resp and resp.has_key('status') and resp['status'] == '200':
			#request the actual results
			docId = content.replace('\n', '')
			headers = {'Content-Type' : 'application/json'}
			url = '%s/result/%s?api_key=%s' % (self.XTAS_BASE_URL, docId, self.XTAS_API_KEY)
			print url
			resp, content = http.request(url, 'GET', headers=headers)
			print resp
			print content

		return None


	""",
					"filter": {
						"bool": {
							"must": {
								"or": {
									"filters": [
									{
										"term": {
											"type": "geografischenamen"
										}
									}
									]
								}
							}
						}
					}
					"""
	def findGTAAMatch(self, label, settings):
		if len(label) < settings['minWordLength']:
			return None
		query = {
			"query": {
				"filtered": {
					"query": {
						"multi_match": {
							"query": "%s" % label,
							"fields": [
								"prefLabel^10",
								"altLabel^2"
							],
							"operator": "OR"
						}
					}
				}
			}
		}
		resp = self._es.search(index='gtaa-1.1', doc_type='gtaa_document', body=query, timeout="10s")

		#Parse the ES response and calculate valid matches
		total = resp['hits']['total']
		#print 'TOTAL MATCHES FOR %s: %s' % (label, total)
		if total == 0:
			return None

		matches = []
		ne = None
		for hit in resp['hits']['hits']:
			if hit['_score'] >= settings['minESScore']:
				ne = hit['_source']
				ne['score'] = hit['_score']
				ne['searchLabel'] = label
				ne['simLabel'] = self.generateSimilarityLabel(ne['prefLabel'])
				matches.append(ne)
				#print ne['prefLabel']

		#Calculate the similarity scores of each hit with the orinial search label
		checkList = [m['simLabel'] for m in matches]
		#print checkList
		G = ngram.NGram(checkList)
		similarities = G.search(label)
		#print similarities

		#Only keep hits that are above the supplied similarity score
		maxIndex = -1
		for i, sim in enumerate(similarities):
			if sim[1] >= settings['minNGScore']:
				maxIndex = i
			else:
				break
		if maxIndex == -1:
			return None

		#Filter out the matches that have a too low similarity score
		similarities = similarities[0:maxIndex+1]
		validMatches = []
		for m in matches:
			for i, sim in enumerate(similarities):
				if m['simLabel'] == sim[0]:
					m['simScore'] = sim[1]
					validMatches.append(m)
					break

		#Sort by similarity score before returning
		return sorted(validMatches, key=lambda x: x['simScore'], reverse=True)

	def generateSimilarityLabel(self, prefLabel):
		i = prefLabel.find(' (')
		if i == -1:
			return prefLabel
		return prefLabel[0:i]

	"""
	TODO use different rules for matching full names ("Andre van Duin" has "Duin, Andre van" as prefLabel)
	TODO different simscores for different NE types
	TODO remove duplicates / similar results from candidate list
	TODO check ook comma's en puntcomma's in de teksts
	TODO als het vorige woord met een punt eindigde is het onzeker of het een entity betreft
	TODO van van is nog mogelijk
	"""
	#this function is currently optimized for names
	def customExtract(self, text, settings):
		matches = []
		t_arr =  text.split(' ')
		skip = 0
		candidates = []
		candidate = None
		singleCandidates = []
		for i, word in enumerate(t_arr):
			temp = None
			#if this word was already part of a previous look ahead skip it
			if skip > 0:
				skip -= 1
				continue

			#check if the word starts with an uppercase character
			if word[0].isupper():
				if self.endOfSentence(word):
					temp = [self.cleanupWord(word)]
				else:
					lookahead = True
					lastToken = {'word' : word, 'type' : self.UP}
					validToken = False
					c = 1
					temp = [word]
					w = None
					#try to look ahead to see if the next words are also uppercase,
					#in which case it is considered part of the current word
					while lookahead:
						if len(t_arr) > i+c and t_arr[i + c]:
							w = t_arr[i + c]
							tt = self.getTokenType(w, lastToken)
							print '%s => %s' % (word, w)
							#only if the type is not self.LOW it is valid
							if tt in [self.UP, self.INFIX, self.DUAL_INFIX]:
								lastToken = {'word' : w, 'type' : tt}
								temp.append(self.cleanupWord(w))
								skip = c
								#always stop the look ahead when the next word ends with a dot
								if self.endOfSentence(w):
									lookahead = False
								c += 1
							else:
								print lastToken
								print '\n'
								#if the last token was an infix or a two-part infix delete these from the candidate
								if lastToken['type'] in [self.DUAL_INFIX, self.INFIX]:
									endReached = False
									print '=====> DELETING SHIT'
									x = len(temp) -1
									while not endReached:
										if temp[x][0].islower():
											print '=====> DELETING SHIT'
											del temp[x]
										else:
											endReached = True
										x -= 1
								lookahead = False



				candidate = ' '.join(temp)

				#filter out stopwords
				if self._stopwords.has_key(candidate.lower()):
					continue

				if temp != None:
					#always add the word as a single candidate
					singleCandidates.append(word)
					#add to the single word candidates if there was no look ahead
					if len(temp) == 1:
						singleCandidates.append(candidate)
					else:
						if temp[len(temp) -1][0].isupper() and not candidate in candidates:#moet beter!!!
							candidates.append(candidate)

		#check if single words are already within one of the candidates. If not add them to the candidates
		temp = []
		for sc in singleCandidates:
			found = False
			for c in candidates:
				if sc.lower() in c.lower().split(' '):#or compare case sensitive?
					found = True
					break
			if not found:
				temp.append(sc)
		for t in temp:
			candidates.append(t)

		#add different writing variants for names (this is helpful when the preflabel of a name
		#is different from the original text while judging the similarity score
		temp = []
		for c in candidates:
			c_arr = c.split(' ')
			if len(c_arr) == 2:
				temp.append('%s, %s' % (c_arr[1], c_arr[0]))
			elif len(c_arr) == 3:
				if c_arr[1] in self.INFIXES:
					temp.append('%s, %s %s' % (c_arr[2], c_arr[0], c_arr[1]))

		print 'ADDITIONAL CANDIDATES'
		print temp
		candidates.extend(temp)

		print 'CANDIDATES:'
		print candidates

		#try to find GTAA terms for each candidate
		for c in candidates:
			m = self.findGTAAMatch(c, settings)
			if m:
				matches.extend(m)

		return matches

	def getTokenType(self, word, prevToken):
		if word[0].isupper():
			return self.UP
		#only allow an infix after a capital word or a two-part infix
		if prevToken['type'] in [self.DUAL_INFIX, self.UP]:
			if word in self.START_DUAL_INFIX:
				return self.DUAL_INFIX
			if word in self.INFIXES:
				return self.INFIX
		return self.LOW

	def endOfSentence(self, word):
		if word.count('.') == 1 and word[len(word) -1] == '.':
			#if it is not just a
			if len(word) > 2:
				return True
		return False

	def cleanupWord(self, word):
		#if there is a dot within the word, keep it as it could be the initials of a person, e.g. like in "W.G. de Hulst"
		if word.count('.') > 1:
			return word
		elif word.count('.') == 1 and len(word) == 2:
			return word
		#otherwise just remove all points and comma's
		return word.replace('.', '').replace(',', '')


	def copyLocalANtoServer():
		print 'indexing GTAA-1.1 on server...'
		source_es = Elasticsearch(hosts=[{'host' : '127.0.0.1', 'port' : 9200}])
		print source_es.info()
		target_es = Elasticsearch(hosts=[{'host' : 'hugodrax', 'port' : 9200}])
		print target_es.info()
		helpers.reindex(source_es, 'gtaa-1.1', 'gtaa-1.1', target_es)
		print 'done indexing'



if __name__ == '__main__':
	#text = ['We moeten heel goed uitkijken dat er geen rare dingen gebeuren hier in Hilversum. Het Gooi kan een gevaarlijke plaats worden, wanneer we niet meer herinneren waar we vandaan komen. Pieter Koops, denkt vaak aan zijn geraniums en wilde bloemsoorten die zijn tuin in Driemond sieren.']
	#text = ['Mooie goal van Ruud van Nistelrooy. 1-0 voor Manchester United. John Jones Mary and Mr. J. J. Jones ran to Washington.']

	"""read the text from a test file"""
	text = []
	with codecs.open('testinput2.txt', 'r', 'utf-8') as f:
		for line in f:
			text.append(line)

		"""matching settings"""
		settings = {
			'minESScore' : 6.0,
			'minNGScore' : 0.4,
			'minWordLength' : 4
		}

		se = SubtitleExtractor()
		matches = se.customExtract(''.join(text), settings)
		for ne in matches:
			try:
				print '\n%s ==> %s (%s) [%s] {%s | %s}' % (
					ne['searchLabel'],
					ne['prefLabel'],
					ne['uri'],
					ne['type'],
					ne['simScore'],
					ne['score']
				)
			except UnicodeDecodeError, e:
				print e
