import urllib
from subprocess import Popen, PIPE

from linkedtv.text.TextAnalyzer import *
from linkedtv.LinkedtvSettings import LTV_SPARQL_ENDPOINT, LTV_STOP_FILE

class LinkedTVDataUtils(object):

	"""Prefixes/ontologies used for the annotation body type, i.e. rdf:type"""
	LINKEDTV_MEDIA_RESOURCE_PF = 'http://data.linkedtv.eu/media/'
	LINKEDTV_ONTOLOGY_PF = 'http://data.linkedtv.eu/ontologies/core#' #'http://data.linkedtv.eu/ontology/'
	LINKEDTV_DATA_PF = 'http://data.linkedtv.eu/'
	NERD_ONTOLOGY_PF = 'http://nerd.eurecom.fr/ontology#'
	PROV_ET = 'http://data.linkedtv.eu/organization/SV/EditorTool'
	DBPEDIA_ONTOLOGY_PF = 'http://dbpedia.org/ontology/'

	@staticmethod
	def sendSearchRequest(query):
		cmd_arr = []
		cmd_arr.append('curl')
		cmd_arr.append('-X')
		cmd_arr.append('POST')
		cmd_arr.append(LTV_SPARQL_ENDPOINT)
		cmd_arr.append('-H')
		cmd_arr.append('Accept: application/sparql-results+json')
		cmd_arr.append('-d')
		cmd_arr.append('query=%s' % urllib.quote(query, ''))
		p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
		stdout, stderr = p1.communicate()
		if stdout:
			return stdout
		else:
			logger.error(stderr)
			return None

	@staticmethod
	def filterStopWords(nes):
		ta = TextAnalyzer()
		stop = ta.readStopWordsFile(LTV_STOP_FILE)
		nonStopNEs = []
		for ne in nes:
			if ne.getLabel().lower() in stop:
				continue
			else:
				nonStopNEs.append(ne)
		return nonStopNEs

	@staticmethod
	def getNEType(DCType, RDFType, OWLSameAs):
		"""The RDF should be the correct one, however in some cases the OWLSameAs or DCType makes more sense"""
		#TODO maybe later add some intelligence to this! Now handling on the client side...
		if(RDFType.find(LinkedTVDataUtils.DBPEDIA_ONTOLOGY_PF) == -1):
			return RDFType[len(LinkedTVDataUtils.NERD_ONTOLOGY_PF):]
		else:
			return RDFType[len(LinkedTVDataUtils.DBPEDIA_ONTOLOGY_PF):]

	@staticmethod
	def getDCTypes(DCType):
		if len(DCType) > 0 and DCType != 'null':
			types = {}
			if DCType.find('DBpedia') == -1 and DCType.find('Freebase') == -1:
				if DCType.find('dbpedia') == -1:
					return {'NERD' : [DCType]}
				else:
					return {'DBpedia' : [DCType[len(LinkedTVDataUtils.DBPEDIA_ONTOLOGY_PF):]]}
			dct_arr = DCType.split(';')
			for dct in dct_arr:
				ext_arr = dct.split(',')
				extractorName = None
				values = []
				for index, val in enumerate(ext_arr):
					if index == 0:
						extractorName = val[0:val.find(':')]
						val = val[val.find(':') + 1:]
						values.append(val)
						types[extractorName] = values
			return types
		else:
			return {}
