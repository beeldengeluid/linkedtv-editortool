from subprocess import *
import os

class TvEnricher():
    
    def __init__(self):
        print '__init__'
        self.BASE_URL = 'http://linkedtv.eurecom.fr/tvenricher/api'            
    
    def getEnrichmentsOnDemand(self, entities, provider):
        #curl -X GET "http://linkedtv.eurecom.fr/tvenricher/api/entity/enrichment/RBB?q=Obama" --header "Content-Type:application/x-turtle" -v
        print 'getting list of processed resources:'
        print '%s/entity/enrichment/%s?q=%s' % (self.BASE_URL, provider, ' '.join(entities))
        cmd_arr = []
        cmd_arr.append('curl')
        cmd_arr.append('-X')
        cmd_arr.append('GET')
        cmd_arr.append('%s/entity/enrichment/%s?q=%s' % (self.BASE_URL, provider, ' '.join(entities)))
        cmd_arr.append('-H')
        cmd_arr.append('Accept: application/json')
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            return { 'enrichments' : stdout }
        else:
            print stderr
            return None

    #this function is deprecated
    def getProcessedResources(self):
        print 'getting list of processed resources'
        cmd_arr = []
        cmd_arr.append('curl')
        cmd_arr.append('-X')
        cmd_arr.append('GET')        
        cmd_arr.append('%s/mediaresource/list' % (self.BASE_URL))
        #cmd_arr.append('-H')
        #cmd_arr.append('Accept: application/json')
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            return stdout
        else:
            print stderr
            return None
        
    #this function is deprecated
    def getProcessedResource(self, uuid):
        print 'Getting resource: %s' % uuid 
        cmd_arr = []
        cmd_arr.append('curl')
        cmd_arr.append('-X')
        cmd_arr.append('GET')
        cmd_arr.append('%s/mediaresource/%s/enrichment' % (self.BASE_URL, uuid))        
        cmd_arr.append('-H')
        cmd_arr.append('Content-Type:text/xml')
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            print stdout
            return stdout
        else:
            print stderr
            return None