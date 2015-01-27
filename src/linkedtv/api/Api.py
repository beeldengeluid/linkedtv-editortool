import simplejson

#storage related
from linkedtv.api.storage.SaveEndpoint import SaveEndpoint
from linkedtv.api.storage.publish.PublishingHandler import PublishingHandler
from linkedtv.api.storage.load.DataLoadHandler import DataLoadHandler
from linkedtv.api.storage.synchronize.SynchronizationHandler import SynchronizationHandler

#subtitle loader, should be integrated with the dataloadhandlers
from linkedtv.api.storage.load.ltv.LinkedTVSubtitleLoader import LinkedTVSubtitleLoader

#image related
from linkedtv.api.images.ImageFetcher import ImageFetcher

#dimension/enrichment services
from linkedtv.api.dimension.DimensionHandler import DimensionHandler

#linkedTV object holding all data
from linkedtv.model.MediaResource import MediaResource

#dataconverter for transforming ET (client) JSON data into a MediaResource
from linkedtv.utils.DataConverter import DataConverter

#logs user actions
from linkedtv.api.logging.UserActionLogger import UserActionLogger

class Api():

    def __init__(self):
        self.dataLoadHandler = DataLoadHandler()

    def load(self, platform, resourceUri, clientIP, loadAnnotations):
        return self.dataLoadHandler.loadMediaResourceData(platform, resourceUri, clientIP, loadAnnotations)

    def load_curated(self, resourceUri, loadGroundTruth):
        sep = SaveEndpoint()
        return sep.loadCuratedResource(resourceUri, loadGroundTruth)

    def save(self, saveData):
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

    def synchronize(self, platform, resourceUri, provider):
        sh = SynchronizationHandler()
        return sh.synchronize(platform, resourceUri, provider)

    def log(self, logData):
        ual = UserActionLogger()
        if ual.log(logData):
            return True
        return False

    def showlogs(self):
        ual = UserActionLogger()
        return ual.getLogs()

    def dimension(self, query, entities, dimension):
        dh = DimensionHandler()
        return dh.fetch(query, entities, dimension)

    def dimensions(self):
        dh = DimensionHandler()
        return dh.getRegisteredServices()

    def videos(self, platform, provider):
        return self.dataLoadHandler.loadMediaResources(platform, provider)

    def image(self, millis, baseUrl):
        fetcher = ImageFetcher()
        return fetcher.getNoterikThumbnailByMillis(millis, baseUrl)


    def subtitles(self, resourceUri, start, end):
        subLoader = LinkedTVSubtitleLoader()
        return subLoader.loadSubtitleFragmentByResourceUri(resourceUri, start, end)

