import redis
import simplejson
import urllib
import httplib2
import base64

from linkedtv.api.dimension.DimensionService import DimensionService
from linkedtv.LinkedtvSettings import LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN
from linkedtv.utils.TimeUtils import TimeUtils

class TvEnricher(DimensionService):

    def __init__(self):
        DimensionService.__init__(self, 'TvEnricher')
        self.BASE_URL = 'http://linkedtv.eurecom.fr/tvenricher/api'
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])

    def fetch(self, query, entities, dimension):
        if self.__isValidDimension(dimension):
            return self.__formatResponse(self.__search(query, entities, dimension))
        return None

    def __isValidDimension(self, dimension):
        if dimension.has_key('service'):
            if dimension['service'].has_key('id') and dimension['service'].has_key('params'):
                return dimension['service']['params'].has_key('dimension')
        return False

    def __search(self, query, entities, dimension):
        #curl -X GET "http://linkedtv.eurecom.fr/tvenricher/api/entity/enrichment/RBB?q=Obama" --header "Content-Type:application/x-turtle" -v
        http = httplib2.Http()
        url = self.__getServiceUrl(query, dimension)
        headers = {'Content-type': 'application/json'}
        resp, content = http.request(url, 'GET', headers=headers)
        if content and resp and resp['status'] == '200':
            if dimension['service']['params']['dimension'] == 'Solr':
                enrichments = []
                mfs = simplejson.loads(content)
                for obj in mfs:
                    snippet = None
                    if obj.has_key('subtitle'):
                        snippet = obj['subtitle']
                    linkedtvUrl = obj['linkedtv_id']
                    mediaFragmentUri = obj['mf_id']
                    videoData = self.__getMediaFragmentData(mediaFragmentUri)
                    enrichments.append({'micropostUrl' : mediaFragmentUri, 'posterUrl' : videoData['poster'],
                     'micropost' : {'plainText' : videoData['title']} , 'description' : snippet})
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
        if dimension['service']['params'].has_key('granularity'):
            url = '%s&granularity=%s' % (url, dimension['service']['params']['granularity'])
        return url

    #Example mediafragment URI: http://data.linkedtv.eu/media/154307a8-0058-4946-839d-cd802fe0aad5#t\u003d262.4,457.64
    def __getMediaFragmentData(self, mediaFragmentUri):
        mediaFragmentUri = mediaFragmentUri[len('http://data.linkedtv.eu/media/'):]
        mfData = self.__getMediaFragmentUriData(mediaFragmentUri)
        pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
        http = httplib2.Http()
        url = 'http://api.linkedtv.eu/mediaresource/%s' % mfData[0]#resourceUri
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
                                t = mfData[1]
                                video['poster'] = '%sh/%d/m/%d/sec%d.jpg' % (mrr['relationTarget'], t[0], t[1], t[2])
                return video
        return None

    def __getMediaFragmentUriData(self, mediaFragmentUri):
        if mediaFragmentUri.find('#') == -1 and mediaFragmentUri.find('='):
            return None
        resourceUri = time = None
        t_arr = mediaFragmentUri.split('#')
        resourceUri = t_arr[0]
        try:
            secs = t_arr[1].rsplit('t=')[1].split(',')[0]
            time = TimeUtils.toTimeTuple(secs)
        except IndexError, e:
            print e
            pass
        return (resourceUri, time)

