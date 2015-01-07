class DataLoader(object):

	def __init__(self, name):
		self.name = name

	def publish(self, data):
		print 'Publishing data'
		print data