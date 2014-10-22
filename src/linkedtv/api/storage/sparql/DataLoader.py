from subprocess import Popen, PIPE
import os
import simplejson
from simplejson import JSONDecodeError
import urllib
import httplib2
import base64
import logging

from linkedtv.text.TextAnalyzer import TextAnalyzer
from linkedtv.LinkedtvSettings import LTV_SAVE_GRAPH, LTV_SPARQL_ENDPOINT, LTV_STOP_FILE
from linkedtv.utils.TimeUtils import *
from linkedtv.model import *


logger = logging.getLogger(__name__)

class DataLoader():

    def __init__(self):
        logger.debug(' -- initializing LinkedTVAPI --')
        self.LINKEDTV_MEDIA_RESOURCE_PF = 'http://data.linkedtv.eu/media/'
        
        """Prefixes/ontologies used for the annotation body type, i.e. rdf:type"""
        self.LINKEDTV_ONTOLOGY_PF = 'http://data.linkedtv.eu/ontologies/core#' #'http://data.linkedtv.eu/ontology/'
        self.LINKEDTV_DATA_PF = 'http://data.linkedtv.eu/'
        self.NERD_ONTOLOGY_PF = 'http://nerd.eurecom.fr/ontology#'
        
        self.PROV_ET = 'http://data.linkedtv.eu/organization/SV/EditorTool'
        self.ET_GRAPH = LTV_SAVE_GRAPH
        
        self.GRAPH = 'http://data.linkedtv.eu/graph/linkedtv'
        
        """Used for the owl:sameAs"""
        self.DBPEDIA_ONTOLOGY_PF = 'http://dbpedia.org/ontology/'
        self.NL_WIKIPEDIA_PF = 'http://nl.wikipedia.org/wiki/'
        self.DE_WIKIPEDIA_PF = 'http://de.wikipedia.org/wiki/'
        self.EN_WIKIPEDIA_PF = 'http://en.wikipedia.org/wiki/'
    

    """maps to videos API call"""
    def getMediaResources(self, publisher, format='json'):
        query = []
        query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
        query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
        query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
        query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
        query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
        query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
        query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
        query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
        query.append('SELECT DISTINCT ?locator ?medialocator ')
        query.append('FROM <%s> ' % self.GRAPH)
        query.append('WHERE { ')
        query.append('?medialocator ma:locator ?locator . ')
        query.append('?mf ma:isFragmentOf ?medialocator . ')
        query.append('?mf rdf:type ma:MediaFragment . ')
        query.append('?annotation oa:hasTarget ?mf . ')
        query.append('}')
        #print ''.join(query)
        resp = self.__sendSearchRequest(''.join(query))
        jsonData = None
        try:
            jsonData = simplejson.loads(resp)            
        except JSONDecodeError, e:
            print e
        locs = []
        found = False
        if jsonData:
            for k in jsonData['results']['bindings']:
                if k.has_key('medialocator') and k.has_key('locator'):
                    if publisher == 'sv':
                        found = k['locator']['value'].find('SV') != -1 or k['locator']['value'].find('avro') != -1
                    else:
                        found = k['locator']['value'].find(publisher) != -1
                    if found:
                        loc = k['medialocator']['value']
                        loc = loc[len(self.LINKEDTV_MEDIA_RESOURCE_PF):]
                        locs.append(loc)
        return {'videos' : locs}
    

    """maps to load_ltv API call"""
    def loadMediaResource(self, mediaResourceID, locator = None):
        mr = MediaResource(mediaResourceID)
        print 'getting computated data...'
        mr = self.__loadAutogenMediaResourceData(mr)
        print mr
        if mr:
            print 'getting curated data...'
            mr.setCuratedMediaResource(self.__loadCuratedMediaResourceData(mr.getId()))
        return mr


    def __sendSearchRequest(self, query):      
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
    
    def __loadAutogenMediaResourceData (self, mediaResource):        
        """Otherwise get query it from the SPARQL end-point"""     
        query = []
        query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
        query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
        query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
        query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
        query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
        query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
        query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
        query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')
        
        query.append('SELECT DISTINCT ?mf ?annotation ?body ?start ?end ?label ?RDFType ?DCType ?OWLSameAs ?c ?r ')
        query.append('FROM <%s> ' % self.GRAPH)
        query.append('WHERE { ')
        query.append('?mf ma:isFragmentOf <%s%s> . ' % (self.LINKEDTV_MEDIA_RESOURCE_PF, mediaResource.getId()))
        query.append('?mf nsa:temporalStart ?start . ')
        query.append('?mf nsa:temporalEnd ?end . ')
        query.append('?annotation oa:hasTarget ?mf . ')
        query.append('?annotation rdf:type <http://www.w3.org/ns/oa#Annotation> . ')
        query.append('?annotation oa:hasBody ?body . ')
        
        """To make sure that no enrichments are selected"""
        query.append('OPTIONAL { ?annotationy oa:motivatedBy ?motivation . FILTER (?annotation = ?annotationy) . } ') 
        query.append('FILTER ( !BOUND(?annotationy) ) ') 
        
        query.append('OPTIONAL {?body dc:type ?DCType } ') #dit wordt gebruikt voor NE extractor types
        query.append('OPTIONAL {?body rdf:type ?RDFType} ') #dit wordt gebruikt voor de NERD & CERTH ontologies
        query.append('OPTIONAL {?body owl:sameAs ?OWLSameAs} ') #dit wordt gebruikt voor CERTH en ook NE wiki/dbpedia links
        query.append('OPTIONAL {?body linkedtv:hasConfidence ?c } ')
        query.append('OPTIONAL {?body linkedtv:hasRelevance ?r } ')
        query.append('OPTIONAL {?body rdfs:label ?label}')        
        query.append('}')
        print ''.join(query)
        logger.debug(''.join(query))
        resp = self.__sendSearchRequest(''.join(query))
        jsonData = None
        try:
            jsonData = simplejson.loads(resp)
        except JSONDecodeError, e:
            logger.error(e)
        if jsonData:            
            concepts = []
            nes = []
            shots = []
            chapters = []                    
            for k in jsonData['results']['bindings']:
                mfURI = annotationURI = bodyURI = label = RDFType = DCType = OWLSameAs = r = c = ''
                start = end = 0
                if k.has_key('mf'): mfURI = k['mf']['value']
                if k.has_key('annotation'): annotationURI = k['annotation']['value']
                if k.has_key('body'): bodyURI = k['body']['value']                
                if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
                if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
                if k.has_key('label'): label = k['label']['value']
                if k.has_key('c'): c = k['c']['value']
                if k.has_key('r'): r = k['r']['value']
                if k.has_key('RDFType'): RDFType = k['RDFType']['value']
                if k.has_key('DCType'): DCType = k['DCType']['value']
                if k.has_key('OWLSameAs'): OWLSameAs = k['OWLSameAs']['value']                
                if RDFType == '%sConcept' % self.LINKEDTV_ONTOLOGY_PF:                    
                    concepts.append(Concept(label, start, end, OWLSameAs, mfURI, annotationURI, bodyURI, r, c))
                elif RDFType == '%sShot' % self.LINKEDTV_ONTOLOGY_PF:                    
                    shots.append(Shot(label, start, end, mfURI, annotationURI, bodyURI, r, c))
                elif RDFType == '%sChapter' % self.LINKEDTV_ONTOLOGY_PF:
                    chapters.append(Chapter(label, start, end, mfURI, annotationURI, bodyURI, r, c))
                elif RDFType.find(self.NERD_ONTOLOGY_PF) != -1:
                    nes.append(NamedEntity(label, self.__getNEType(DCType, RDFType, OWLSameAs), 
                        self.__getDCTypes(DCType), OWLSameAs, start, end, mfURI, annotationURI, bodyURI, r, c))
            
            #load the autogenerated enrichments        
            enrichments = self.__loadAutogenEnrichmentsOfMediaResource(mediaResource.getId())

            #add all of the loaded data to the media resource
            mediaResource.setConcepts(concepts)
            mediaResource.setNamedEntities(self.__filterStopWords(nes))
            mediaResource.setShots(shots)
            mediaResource.setChapters(chapters)
            mediaResource.setEnrichments(enrichments)
            
            return mediaResource
        return None
    
    """
    This function (should) return a dictionary with key=NElabel value=list of hyperlinks
    TODO: the RDF data is not yet available and therefore this function has to be tested still!!
    """
    def __loadAutogenEnrichmentsOfMediaResource(self, mediaResourceID):
        query = []
        query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
        query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
        query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
        query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
        query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
        query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
        query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
        query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
        query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')
        
        query.append('SELECT DISTINCT ?body ?entity ?entityLabel ?source ?date ?creator ?deeplink ?partOf ?poster ?socialInteraction ')
        query.append('?DCType ?start ?end ')
        query.append('FROM <%s> ' % self.GRAPH)
        query.append('WHERE { ')
        query.append('?mf ma:isFragmentOf <%s%s> . ' % (self.LINKEDTV_MEDIA_RESOURCE_PF, mediaResourceID))
        query.append('?mf nsa:temporalStart ?start . ')
        query.append('?mf nsa:temporalEnd ?end . ')
        query.append('?annotation oa:hasTarget ?mf . ')
        query.append('?annotation rdf:type <http://www.w3.org/ns/oa#Annotation> . ')
        query.append('?annotation oa:motivatedBy oa:linking . ')
        query.append('?annotation oa:hasBody ?body . ')
        
        #later on there could be more than one related entity!!! Need to update this!
        query.append('?annotation prov:wasDerivedFrom ?entity . ')
        query.append('?entity rdfs:label ?entityLabel ')
        
        query.append('OPTIONAL {?body dc:type ?DCType } ')
        query.append('OPTIONAL {?body linkedtv:hasPoster ?poster } ')
        query.append('OPTIONAL {?body linkedtv:hasSocialInteraction ?socialInteraction } ')        
        #query.append('OPTIONAL {?body rdf:type ?RDFType} ')
        query.append('OPTIONAL {?body dc:source ?source} ')
        query.append('OPTIONAL {?body dc:date ?date } ')
        query.append('OPTIONAL {?body ma:locator ?deeplink} ')
        query.append('OPTIONAL {?body dc:isPartOf ?partOf} ')
        query.append('OPTIONAL {?body dc:creator ?creator} ')
        #query.append('OPTIONAL {?body dc:description ?desc . ?desc <http://nlp2rdf.lod2.eu/schema/string/label> ?label}')
        query.append('}')        
        logger.debug(''.join(query))
        resp = self.__sendSearchRequest(''.join(query))
        jsonData = None
        try:
            jsonData = simplejson.loads(resp)
        except JSONDecodeError, e:
            print e
        enrichments = []
        if jsonData:
            for k in jsonData['results']['bindings']:
                uri = entityURI = entityLabel = source = date = creator = deeplink = partOf = DCType = ''
                socialInteraction = poster = ''
                start = end = 0
                if k.has_key('body'): bodyURI = k['body']['value']            
                if k.has_key('entity'): entityURI = k['entity']['value']
                if k.has_key('entityLabel'): entityLabel = k['entityLabel']['value']
                if k.has_key('source'): source = k['source']['value']
                if k.has_key('date'): date = k['date']['value']
                if k.has_key('creator'): creator = k['creator']['value']
                if k.has_key('deeplink'): deeplink = k['deeplink']['value']
                if k.has_key('partOf'): partOf = k['partOf']['value']
                if k.has_key('DCType'): DCType = k['DCType']['value']
                if k.has_key('poster'): poster = k['poster']['value']
                if k.has_key('socialInteraction'): socialInteraction = k['socialInteraction']['value']
                if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
                if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
                
                #TODO update when there are more!
                entities = [Entity(entityURI, entityLabel)]
                enrichments.append(Enrichment(deeplink, None, poster, start, end, source, creator, date, entities,
                    socialInteraction, bodyURI, DCType))


        return enrichments
    
    def __loadCuratedMediaResourceData (self, mediaResourceID):        
        
        """Otherwise get query it from the SPARQL end-point"""     
        query = []
        query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
        query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
        query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
        query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
        query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
        query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
        query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
        query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
        query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')
        
        query.append('SELECT DISTINCT ?orgMF ?mf ?orgAnnotation ?annotation ?enrichment ?orgBody ?body ')
        query.append('?start ?end ?label ?RDFType ?DCType ?OWLSameAs ?vocabURL ?c ?r ?segmentType ')
        
        query.append('FROM <%s> ' % self.ET_GRAPH)
        
        query.append('WHERE { ')
        query.append('?mf ma:isFragmentOf <%s%s> . ' % (self.LINKEDTV_MEDIA_RESOURCE_PF, mediaResourceID))        
        query.append('?mf nsa:temporalStart ?start . ')
        query.append('?mf nsa:temporalEnd ?end . ')
        query.append('OPTIONAL {?mf linkedtv:wasDerivedFrom ?orgMF } ')
        
        query.append('?annotation oa:hasTarget ?mf . ')
        query.append('OPTIONAL {?enrichment oa:hasTarget ?mf . ')
        query.append('?enrichment oa:motivatedBy <http://www.w3.org/ns/oa#linking> } ')
        query.append('?annotation prov:wasAttributedTo <%s> . ' % self.PROV_ET)
        query.append('?annotation rdf:type <http://www.w3.org/ns/oa#Annotation> . ')
        query.append('?annotation oa:hasBody ?body . ')
        query.append('OPTIONAL {?annotation linkedtv:wasDerivedFrom ?orgAnnotation } ')
        
        """To make sure that no enrichments are selected"""
        #query.append('OPTIONAL { ?annotationy oa:motivatedBy ?motivation . FILTER (?annotation = ?annotationy) . } ') 
        #query.append('FILTER ( !BOUND(?annotationy) ) ')
        
        query.append('OPTIONAL {?body linkedtv:wasDerivedFrom ?orgBody } ')
        query.append('OPTIONAL {?body linkedtv:hasSegmentType ?segmentType } ')
        query.append('OPTIONAL {?body dc:type ?DCType } ') #dit wordt gebruikt voor NE extractor types
        query.append('OPTIONAL {?body rdf:type ?RDFType} ') #dit wordt gebruikt voor de NERD & CERTH ontologies
        query.append('OPTIONAL {?body owl:sameAs ?OWLSameAs} ') #dit wordt gebruikt voor CERTH en ook NE wiki/dbpedia/yago links
        query.append('OPTIONAL {?body ma:locator ?vocabURL} ') #dit wordt gebruikt voor custom external vocab links
        query.append('OPTIONAL {?body linkedtv:hasConfidence ?c } ')
        query.append('OPTIONAL {?body linkedtv:hasRelevance ?r } ')
        query.append('OPTIONAL {?body rdfs:label ?label}')
        query.append('}')
        logger.debug(''.join(query))
        resp = self.__sendSearchRequest(''.join(query))
        jsonData = None
        try:
            jsonData = simplejson.loads(resp)
        except JSONDecodeError, e:
            logger.error(resp)
            logger.error(e)
        if jsonData:            
            concepts = []
            nes = []
            shots = []
            chapters = []
            for k in jsonData['results']['bindings']:
                ETenrichmentURI = mfURI = ETmfURI = annotationURI = ETannotationURI = bodyURI = ETbodyURI = bodyURI = label = ''
                RDFType = DCType = OWLSameAs = vocabURL = r = c = segmentType = ''
                start = end = 0
                if k.has_key('enrichment'): ETenrichmentURI = k['enrichment']['value']
                if k.has_key('mf'): ETmfURI = k['mf']['value']
                if k.has_key('orgMf'): mfURI = k['orgMf']['value']
                if k.has_key('annotation'): ETannotationURI = k['annotation']['value']
                if k.has_key('orgAnnotation'): annotationURI = k['orgAnnotation']['value']
                if k.has_key('body'): ETbodyURI = k['body']['value']
                if k.has_key('orgBody'): bodyURI = k['orgBody']['value']                
                if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
                if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
                if k.has_key('label'): label = k['label']['value']
                if k.has_key('c'): c = k['c']['value']
                if k.has_key('r'): r = k['r']['value']
                if k.has_key('segmentType'): segmentType = k['segmentType']['value']
                if k.has_key('RDFType'): RDFType = k['RDFType']['value']
                if k.has_key('DCType'): DCType = k['DCType']['value']
                if k.has_key('OWLSameAs'): OWLSameAs = k['OWLSameAs']['value']
                if k.has_key('vocabURL'): vocabURL = k['vocabURL']['value']

                if RDFType == '%sConcept' % self.LINKEDTV_ONTOLOGY_PF:
                    continue #not supported
                elif RDFType == '%sShot' % self.LINKEDTV_ONTOLOGY_PF:
                    """ TODO add curated URIs to object!!!?

                    shots.append({'ETmfURI' : ETmfURI, 'ETannotationURI' : ETannotationURI, 'ETbodyURI' : ETbodyURI,
                                  'mfURI' : mfURI, 'annotationURI' : annotationURI, 'bodyURI' : bodyURI, 'start' : start,
                                  'end' : end, 'label' : label, 'relevance' : r, 'confidence' : c})
                    """
                    shots.append(Shot(label, start, end, mfURI, annotationURI, bodyURI, r, c))
                elif RDFType == '%sChapter' % self.LINKEDTV_ONTOLOGY_PF:
                    """
                    chapters.append({'ETmfURI' : ETmfURI, 'ETannotationURI' : ETannotationURI, 'ETbodyURI' : ETbodyURI,
                                     'mfURI' : mfURI, 'annotationURI' : annotationURI, 'bodyURI' : bodyURI, 'start' : start, 'end' : end,
                                     'label' : label, 'relevance' : r, 'confidence' : c, 'segmentType' : segmentType})
                    """
                    chapters.append(Chapter(label, start, end, mfURI, annotationURI, bodyURI, r, c))
                elif RDFType.find(self.NERD_ONTOLOGY_PF) != -1 or RDFType.find(self.DBPEDIA_ONTOLOGY_PF) != -1:
                    """
                    nes.append({'ETenrichmentURI' : ETenrichmentURI, 'ETmfURI' : ETmfURI, 'ETannotationURI' : ETannotationURI, 'ETbodyURI' : ETbodyURI,
                                'mfURI' : mfURI, 'annotationURI' : annotationURI, 'bodyURI' : bodyURI, 'start' : start,
                                'end' : end, 'label' : label, 'type' : self.__getNEType(DCType, RDFType, OWLSameAs),
                                'subTypes' : self.__getDCTypes(DCType), 'disambiguationURL' : OWLSameAs, 'relevance' : r, 'confidence' : c,
                                'url' : vocabURL})
                    """
                    nes.append(NamedEntity(label, self.__getNEType(DCType, RDFType, OWLSameAs), 
                        self.__getDCTypes(DCType), OWLSameAs, start, end, mfURI, annotationURI, bodyURI, r, c))

            #load the curated enrichments (NEEDS TO BE CHANGED)
            enrichments = self.__loadCuratedEnrichmentsOfMediaResource(mediaResourceID)

            #add everything to the media resource
            mediaResource = MediaResource(mediaResourceID)
            mediaResource.setNamedEntities(self.__filterStopWords(nes))
            mediaResource.setShots(shots)
            mediaResource.setChapters(chapters)
            mediaResource.setEnrichments(enrichments)            
            
            return mediaResource
        return None
    
    def __loadCuratedEnrichmentsOfMediaResource(self, mediaResourceID):
        query = []
        query.append('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ')
        query.append('PREFIX linkedtv: <http://data.linkedtv.eu/ontologies/core#> ')
        query.append('PREFIX oa: <http://www.w3.org/ns/oa#> ')
        query.append('PREFIX ma: <http://www.w3.org/ns/ma-ont#> ')
        query.append('PREFIX nsa: <http://multimedialab.elis.ugent.be/organon/ontologies/ninsuna#> ')
        query.append('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ')
        query.append('PREFIX owl: <http://www.w3.org/2002/07/owl#> ')
        query.append('PREFIX prov: <http://www.w3.org/ns/prov#> ')
        query.append('PREFIX dc: <http://purl.org/dc/elements/1.1/> ')
        
        query.append('SELECT DISTINCT ?body ?prov ?entity ?source ?date ?creator ?deeplink ?partOf ?poster ?socialInteraction ')
        query.append('?DCType ?start ?end ?bodyProv ')
        query.append('FROM <%s> ' % self.ET_GRAPH)
        query.append('FROM <%s> ' % self.GRAPH)
        query.append('WHERE { ')
        query.append('?mf ma:isFragmentOf <%s%s> . ' % (self.LINKEDTV_MEDIA_RESOURCE_PF, mediaResourceID))
        query.append('?mf nsa:temporalStart ?start . ')
        query.append('?mf nsa:temporalEnd ?end . ')
        query.append('?annotation oa:hasTarget ?mf . ')
        query.append('?annotation rdf:type <http://www.w3.org/ns/oa#Annotation> . ')
        query.append('?annotation oa:motivatedBy oa:linking . ')
        query.append('?annotation oa:hasBody ?body . ')
        query.append('?annotation prov:wasAttributedTo <%s> . ' % self.PROV_ET)
        query.append('?annotation prov:wasDerivedFrom ?prov . ')
        query.append('?prov rdfs:label ?entity . ')
        
        query.append('OPTIONAL {?body prov:wasAttributedTo ?bodyProv } ')
        query.append('OPTIONAL {?body dc:type ?DCType } ')
        query.append('OPTIONAL {?body linkedtv:hasPoster ?poster } ')
        query.append('OPTIONAL {?body linkedtv:hasSocialInteraction ?socialInteraction } ')        
        #query.append('OPTIONAL {?body rdf:type ?RDFType} ')
        query.append('OPTIONAL {?body dc:source ?source} ')
        query.append('OPTIONAL {?body dc:date ?date } ')
        query.append('OPTIONAL {?body ma:locator ?deeplink} ')
        query.append('OPTIONAL {?body dc:isPartOf ?partOf} ')
        query.append('OPTIONAL {?body dc:creator ?creator} ')
        #query.append('OPTIONAL {?body dc:description ?desc . ?desc <http://nlp2rdf.lod2.eu/schema/string/label> ?label}')
        query.append('}')
        logger.debug('---------- CURATED ENRICHMENTS --------------')
        logger.debug(''.join(query))
        resp = self.__sendSearchRequest(''.join(query))
        jsonData = None
        try:
            jsonData = simplejson.loads(resp)
        except JSONDecodeError, e:
            logger.error(e)
        enrichments = []
        if jsonData:
            for k in jsonData['results']['bindings']:
                bodyURI = annotationURI = entityLabel = source = date = creator = deeplink = partOf = DCType = ''
                socialInteraction = poster = bodyProv = ''
                start = end = 0
                if k.has_key('body'): bodyURI = k['body']['value']                
                if k.has_key('prov'): annotationURI = k['prov']['value']
                if k.has_key('entity'): entityLabel = k['entity']['value']
                if k.has_key('source'): source = k['source']['value']
                if k.has_key('date'): date = k['date']['value']
                if k.has_key('creator'): creator = k['creator']['value']
                if k.has_key('deeplink'): deeplink = k['deeplink']['value']
                if k.has_key('partOf'): partOf = k['partOf']['value']        
                if k.has_key('DCType'): DCType = k['DCType']['value']
                if k.has_key('poster'): poster = k['poster']['value']
                if k.has_key('socialInteraction'): socialInteraction = k['socialInteraction']['value']
                if k.has_key('start'): start = TimeUtils.toMillis(k['start']['value'])
                if k.has_key('end'): end = TimeUtils.toMillis(k['end']['value'])
                if k.has_key('bodyProv'): bodyProv = k['bodyProv']['value']
                
                """
                enrichments.append({'bodyURI' : bodyURI, 'source' : source, 'date' : date, 'creator' : creator, 
                                    'url' : deeplink, 'partOf' : partOf, 'DCType' : DCType, 'start' : start, 'end' : end,
                                    'annotationURI' : annotationURI, 'ne' : entityLabel, 'poster' : poster,
                                    'socialInteraction' : socialInteraction, 'bodyProv' : bodyProv})
                """
                
                enrichments.append(Enrichment(deeplink, entityLabel, poster, start, end, source, creator, date, [],
                    socialInteraction, bodyURI, DCType))

        return enrichments
    
    def __filterStopWords(self, nes):
        ta = TextAnalyzer()
        stop = ta.readStopWordsFile(LTV_STOP_FILE)
        nonStopNEs = []
        for ne in nes:
            if ne.getLabel().lower() in stop:
                continue
            else:
                nonStopNEs.append(ne)
        return nonStopNEs     
    
    def __getNEType(self, DCType, RDFType, OWLSameAs):
        """The RDF should be the correct one, however in some cases the OWLSameAs or DCType makes more sense"""
        #TODO maybe later add some intelligence to this! Now handling on the client side...
        if(RDFType.find(self.DBPEDIA_ONTOLOGY_PF) == -1):                
            return RDFType[len(self.NERD_ONTOLOGY_PF):]
        else:
            return RDFType[len(self.DBPEDIA_ONTOLOGY_PF):]
        
    def __getDCTypes(self, DCType):
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
            