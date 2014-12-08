# -*- coding: utf-8 -*-
import simplejson
import urllib
import httplib2
import feedparser
from lxml import etree
from datetime import datetime

from linkedtv.model import Enrichment
from linkedtv.api.dimension.DimensionService import DimensionService

class AnefoAPI(DimensionService):

	def __init__(self):
		DimensionService.__init__(self, 'AnefoAPI')
		self.BASE_URL = 'http://www.gahetna.nl'
		self.NAMESPACE_DC = 'http://purl.org/dc/elements/1.1/'
		self.NAMESPACE_ESE = 'http://www.europeana.eu/schemas/ese/'

	def fetch(self, query, entities, dimension):
		if self.__isValidDimension(dimension):
			return self.__formatResponse(self.__search(query, entities, dimension), dimension)
		return None

	def __isValidDimension(self, dimension):
		return True

	def __search(self, query, entities, dimension):
		http = httplib2.Http()
		url = self.__getServiceUrl(query, entities, dimension)
		if url:
			headers = {'Accept':'text/html,application/xhtml+xml,application/xml'}
			resp, content = http.request(url, 'GET', headers=headers)
			if content:
				return content
		return None

	def __getServiceUrl(self, query, entities, dimension):
		#Trefwoorden: Geografisch_trefwoord:
		if query == '':
			query = ' '.join(e['label'] for e in entities)
		query = urllib.quote(query.encode('utf8'))
		params = 'searchTerms='
		if entities and len(entities) > 0:
			for e in entities:
				params += urllib.quote(e['label'])
		else:
			params += query
		params += '&count=10&startIndex=1';
		url = '%s/beeldbank-api/opensearch/?%s' % (self.BASE_URL, params)
		print url
		return url

	""" SOURCE DATA:
	 <item>
      <title>Emilio Maspero, secretaris van het CLAT en Carlos Custer, coördinator (l)</title>
      <link>http://hdl.handle.net/10648/ad25ea76-d0b4-102d-bcf8-003048976d84</link>
      <description>Emilio Maspero, secretaris van het CLAT en Carlos Custer, coördinator (l)</description>
      <enclosure url="http://afbeeldingen.gahetna.nl/naa/thumb/800x600/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg" length="0" type="image/jpeg" />
      <pubDate>Mon, 08 Dec 2014 07:50:47 +0100</pubDate>
      <guid isPermaLink="true">http://hdl.handle.net/10648/ad25ea76-d0b4-102d-bcf8-003048976d84</guid>
      <dc:isPartOf rdf:about="http://www.gahetna.nl/collectie/archief/ead/index/eadid/2.24.01.05">2.24.01.05</dc:isPartOf>
      <dc:identifier>hdl://10648/ad25ea76-d0b4-102d-bcf8-003048976d84</dc:identifier>
      <dc:date>1983-02-18T00:00:00Z</dc:date>
      <dc:subject rdf:about="http://www.gahetna.nl/dc/subject/Persoons_instellingsnaam">Custer, Carlos</dc:subject>
      <dc:subject rdf:about="http://www.gahetna.nl/dc/subject/Persoons_instellingsnaam">Maspero, Emilio</dc:subject>
      <dc:isPartOf rdf:about="http://www.gahetna.nl/isPartOf/Serie_Collectie/2f7593fe-b9a1-11df-ba8e-03c82bd9ba46">Fotocollectie Anefo</dc:isPartOf>
      <dc:type>Foto</dc:type>
      <dc:isPartOf rdf:about="http://www.gahetna.nl/isPartOf/Reportage_Serienaam">Persconferentie van het Latijns-Amerikaans Arbeidscentrum CLAT</dc:isPartOf>
      <dc:creator>Antonisse, Marcel / Anefo</dc:creator>
      <dc:type>Negatief (zwart-wit)</dc:type>
      <dc:subject>groepsportretten</dc:subject>
      <dc:subject>internationale betrekkingen</dc:subject>
      <dc:subject>persconferenties</dc:subject>
      <dc:subject>vakbonden</dc:subject>
      <dc:identifier>932-5058</dc:identifier>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/800x600/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/40x40/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/88x88/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/150x150/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/160x160/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/188x188/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/300x300/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/460x460/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/500x500/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:isShownBy>http://afbeeldingen.gahetna.nl/naa/thumb/1280x1280/bba34aa2-f35b-7973-017e-f1994e2bea02.jpg</ese:isShownBy>
      <ese:type>IMAGE</ese:type>
      <ese:provider>Beeldbank Nationaal Archief</ese:provider>
      <ese:isShownAt>http://hdl.handle.net/10648/ad25ea76-d0b4-102d-bcf8-003048976d84</ese:isShownAt>
      <memorix:MEMORIX>
        <field name="auteursrechten_auteursrechthebbende">
          <value>Nationaal Archief, CC-BY-SA</value>
        </field>
        <field name="PhotoName">
          <value>NL-HaNA_2.24.01.05_0_932-5058.tjp</value>
        </field>
        <rights>
          <right name="grote thumbnail">FALSE</right>
          <right name="commercieel">FALSE</right>
        </rights>
      </memorix:MEMORIX>
    </item>

	"""
	#the data returnde from Anefo is in some RSS format
	def __formatResponse(self, data, dimension):
		print data
		enrichments = []
		root = etree.fromstring(data)
		items = root.xpath('//item')
		count = 1 #xpath starts counting from 1
		for i in items:
			enrichment = Enrichment(
				i.xpath('./title')[0].text,
				url=i.xpath('./link')[0].text,
				description=i.xpath('./description')[0].text
			)

			#fetch the date from the XML
			path = etree.ETXPath('/rss/channel/item[%d]/{%s}date' % (count, self.NAMESPACE_DC))
			date = path(root)
			if len(date) > 0:
				d = None
				try:
					#d = datetime.strptime(e['published'][0:e['published'].find(' +')], '%a, %d %b %Y %H:%M:%S')
					#1983-02-18T00:00:00Z
					d = datetime.strptime(date[0].text, '%Y-%m-%dT%H:%M:%SZ')
				except ValueError, e:
					print 'invalid date: %s' % date[0].text
					pass
				if d:
					try:
						enrichment.setDate(d.strftime('%b %d %Y'))
					except ValueError, e:
						print 'Invalid date:'
						print d
						pass

			#fetch the posters from the XML
			path = etree.ETXPath('/rss/channel/item[%d]/{%s}isShownBy' % (count, self.NAMESPACE_ESE))
			posters = path(root)
			if len(posters) > 0:
				enrichment.setPoster(self.__getPoster(posters))

			#fetch the provider from the XML
			path = etree.ETXPath('/rss/channel/item[%d]/{%s}provider' % (count, self.NAMESPACE_ESE))
			provider = path(root)
			if len(provider) > 0:
				enrichment.setSource(provider[0].text)

			#fetch the provider from the XML
			path = etree.ETXPath('/rss/channel/item[%d]/{%s}creator' % (count, self.NAMESPACE_DC))
			creator = path(root)
			if len(creator) > 0:
				enrichment.setCreator(creator[0].text)

			enrichments.append(enrichment)
			count += 1

		return { 'enrichments' : enrichments}

	def __getPoster(self, posters):
		poster = None
		for p in posters:
			print p.text
			if p.text.find('150x150') != -1:
				poster = p.text
				break
		return poster