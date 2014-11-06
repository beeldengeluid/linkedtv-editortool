import redis
import simplejson
import urllib
import httplib2
import base64

from linkedtv.api.dimension.DimensionService import DimensionService
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN

class TvEnricher(DimensionService):
    
    def __init__(self):
        DimensionService.__init__(self, 'TvEnricher')
        self.BASE_URL = 'http://linkedtv.eurecom.fr/tvenricher/api'
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

    def fetch(self, query, dimension):
        if self.__isValidDimension(dimension):
            return self.__formatResponse(self.__search(query, dimension))
        return None

    def __isValidDimension(self, dimension):
        if dimension.has_key('service'):
            if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
                return dimension['service']['params'].has_key('dimension')
        return False

    def __search(self, query, dimension):
        #curl -X GET "http://linkedtv.eurecom.fr/tvenricher/api/entity/enrichment/RBB?q=Obama" --header "Content-Type:application/x-turtle" -v        
        http = httplib2.Http()
        url = self.__getServiceUrl(query, dimension)     
        print url    
        headers = {'Content-type': 'application/json'}
        resp, content = http.request(url, 'GET', headers=headers)
        if content:
            if dimension['service']['params']['dimension'] == 'Solr':
                enrichments = []
                mfs = simplejson.loads(content)
                for mf in mfs:
                    mf = mf.replace('\r', '').replace('\n', '')
                    mf = mf[len('http://data.linkedtv.eu/media/'):]
                    mf = mf[0:mf.find('#')]
                    videoData = self.__getVideoData(mf)
                    enrichments.append({'micropostUrl' : mf, 'posterUrl' : videoData['poster'],
                     'micropost' : {'plainText' : videoData['title']} })
                return { 'enrichments' : { '%s' % ' '.join(query) : {'LinkedTV' : enrichments } } }
            else:
                return { 'enrichments' : simplejson.loads(content) } # service is already included in the content            
        else:
            return None

    def __formatResponse(self, data):
        return data

    def __getServiceUrl(self, query, dimension):
        query = urllib.quote(' '.join(query))
        url = '%s/entity/enrichment/%s?q=%s' % (self.BASE_URL, dimension['service']['params']['dimension'], query)
        if dimension['service']['params'].has_key('index'):        
            url = '%s&index=%s' % (url, dimension['service']['params']['index'])
        return url

    #this is basically copied from the (also crappy Api class)
    def __getVideoData(self, resourceUri):
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