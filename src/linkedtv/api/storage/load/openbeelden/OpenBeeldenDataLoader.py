#!/usr/bin/python

"""
PyOAI docs:
	https://svn.infrae.com/pyoai/tag/pyoai-2.4/doc/API.html


How to match an id with Openbeelden:

[ElasticSearch ID]
	oai:openimages.eu:3860

[OAI ID]
	http://openbeelden.nl/feeds/oai/?verb=GetRecord&identifier=oai:openimages.eu:3860&metadataPrefix=oai_oi

[WEBSITE ID]
	http://openbeelden.nl/media/3860

"""
import codecs
import itertools
import simplejson

from dateutil.parser import parse

from oaipmh.client import Client
from oaipmh.metadata import MetadataRegistry, oai_dc_reader, MetadataReader
from oaipmh.server import oai_dc_writer

from elasticsearch import Elasticsearch

from linkedtv.model import *
from linkedtv.api.storage.load.openbeelden.OpenSKOSHandler import OpenSKOSHandler
from linkedtv.LinkedtvSettings import LTV_ES_SETTINGS
from linkedtv.api.storage.load.DataLoader import DataLoader


class OpenBeeldenDataLoader(DataLoader):

	def __init__(self):
		self.ES_INDEX = 'et_openbeelden'
		self.ES_DOC_TYPE = 'mediaresource'
		self.es_local = Elasticsearch(host=LTV_ES_SETTINGS['host'], port=LTV_ES_SETTINGS['port'])

	def loadMediaResourceData(self, resourceUri, clientIP, loadAnnotations):
		mediaResource = MediaResource(resourceUri)

		#load the annotations (only named entities in this case)
		mediaResource = self.__getAllAnnotationsOfResource(mediaResource)

		#fetch the video metadata
		mediaResource = self.__getAllVideoMetadata(mediaResource, clientIP)

		#transform the mediaresource object to JSON and return it
		resp = simplejson.dumps(mediaResource, default=lambda obj: obj.__dict__)
		return resp

	def loadMediaResources(self, provider):#ignores provider
		return self.loadOpenBeeldenItemsFromES(0, [])


	def loadOpenBeeldenItemsFromES(self, offset, videos):
		query = {
			"query": {
				"match_all": {}
			},
  			"fields": [],
  			"from": offset,
			"size": 300
		}
		resp = self.es_local.search(index=self.ES_INDEX, doc_type=self.ES_DOC_TYPE, body=query, timeout="10s")
		if resp and len(resp['hits']['hits']) > 0:
			print len(resp['hits']['hits'])
			vids = []
			for hit in resp['hits']['hits']:
				vid = self.es_local.get(index=self.ES_INDEX, doc_type=self.ES_DOC_TYPE, id=hit['_id'])
				vids.append(vid['_source'])
			for vd in vids:
				video = {
					'id' : vd['id'].replace(':', '_'),
					'title' : '; '.join(vd['title']),
					'date' : '; '.join(vd['date']),
					'locator' : self.__getMediumByExtension(vd['medium'], 'mp4'),
					'thumbUrl' : self.__getMediumByExtension(vd['medium'], 'png'),
					'thumbBaseUrl' : ''
				}
				videos.append(video)
			self.loadOpenBeeldenItemsFromES(offset + 300, videos)
		return {'videos' : videos}


	def __getMediumByExtension(self, mediums, extension):
		poster = None
		for m in mediums:
			if m.find('.%s' % extension) != -1:
				poster = m
				break
		return poster

	def __getAllAnnotationsOfResource(self, mediaResource):
		nes = []
		"""
		nes.append(NamedEntity(
			label,
			entityType=LinkedTVDataUtils.getNEType(DCType, RDFType, OWLSameAs),
			subTypes=LinkedTVDataUtils.getDCTypes(DCType),
			disambiguationURL=OWLSameAs,
			start=start,
			end=end,
			annotationURI=annotationURI,
			relevance=r,
			confidence=c
			)
		)
		"""
		mediaResource.setNamedEntities(nes)

		return mediaResource

	def __getAllVideoMetadata(self, mediaResource, clientIP):
		print mediaResource.getId()
		vd = self.es_local.get(index=self.ES_INDEX, doc_type=self.ES_DOC_TYPE, id=mediaResource.getId().replace('_', ':'))
		if vd:
			vd = vd['_source']
			mediaResource.setVideoMetadata(vd)

			mediaResource.setPlayoutUrl(self.__getMediumByExtension(vd['medium'], 'mp4'))

			#set the video metadata in the mediaresource
			mediaResource.setTitle('; '.join(vd['title']))
			mediaResource.setDate('; '.join(vd['date']))
			mediaResource.setThumbBaseUrl(None)
			mediaResource.setSrtUrl(None)
			mediaResource.setSubtitles(None)

		return mediaResource

	def setupOAIPMHConnection(self):
		oai_oi_reader = MetadataReader(
		    fields={
		    'title':       ('textList', 'oai_oi:oi/oi:title/text()'),
		    'alternative':       ('textList', 'oai_oi:oi/oi:alternative/text()'),
		    'creator':     ('textList', 'oai_oi:oi/oi:creator/text()'),
		    'subject':     ('textList', 'oai_oi:oi/oi:subject/text()'),
		    'description': ('textList', 'oai_oi:oi/oi:description/text()'),
		    'abstract': ('textList', 'oai_oi:oi/oi:abstract/text()'),
		    'publisher':   ('textList', 'oai_oi:oi/oi:publisher/text()'),
		    'contributor': ('textList', 'oai_oi:oi/oi:contributor/text()'),
		    'date':        ('textList', 'oai_oi:oi/oi:date/text()'),
		    'type':        ('textList', 'oai_oi:oi/oi:type/text()'),
		    'extent':        ('textList', 'oai_oi:oi/oi:extent/text()'),
		    'medium':        ('textList', 'oai_oi:oi/oi:medium/text()'),
		    'identifier':  ('textList', 'oai_oi:oi/oi:identifier/text()'),
		    'source':      ('textList', 'oai_oi:oi/oi:source/text()'),
		    'language':    ('textList', 'oai_oi:oi/oi:language/text()'),
		    'references':    ('textList', 'oai_oi:oi/oi:references/text()'),
		    'spatial':    ('textList', 'oai_oi:oi/oi:spatial/text()'),
		    'attributionName':    ('textList', 'oai_oi:oi/oi:attributionName/text()'),
		    'attributionURL':    ('textList', 'oai_oi:oi/oi:attributionURL/text()'),
		    'license':      ('textList', 'oai_oi:oi/oi:license/text()')
		    },

		    namespaces={
		    	'oai_oi': 'http://www.openbeelden.nl/feeds/oai/', #'http://www.openarchives.org/OAI/2.0/oai_oi/',
		    	'oi': 'http://www.openbeelden.nl/oai/'
		    }
		)

		URL = 'http://www.openbeelden.nl/feeds/oai/'

		#Initialize the OAI client
		self.registry = MetadataRegistry()
		self.registry.registerReader('oai_oi', oai_oi_reader)
		self.client = Client(URL, self.registry)

		#Test if the connection to the OAI-PMH provider works
		x = self.client.updateGranularity()
		x = self.client.identify()
		print 'identity %s' % x.repositoryName()
		print 'identity %s' % x.protocolVersion()
		print 'identity %s' % x.baseURL()

		"""
		for s in client.listSets():
			print s
		"""

		#initialize the OpenSKOSHandler
		self.openSKOSHandler = OpenSKOSHandler()

	def reindex(self, provider = None):
		setupOAIPMHConnection()
		i = 0
		extent = None
		item = None
		identifier = None
		for rec in self.client.listRecords(metadataPrefix=u'oai_oi', set=u'beeldengeluid'):#stichting_natuurbeelden, beeldengeluid
			header, metadata, about = rec

			extent = metadata.getField('extent')[0]
			item = {
				'id' : header.identifier(),
				'identifier' : self.getFieldData(metadata, 'identifier'),
				'title' : self.getFieldData(metadata, 'title'),
				'alternative' : self.getFieldData(metadata, 'alternative'),
				'creator' : self.getFieldData(metadata, 'creator'),
				'subject' : self.getFieldData(metadata, 'subject'),
				'description' : self.getFieldData(metadata, 'description'),
				'abstract' : self.getFieldData(metadata, 'abstract'),
				'publisher' : self.getFieldData(metadata, 'publisher'),
				'contributor' : self.getFieldData(metadata, 'contributor'),
				'date' : self.getFieldData(metadata, 'date'),
				'date2' : header.datestamp(),
				'type' : self.getFieldData(metadata, 'type'),
				'extent' : extent,
				'medium' : self.getFieldData(metadata, 'medium'),
				'source' : self.getFieldData(metadata, 'source'),
				'language' : self.getFieldData(metadata, 'language'),
				'references' : self.getFieldData(metadata, 'references'),
				'spatial' : self.getFieldData(metadata, 'spatial'),
				'attributionName' : self.getFieldData(metadata, 'attributionName'),
				'attributionURL' : self.getFieldData(metadata, 'attributionURL'),
				'license' : self.getFieldData(metadata, 'license'),
				'durationSecs' : self.getExtentInSeconds(extent)
			}
			self.es_local.index(index=self.ES_INDEX, doc_type=self.ES_DOC_TYPE, id=header.identifier(), body=item)

		print 'Done'
		return True

	def getGTAATermsBySubjects(self, subject, spatial):
		"""Get the GTAA terms related to the subject"""
		gtaaTerms = self.getGTAATermsBasedOnSubjectAndLocation(subject, spatial)

		"""If there is no identifier, try to fetch the taakID from iMMix ES"""
		if identifier == '' and source != '':
			print 'No taakID!'
			taakID = self.getTaakIDBasedOnSource(source)
			if taakID:
				print 'assigning taakID to the identifier'
				identifier = taakID
		return gtaaTerms

	def getFieldData(self, metadata, fn):
		#return '; '.join(metadata.getField(fn))
		return metadata.getField(fn)

	def getExtentInSeconds(self, ext):
		secs = 0
		if ext and ext.find('PT') != -1:
			ext = ext[2:len(ext)]
			if ext.find('H') != -1:
				secs = int(ext[0:ext.find('H')]) * 3600
				ext = ext[ext.find('H') + 1:len(ext)]
			if ext.find('M') != -1:
				secs = int(ext[0:ext.find('M')]) * 60
				ext = ext[ext.find('M') + 1:len(ext)]
			if ext.find('S') != -1:
				secs += int(ext[0:ext.find('S')])
		return secs

	def secsToTimeString(self, secs):
		h = m = s = 0
		while secs - 3600 >= 0:
			h += 1
			secs -= 3600
		while secs - 60 >= 0:
			m += 1
			secs -= 60
		return '%d:%d:%d' % (h, m, s)
	#Run de hoofdfunctie

	def getGTAATermsBasedOnSubjectAndLocation(self, subject, spatial):
		subs = None
		locs = None
		os_res = None
		gtaaExact = []
		gtaaFuzzy = []

		"""First add GTAA terms based on the subject(s)"""
		if subject:
			subs = subject.split(';')
			for s in subs:
				 os_res = self.openSKOSHandler.autoCompleteTable(s)
				 if os_res:
					 if len(os_res) == 1:
						gtaaExact.append('%s,%s' % (os_res[0]['label'], os_res[0]['value']))
					 elif len(os_res) > 1:
						for r in os_res:
							gtaaFuzzy.append('%s,%s' % (r['label'], r['value']))

		"""Append the GTAA terms based on the location(s)"""
		if spatial:
			locs = spatial.split(';')
			for l in locs:
				 os_res = self.openSKOSHandler.autoCompleteTable(l, 'http://data.beeldengeluid.nl/gtaa/GeografischeNamen')
				 if os_res:
					 if len(os_res) == 1:
						gtaaExact.append('%s,%s' % (os_res[0]['label'], os_res[0]['value']))
					 elif len(os_res) > 1:
						for r in os_res:
							gtaaFuzzy.append('%s,%s' % (r['label'], r['value']))

		return (gtaaExact, gtaaFuzzy)

	def getImmixMetadataBasedOnDrager(self, drager):
		global tot
		query = {"query":{"bool":{"must":[{"query_string":{"default_field":"positie.dragernummer","query":"\"%s\"" % drager}}],"must_not":[],"should":[]}}}
		#print query
		resp = es_local.search(index="search_expressie", doc_type="searchable_expressie", body=query, timeout="10s")
		#print resp
		if resp and resp['hits']['total'] == 1:
			for hit in resp['hits']['hits']:
				return hit
		elif resp and resp['hits']['total'] > 1:
			print 'more than one hit...'
			print resp
		return None

	def getTaakIDBasedOnSource(self, source):
		dragernrs = str(source).split('; ')
		drager = None

		"""Get the drager from the source (sometimes there are two, but most of the times they are the same)"""
		if len(dragernrs) == 2:
			if dragernrs[0] != dragernrs[1]:
				print dragernrs
				print '>>>>>>>>>> There are two dragers...'
			else:
				drager = dragernrs[0]
		else:
			drager = dragernrs[0]

		"""Try to find the taakID related to the drager"""
		if drager:
			md = self.getImmixMetadataBasedOnDrager(drager)
			if md:
				taakID = md['_source']['expressie']['niveau']['taakID']
				if taakID:
					print 'Found a taakID: %s\t%s' % (drager, taakID)
					return taakID
		return None
