import simplejson
from subprocess import Popen, PIPE
from linkedtv.LinkedtvSettings import LTV_API_ENDPOINT, LTV_DATA_ENDPOINT
from linkedtv.api.sparql.DataLoader import *

class Api():
    
    def __init__(self):
        self.END_POINT = LTV_API_ENDPOINT
        self.DATA_END_POINT = LTV_DATA_ENDPOINT
        self.dataLoader = DataLoader()


    """-----------------Videos------------------"""

    def getVideosOfProvider(self, provider):
        return self.dataLoader.getMediaResources(provider)


    """-----------------Chapters------------------"""

    def getChaptersOfResource(self, resourceUri):
    	url = '%s/annotation?_view=all&hasTarget.isFragmentOf=%s/media/%s&hasBody.type=Chapter' % (self.DATA_END_POINT, self.DATA_END_POINT, resourceUri)
    	resp = self.sendRequest(url)    	
    	chapterData = simplejson.loads(resp)
    	chapters = []
    	for item in chapterData['result']['items']:
    		mfUri = item['hasTarget']
    		mfUri = mfUri[mfUri.rfind('#t=') + 3:]
    		t_arr = mfUri.split(',')
    		chapters.append({
    			'title' : item['hasBody']['label'],
    			'start' : t_arr[0],
    			'end' : t_arr[1]
			})

    	return {'chapters' : chapters}    

    def sendRequest(self, url):
        cmd_arr = []
        cmd_arr.append('curl')
        cmd_arr.append('-X')
        cmd_arr.append('GET')
        cmd_arr.append(url)
        cmd_arr.append('-H')
        cmd_arr.append('Accept: application/json')
        cmd_arr.append('-H')
        cmd_arr.append('Authorization: YWRtaW46bGlua2VkdHY=')
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            return stdout
        else:
            return None