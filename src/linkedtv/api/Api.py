import simplejson
import redis
import base64
import httplib2
from subprocess import Popen, PIPE
from linkedtv.LinkedtvSettings import LTV_API_ENDPOINT, LTV_DATA_ENDPOINT, LTV_REDIS_SETTINGS, LTV_PLATFORM_LOGIN

#storage related
from linkedtv.api.storage.sparql.AutogenDataLoader import AutogenDataLoader
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
        self.autogenDataLoader = AutogenDataLoader()
        self.cache = redis.Redis(host=LTV_REDIS_SETTINGS['host'], port=LTV_REDIS_SETTINGS['port'], db=LTV_REDIS_SETTINGS['db'])


    """-------------------------LOAD, SAVE AND EXPORT MEDIA RESOURCES-------------------------"""

    def load_ltv(self, resourceUri, clientIP, loadData):
        mediaResource = MediaResource()
        if loadData:
            mediaResource = self.__getAllAnnotationsOfResource(resourceUri, False)

        videoMetadata = self.__getVideoData(resourceUri)
        vd = None
        if videoMetadata:
            vd = simplejson.loads(videoMetadata)

        mr = None
        if vd:
            #set the all the video metadata to be sure
            mediaResource.setVideoMetadata(vd)

            #make sure there is a mediaresource
            if vd.has_key('mediaResource'):
                mr = vd['mediaResource']

                #get the playout URL
                if mr.has_key('locator'):
                    vph = VideoPlayoutHandler()
                    playoutURL = vph.getPlayoutURL(mr['locator'], clientIP)
                    mediaResource.setPlayoutUrl(playoutURL)

                #set the video metadata in the mediaresource
                mediaResource.setTitle(mr['titleName'])
                mediaResource.setDate(self.__getDateFromVideoTitle(mr['titleName']))

                if mr.has_key('mediaResourceRelationSet'):
                    for mrr in mr['mediaResourceRelationSet']:
                        if mrr['relationType'] == 'thumbnail-locator':
                            mediaResource.setThumbBaseUrl(mrr['relationTarget'])
                        elif mrr['relationType'] == 'srt':
                            mediaResource.setSrtUrl(mrr['relationTarget'])

        resp = simplejson.dumps(mediaResource, default=lambda obj: obj.__dict__)
        return resp


    def load_curated_ltv(self, resourceUri):
        sep = SaveEndpoint()
        return sep.loadCuratedResource(resourceUri)

    def load_curated_et(self, resourceUri):
        sep = SaveEndpoint()
        return sep.loadCuratedResource(resourceUri)

    def save_et(self, saveData):
        sep = SaveEndpoint()
        try:
            resp = sep.saveVideo(simplejson.loads(saveData))
        except JSONDecodeError, e:
            return None
        return resp

    def publish(self, publishingPoint, saveData, unpublish):
        print 'PUBLISHING DATA TO: %s' % publishingPoint
        ph = PublishingHandler()
        #create mediaResource object
        mr = DataConverter.convertSaveData(saveData)
        if unpublish:
            mr = ph.unpublish(publishingPoint, mr)
        else:
            mr = ph.publish(publishingPoint, mr)
        resp = simplejson.dumps(mr, default=lambda obj: obj.__dict__)
        return resp

    #uses the SPARQL autogenDataLoader to fetch all automatically generated annotations
    def __getAllAnnotationsOfResource(self, resourceUri, fetchFromCache=False):
        print 'Getting %s from the API or cache' % resourceUri
        data = None
        if fetchFromCache:
            if self.cache.exists(resourceUri):
                print 'Exists in cache!'
                data = simplejson.loads(self.cache.get(resourceUri))
            else:
                print 'No cache for you, one year!'
                data = self.autogenDataLoader.loadMediaResource(resourceUri)
                self.cache.set(resourceUri, simplejson.dumps(data))
        else:
            print 'fetching from API'
            data = self.autogenDataLoader.loadMediaResource(resourceUri)
            self.cache.set(resourceUri, simplejson.dumps(data, default=lambda obj: obj.__dict__))
        return data


    """-------------------------DIMENSION HANDLING-------------------------"""

    def dimension(self, query, entities, dimension):
        dh = DimensionHandler()
        return dh.fetch(query, entities, dimension)

    def dimensions(self):
        dh = DimensionHandler()
        return dh.getRegisteredServices()


    """-------------------------VIDEOS & IMAGES-------------------------"""

    def videos(self, provider):
        videos = []
        videoUris = self.autogenDataLoader.getMediaResources(provider)
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
                        'date' : self.__getDateFromVideoTitle(vd['mediaResource']['titleName']),
                        'locator' : vd['mediaResource']['locator'],
                        'thumbBaseUrl' : thumbBaseUrl,
                        'dateInserted' : vd['mediaResource']['dateInserted']#TODO convert to pretty date
                    }
                    videos.append(video)
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

    def __getDateFromVideoTitle(self, title):
        #e.g. TITLE= rbb AKTUELL vom 26.01.2013 Teil 2 - Kein Zug fur Meyenburg
        date = None
        if title:
            t_arr = title.split(' ')
            for t in t_arr:
                if t.find('.') != -1:
                    d_arr = t.split('.')
                    if len(d_arr) == 3:
                        date = '%s%s%s' % (d_arr[2], d_arr[1], d_arr[0])
                        break
        return date