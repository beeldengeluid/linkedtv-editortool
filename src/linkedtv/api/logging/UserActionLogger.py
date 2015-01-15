import simplejson
import csv
import redis
from linkedtv.LinkedtvSettings import LTV_LOGGING_SETTINGS

class UserActionLogger():

	def __init__(self):
		self.store = redis.Redis(
			host=LTV_LOGGING_SETTINGS['redis-host'], port=LTV_LOGGING_SETTINGS['redis-port'], db=LTV_LOGGING_SETTINGS['redis-db']
		)

	def log(self, logData):
		key = logData['timeCreated']
		self.store.hset('userLogs', '%s' % key, simplejson.dumps(logData))
		return True

	def exportToCSV(self):
		with open(LTV_LOGGING_SETTINGS['output-csv'], 'w') as csvfile:
			fieldnames = ['timeCreated', 'user', 'videoId', 'chapterTitle', 'queries', 'urls', 'allEnrichments', 'savedEnrichments']
			writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
			writer.writeheader()
			#now loop through the log records stored in the Redis store
			keys = self.store.hkeys('userLogs')
			for k in keys:
				l = simplejson.loads(self.store.hget('userLogs', k))
				writer.writerow({
					'timeCreated': k,
					'user' : l['user'],
					'videoId' : l['videoId'],
					'chapterTitle' : l['chapterTitle'],
					'queries' : ';'.join(l['queries']),
					'urls' : ';'.join(l['urls']),
					'allEnrichments' : ';'.join(l['allEnrichments']),
					'savedEnrichments' : ';'.join(l['savedEnrichments'])
				})

	def getLogs(self):
		logs = []
		keys = self.store.hkeys('userLogs')
		keys.sort()
		for k in keys:
			logs.append(simplejson.loads(self.store.hget('userLogs', k)))
		#self.exportToCSV()
		return logs
