import simplejson
import xlrd
import redis
from linkedtv.model.Chapter import Chapter
from linkedtv.model.MediaResource import MediaResource
from linkedtv.LinkedtvSettings import LTV_GROUND_TRUTH
from linkedtv.utils.TimeUtils import TimeUtils

"""
This class supports parsing a spreadsheet containing ground truth data:
- each row must be a chapter and must contain the video ID in the first column
- an example of the currently supported format can be found in the resources/groundtruths directory

Note: this class is called when:
- the parameter 'loadGroundTruth' is set to true in config.js
- the resourceUri has no curated data stored yet (see linkedtv.api.storage.SaveEndPoint)

Note: whenever the spreadsheet is first parsed it is also cached/stored in the Redis store
"""
class GroundTruthLoader():

	def __init__(self):
		self.store = redis.Redis(
			host=LTV_GROUND_TRUTH['redis-host'],
			port=LTV_GROUND_TRUTH['redis-port'],
			db=LTV_GROUND_TRUTH['redis-db']
		)

	#todo maybe the ground truth can be separated in different files, but for now there is only one for chapters,
	#which are the root for all stored data anyway...
	def loadGroundTruth(self, resourceUri):
		chapters = self.loadChaptersOfResource(resourceUri)
		return chapters

	def loadChaptersOfResource(self, resourceUri):
		print 'Loading ground truth data for %s' % resourceUri
		videos = None
		chapters = None
		if self.store.exists(LTV_GROUND_TRUTH['id']):
			print 'Found some ground truth data in cache!'
			videos = simplejson.loads(self.store.get(LTV_GROUND_TRUTH['id']))
		else:
			videos = simplejson.loads(self.extractDataFromFile(LTV_GROUND_TRUTH['chapters']))
		if videos and videos.has_key(resourceUri):
			print 'The chapter was available in the ground truth'
			return videos[resourceUri]
		return None

	def extractDataFromFile(self, fileName):
		print 'loading the ground truth data in the local storage'

		#load the configured spreadsheet
		workbook = xlrd.open_workbook(fileName)
		sheet = workbook.sheet_by_index(0)
		x = 1 #skip the first row

		#loop through the rows and create a list of videos holding chapters
		videos = {}
		chapters = []
		curVideo = MediaResource()
		while x < sheet.nrows:
			if (curVideo.getId() == None or curVideo.getId() != sheet.cell_value(x, 0)) and sheet.cell_value(x, 0) != u'':
				if len(chapters) > 0:
					curVideo.setChapters(chapters)
					videos[curVideo.getId()] = curVideo
					chapters = []
				curVideo = MediaResource(sheet.cell_value(x, 0))
			if sheet.ncols == 6 and sheet.cell_value(x, 3) != "":
				c = Chapter(
					sheet.cell_value(x, 3),
					start=TimeUtils.srtTimeToMillis(sheet.cell_value(x, 4), False),
					end=TimeUtils.srtTimeToMillis(sheet.cell_value(x, 5), False),
					relevance=1,
					confidence=1#full confidence in the ground truth
				)
				chapters.append(c)
			x += 1

		#add the last video
		curVideo.setChapters(chapters)
		videos[curVideo.getId()] = curVideo
		print 'NUMBER OF VIDEOS FOUND IN GROUND TRUTH: %d' % len(videos)

		videoData = simplejson.dumps(videos, default=lambda obj: obj.__dict__)

		#store the data in the redis store
		self.store.set(LTV_GROUND_TRUTH['id'],videoData)

		return videoData