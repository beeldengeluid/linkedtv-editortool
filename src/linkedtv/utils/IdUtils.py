class IdUtils():

	@staticmethod
	def generateMediaFragmentId(resourceUri, startMs, endMs):
		start = startMs / 1000.0;
		end = endMs / 1000.0;
		return '%s#t=%s,%s' % (resourceUri, start, end)