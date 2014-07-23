from subprocess import *
import os

class UnstructuredSearch():
    
    def __init__(self):
        print '__init__'
        self.BASE_URL = 'http://ir-dev.lmcloud.vse.cz/irapi/media-server' #/RBB or /SV
        
    def search(self, s, provider):
        print s
        s = '%20'.join(s.split(' '))
        print '%s/?q=%s&domain_source=%s' % (self.BASE_URL, s, provider)#&searchAll=true
        cmd_arr = []
        cmd_arr.append('curl')        
        cmd_arr.append('%s/?q=%s&domain_source=%s' % (self.BASE_URL, s, provider))
        cmd_arr.append('-H')
        cmd_arr.append('Accept: application/json')
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            return stdout
        else:
            print stderr
            return None