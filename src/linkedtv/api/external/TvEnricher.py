import redis
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS
import simplejson
import urllib
import httplib2

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
        print 'Getting enrichments on demand'
        print useDummyCache
        if useDummyCache and self.cache.exists('dummyEnrichments'):
            print 'Loading dummy enrichments from cache!'
            return { 'enrichments' : simplejson.loads(self.cache.get('dummyEnrichments'))}
        http = httplib2.Http()
        url = self.getServiceUrl(entities, provider, dimension)
        print url
        headers = {'Content-type': 'application/json'}
        resp, content = http.request(url, 'GET', headers=headers)
        print resp
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
                enrichments.append({'micropostUrl' : mf, 'micropost' : {'plainText' : mf} })
            resp = { 'enrichments' : { '%s' % ' '.join(entities) : {'LinkedTV' : enrichments } } }

        else:
            resp = { 'enrichments' : simplejson.loads(content) } # service is already included in the content
        return resp