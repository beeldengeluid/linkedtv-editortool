import redis
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN
import simplejson
import urllib
import httplib2
import base64

"""
TODO make this implement an interface class and:
    - make sure to supply a set of dimensions this service supports 
"""

class TvEnricher():
    
    def __init__(self):
        print '__init__'
        self.BASE_URL = 'http://linkedtv.eurecom.fr/tvenricher/api'
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])
    
    def search(self, entities, provider, dimension, useDummyCache = False):
        #curl -X GET "http://linkedtv.eurecom.fr/tvenricher/api/entity/enrichment/RBB?q=Obama" --header "Content-Type:application/x-turtle" -v        
        if useDummyCache and self.cache.exists('dummyEnrichments'):
            print 'Loading dummy enrichments from cache!'
            return { 'enrichments' : simplejson.loads(self.cache.get('dummyEnrichments'))}
        http = httplib2.Http()
        url = self.getServiceUrl(entities, provider, dimension)
        print url
        headers = {'Content-type': 'application/json'}
        resp, content = http.request(url, 'GET', headers=headers)
        if content:
            #if useDummyCache and not self.cache.exists('dummyEnrichments'):
            #self.cache.set('dummyEnrichments', simplejson.dumps({ 'enrichments' : content }))
            return self.formatResponse(content, entities, provider, dimension)
        else:            
            return None 

    def getServiceUrl(self, entities, provider, dimension):
        query = urllib.quote(' '.join(entities)) #if somehow this fails to work, try to use '+' instead of ' '
        url = '%s/entity/enrichment/%s?q=%s' % (self.BASE_URL, dimension, query)
        if dimension == 'Solr':
            url = '%s&index=%s' % (url, provider)
        return url

    def formatResponse(self, content, entities, provider, dimension):
        resp = None        
        if dimension == 'Solr':
            enrichments = []
            mfs = simplejson.loads(content)
            for mf in mfs:
                mf = mf.replace('\r', '').replace('\n', '')                
                mf = mf[len('http://data.linkedtv.eu/media/'):]
                mf = mf[0:mf.find('#')]
                videoData = self.getVideoData(mf)
                enrichments.append({'micropostUrl' : mf, 'posterUrl' : videoData['poster'],
                 'micropost' : {'plainText' : videoData['title']} })
            resp = { 'enrichments' : { '%s' % ' '.join(entities) : {'LinkedTV' : enrichments } } }
        else:
            resp = { 'enrichments' : simplejson.loads(content) } # service is already included in the content
        return resp

    #this is basically copied from the (also crappy Api class)
    def getVideoData(self, resourceUri):        
        pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
        http = httplib2.Http()      
        url = 'http://api.linkedtv.eu/mediaresource/%s' % resourceUri        
        headers = {
            'Accept' : 'application/json',
            'Authorization' : 'Basic %s' % pw,
        }
        resp, content = http.request(url, 'GET', headers=headers)
        if resp and resp['status'] == '200':
            if content:
                videoData = simplejson.loads(content)
                video = {}
                if videoData.has_key('mediaResource') and videoData['mediaResource']:
                    video['title'] = videoData['mediaResource']['titleName']
                    if videoData['mediaResource']['mediaResourceRelationSet']:
                        for mrr in videoData['mediaResource']['mediaResourceRelationSet']:
                            if mrr['relationType'] == 'thumbnail-locator':
                                video['poster'] = '%sh/%d/m/%d/sec%d.jpg' % (mrr['relationTarget'], 0, 1, 0)
                return video            
        return None