import simplejson
import redis
from subprocess import Popen, PIPE
from linkedtv.LinkedtvSettings import LTV_API_ENDPOINT, LTV_DATA_ENDPOINT, LTV_REDIS_SETTINGS
from linkedtv.api.sparql.DataLoader import *
from linkedtv.api.external.TvEnricher import *

class Api():
    
    def __init__(self):
        self.END_POINT = LTV_API_ENDPOINT
        self.DATA_END_POINT = LTV_DATA_ENDPOINT
        self.dataLoader = DataLoader()
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

    """-----------------Resource (replace later on)------------------"""

    #this function should be replaced when the LinkedTV API has been updated   
    def getEntireResource(self, resourceUri, fetchFromCache=False):
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
            data = self.dataLoader.loadMediaResource(resourceUri)
        return data


    """-----------------Videos------------------"""

    def getVideosOfProvider(self, provider):
        return self.dataLoader.getMediaResources(provider)


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

    def getEnrichmentsOnDemand(self, entities, provider, useDummyEnrichments = False):
        tve = TvEnricher()
        return tve.getEnrichmentsOnDemand(entities, provider, useDummyEnrichments)