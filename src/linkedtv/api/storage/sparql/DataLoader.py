from subprocess import Popen, PIPE
import urllib

from linkedtv.LinkedtvSettings import LTV_SPARQL_ENDPOINT, LTV_STOP_FILE
from linkedtv.text.TextAnalyzer import TextAnalyzer

class DataLoader(object):

	def __init__(self):
		print 'Initializing the DataLoader superclass'

	def sendSearchRequest(self, query):
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
	
	def filterStopWords(self, nes):
		ta = TextAnalyzer()
		stop = ta.readStopWordsFile(LTV_STOP_FILE)
		nonStopNEs = []
		for ne in nes:
			if ne.getLabel().lower() in stop:
				continue
			else:
				nonStopNEs.append(ne)
		return nonStopNEs     
	
	def getNEType(self, DCType, RDFType, OWLSameAs):
		"""The RDF should be the correct one, however in some cases the OWLSameAs or DCType makes more sense"""
		#TODO maybe later add some intelligence to this! Now handling on the client side...
		if(RDFType.find(self.DBPEDIA_ONTOLOGY_PF) == -1):                
			return RDFType[len(self.NERD_ONTOLOGY_PF):]
		else:
			return RDFType[len(self.DBPEDIA_ONTOLOGY_PF):]
		
	def getDCTypes(self, DCType):
		if len(DCType) > 0 and DCType != 'null':
			types = {}
			if DCType.find('DBpedia') == -1 and DCType.find('Freebase') == -1:
				if DCType.find('dbpedia') == -1:
					return {'NERD' : [DCType]}
				else:
					return {'DBpedia' : [DCType[len(self.DBPEDIA_ONTOLOGY_PF):]]}
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
