import redis
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS
import simplejson
import urllib
import httplib2

"""
TODO replace the ugly curl functions and use Python httplib2 & urllib
"""

class TvEnricher():
    
    def __init__(self):
        print '__init__'
        self.BASE_URL = 'http://linkedtv.eurecom.fr/tvenricher/api'
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])
    
    def getEnrichmentsOnDemand(self, entities, provider, useDummyCache = False):
        #curl -X GET "http://linkedtv.eurecom.fr/tvenricher/api/entity/enrichment/RBB?q=Obama" --header "Content-Type:application/x-turtle" -v
        print 'Getting enrichments on demand'
        print useDummyCache
        if useDummyCache and self.cache.exists('dummyEnrichments'):
            print 'Loading dummy enrichments from cache!'
            return simplejson.loads(self.cache.get('dummyEnrichments'))

        http = httplib2.Http()        
        query = urllib.quote(' '.join(entities)) #if somehow this fails to work, try to use '+' instead of ' '
        url = '%s/entity/enrichment/%s?q=%s&strategy=%s' % (self.BASE_URL, provider, query, provider)
        headers = {'Content-type': 'application/json'}        
        resp, content = http.request(url, 'GET', headers=headers)
        print url
        print resp
        if content:
            #if useDummyCache and not self.cache.exists('dummyEnrichments'):
            #self.cache.set('dummyEnrichments', simplejson.dumps({ 'enrichments' : content }))            
            return { 'enrichments' : content }
        else:
            print stderr
            return None
