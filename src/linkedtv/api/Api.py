import simplejson
import redis
from subprocess import Popen, PIPE
from linkedtv.LinkedtvSettings import LTV_API_ENDPOINT, LTV_DATA_ENDPOINT, LTV_REDIS_SETTINGS
from linkedtv.api.sparql.DataLoader import *
from linkedtv.api.external.TvEnricher import *
from linkedtv.api.external.TvNewsEnricher import *

class Api():
    
    def __init__(self):
        self.END_POINT = LTV_API_ENDPOINT
        self.DATA_END_POINT = LTV_DATA_ENDPOINT
        self.dataLoader = DataLoader()
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

    """-----------------Resource (replace later on)------------------"""

    #directly uses the linkedTV platform
    def getVideoData(self, resourceUri):        
        pw = base64.b64encode(b'admin:linkedtv')
        http = httplib2.Http()      
        url = 'http://api.linkedtv.eu/mediaresource/%s' % resourceUri        
        headers = {
            'Accept' : 'application/json',
            'Authorization' : 'Basic %s' % pw,
        }
        resp, content = http.request(url, 'GET', headers=headers)
        if resp and resp['status'] == '200':
            return content
        return None

    #uses the SPARQL dataloader to fetch all annotations
    def getAllAnnotationsOfResource(self, resourceUri, fetchFromCache=False):
        print 'Getting %s from the API or cache' % resourceUri
        data = None
        if fetchFromCache:
            if self.cache.exists(resourceUri):
                print 'Exists in cache!'
                data = simplejson.loads(self.cache.get(resourceUri))
            else:
                print 'No cache for you, one year!'
                data = self.dataLoader.loadMediaResource(resourceUri)
                self.cache.set(resourceUri, simplejson.dumps(data))
        else:
            print 'fetching from API'
            data = self.dataLoader.loadMediaResource(resourceUri)
            print data
            self.cache.set(resourceUri, simplejson.dumps(data))
        return data


    """-----------------Videos------------------"""

    def getVideosOfProvider(self, provider):
        videos = []
        videoUris = self.dataLoader.getMediaResources(provider)
        print videoUris
        vd = None
        video = None
        thumbBaseUrl = None
        for uri in videoUris['videos']:
            print uri
            vd = simplejson.loads(self.getVideoData(uri))
            if vd['mediaResource']:
                if vd['mediaResource'].has_key('mediaResourceRelationSet') and vd['mediaResource']['mediaResourceRelationSet']:
                    for mrr in vd['mediaResource']['mediaResourceRelationSet']:
                        if mrr['relationType'] == 'thumbnail-locator':
                            thumbBaseUrl = mrr['relationTarget']
                video = {
                    'id' : vd['mediaResource']['id'],
                    'title' : vd['mediaResource']['titleName'],
                    'locator' : vd['mediaResource']['locator'],
                    'thumbBaseUrl' : thumbBaseUrl,
                    'dateInserted' : vd['mediaResource']['dateInserted']#TODO convert to pretty date
                }
                videos.append(video)
        return {'videos' : videos}


    """-----------------Chapters------------------"""

    def getChaptersOfResource(self, resourceUri):
    	url = '%s/annotation?_view=all&hasTarget.isFragmentOf=%s/media/%s&hasBody.type=Chapter' % (self.DATA_END_POINT,
         self.DATA_END_POINT, resourceUri)
    	resp = self.sendRequest(url)    	
    	chapterData = simplejson.loads(resp)
    	chapters = []
    	for item in chapterData['result']['items']:
    		mfUri = item['hasTarget']
    		mfUri = mfUri[mfUri.rfind('#t=') + 3:]
    		t_arr = mfUri.split(',')
    		chapters.append({
    			'title' : item['hasBody']['label'],
    			'start' : t_arr[0],
    			'end' : t_arr[1]
			})

    	return {'chapters' : chapters}    

    def sendRequest(self, url):
        cmd_arr = []
        cmd_arr.append('curl')
        cmd_arr.append('-X')
        cmd_arr.append('GET')
        cmd_arr.append(url)
        cmd_arr.append('-H')
        cmd_arr.append('Accept: application/json')
        cmd_arr.append('-H')
        cmd_arr.append('Authorization: YWRtaW46bGlua2VkdHY=')
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            return stdout
        else:
            return None


    """-----------------Entities------------------"""

    def getEntitiesOfResource(self, resourceUri):
        url = '%s/annotation?hasTarget.isFragmentOf=%s/media/%s&_view=full&Entity' % (self.DATA_END_POINT, self.DATA_END_POINT, resourceUri)
        resp = self.sendRequest(url)
        entityData = simplejson.loads(resp)
        entities = []
        for item in entityData['result']['items']:
            print item
            entities.append(item)
        return {'entities' : entities} 


    """-----------------Enrichments------------------"""

    def getEnrichmentsOnDemand(self, entities, provider, dimension, service, useDummyEnrichments = False):
        #later fetch the endpoint based on the supplied dimension & provider
        if service == 'TvEnricher':
            print 'Fetching stuff from the TvEnricher'
            tve = TvEnricher()
            return tve.search(entities, provider, dimension, useDummyEnrichments)
        elif service == 'TvNewsEnricher':
            print 'Fetching stuff from the TvNewsEnricher'
            tvne = TvNewsEnricher()
            return tvne.search(entities, provider, dimension, useDummyEnrichments)
        return None