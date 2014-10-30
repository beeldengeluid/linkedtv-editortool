import simplejson
import redis
import base64
import httplib2
from subprocess import Popen, PIPE
from linkedtv.LinkedtvSettings import LTV_API_ENDPOINT, LTV_DATA_ENDPOINT, LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN

#storage related
from linkedtv.api.storage.sparql.DataLoader import DataLoader
from linkedtv.api.storage.SaveEndpoint import SaveEndpoint
from linkedtv.api.storage.publish.PublishingHandler import PublishingHandler

#image & video related
from linkedtv.api.video.VideoPlayoutHandler import VideoPlayoutHandler
from linkedtv.api.images.ImageFetcher import ImageFetcher

#dimension/enrichment services
from linkedtv.api.dimension.DimensionHandler import DimensionHandler

#linkedTV object holding all data
from linkedtv.model.MediaResource import MediaResource

#dataconverter for transforming ET (client) JSON data into a MediaResource
from linkedtv.utils.DataConverter import DataConverter

class Api():
    
    def __init__(self):
        self.END_POINT = LTV_API_ENDPOINT
        self.DATA_END_POINT = LTV_DATA_ENDPOINT
        self.dataLoader = DataLoader()
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])    


    """-------------------------LOAD, SAVE AND EXPORT MEDIA RESOURCES-------------------------"""

    def load_ltv(self, resourceUri, clientIP, loadData):
        mediaResource = MediaResource()
        if loadData:
            mediaResource = self.__getAllAnnotationsOfResource(resourceUri, False)
        """Get the mediaresource metadata and the playout URL"""
        print 'getting video metadata'
        videoMetadata = self.__getVideoData(resourceUri)        
        if videoMetadata:
            videoMetadata = simplejson.loads(videoMetadata)        
        vph = VideoPlayoutHandler()
        mediaResource.setVideoMetadata(videoMetadata)
        if videoMetadata:
            playoutURL = vph.getPlayoutURL(videoMetadata['mediaResource']['locator'], clientIP)
            mediaResource.setPlayoutUrl(playoutURL)
        if videoMetadata:
            if videoMetadata['mediaResource']['mediaResourceRelationSet']:
                for mrr in videoMetadata['mediaResource']['mediaResourceRelationSet']:
                    if mrr['relationType'] == 'thumbnail-locator':
                        mediaResource.setThumbBaseUrl(mrr['relationTarget'])
                    elif mrr['relationType'] == 'srt':
                        mediaResource.setSrtUrl(mrr['relationTarget'])
        resp = simplejson.dumps(mediaResource, default=lambda obj: obj.__dict__)
        return resp

    def load_et(self, resourceUri):
        sep = SaveEndpoint()
        return sep.loadCuratedResource(resourceUri)        

    def save_et(self, saveData):
        sep = SaveEndpoint()
        try:
            resp = sep.saveVideo(simplejson.loads(saveData))
        except JSONDecodeError, e:
            return None
        return resp

    def publish(self, publishingPoint, saveData):
        print 'PUBLISHING DATA TO: %s' % publishingPoint
        ph = PublishingHandler()
        mr = DataConverter.convertSaveData(saveData)#create mediaResource object
        print simplejson.dumps(mr, default=lambda obj: obj.__dict__)
        ph.publish(publishingPoint, mr)
        return None

    #uses the SPARQL dataloader to fetch all annotations
    def __getAllAnnotationsOfResource(self, resourceUri, fetchFromCache=False):
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
            self.cache.set(resourceUri, simplejson.dumps(data, default=lambda obj: obj.__dict__))
        return data


    """-------------------------DIMENSION HANDLING-------------------------"""

    def dimension(self, dimension, query, params):
        dh = DimensionHandler()
        return dh.fetch(dimension, query, params)

    def dimensions(self):
        dh = DimensionHandler()
        return dh.getRegisteredServices()


    """-------------------------VIDEOS & IMAGES-------------------------"""

    def videos(self, provider):
        videos = []
        videoUris = self.dataLoader.getMediaResources(provider)
        vd = None
        video = None
        thumbBaseUrl = None
        for uri in videoUris['videos']:
            vd = self.__getVideoData(uri)
            if vd:
                vd = simplejson.loads(vd)
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
        #self.getVideosOfProviderNew(provider, None, None)
        return {'videos' : videos}

    def image(self, millis, baseUrl):
        fetcher = ImageFetcher()
        resp = fetcher.getNoterikThumbnailByMillis(millis, baseUrl)

    #directly uses the linkedTV platform
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
            return content
        return None

    """
    def __getVideosOfProviderNew(self, provider, videos, page):
        print 'Getting new videos of provider: %s' % provider
        if provider == 'sv':
            provider = 'S&V'
        #http://api.linkedtv.eu/mediaresource?publisher=S%26V
        pw = base64.b64encode(b'%s:%s' % (LTV_PLATFORM_LOGIN['user'], LTV_PLATFORM_LOGIN['password']))
        http = httplib2.Http()      
        url = 'http://api.linkedtv.eu/mediaresource?publisher=%s' % provider
        headers = {
            'Accept' : 'application/json',
            'Authorization' : 'Basic %s' % pw,
        }
        resp, content = http.request(url, 'GET', headers=headers)        
        if resp and resp['status'] == '200':
            return content
        return None
    """
