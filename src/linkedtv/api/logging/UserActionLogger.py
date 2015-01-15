import redis
from linkedtv.LinkedtvSettings import LTV_REDIS_LOGGING_SETTINGS

class UserActionLogger():

	def __init__(self):
		self.store = redis.Redis(
			host=LTV_REDIS_LOGGING_SETTINGS['host'], port=LTV_REDIS_LOGGING_SETTINGS['port'], db=LTV_REDIS_LOGGING_SETTINGS['db']
		)

	def log(self, logData):
		print 'Logging some stuff'
		key = logData['timeCreated']
		self.store.hset('userLogs', '%s' % key, logData)
		self.exportToCSV()
		return True

	def exportToCSV(self):
		keys = self.store.hkeys('userLogs')
		for k in keys:
			print k
