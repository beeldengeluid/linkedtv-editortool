from subprocess import *
import os


class MediaCollector():
    
    def __init__(self):
        print '__init__'
        self.BASE_URL = 'http://linkedtv.eurecom.fr/api/mediacollector/search' #/RBB or /SV
        
    def search(self, s, provider):        
        s = '+'.join(s.split(' '))
        print '%s/%s/%s' % (self.BASE_URL, provider, s)
        cmd_arr = []
        cmd_arr.append('curl')        
        cmd_arr.append('%s/%s/%s' % (self.BASE_URL, provider, s))
        cmd_arr.append('-H')
        cmd_arr.append('Accept: application/json')        
        p1 = Popen(cmd_arr, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p1.communicate()
        if stdout:
            return stdout
        else:
            print stderr
            return None