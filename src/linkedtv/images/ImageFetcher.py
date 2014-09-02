import base64
from lxml import etree
import lxml
from subprocess import *
import urllib2
from PIL import Image
import StringIO
import urllib
import urlparse
import requests

"""
TODO soms werkt het niet goed met het teruggeven van de plaatjes... (kan de server het niet aan?)

OVER REQUESTS!!
    http://docs.python-requests.org/en/latest/user/advanced/#ssl-cert-verification

"""

class ImageFetcher():
    
    """This function returns image data from the Noterik image server
    @param id: the id of the mediaResource/video
    @param second: the desired timepoint from the mediaResource/video in seconds
    """
    def getNoterikThumbnailByMillis(self, millis, baseUrl):
        tt = self.millisToTimeTuple(millis)
        url = '%sh/%d/m/%d/sec%d.jpg' % (baseUrl, tt[0], tt[1], tt[2])            
        """Call the Noterik API and fetch the image"""
        try:
            u = urllib2.urlopen(url)
            #l = u.info()['Content-Length']
        except urllib2.HTTPError, e:
            print 'Error getting %s' % url
            print e
            return None
        except urllib2.URLError, u:
            print 'Error getting %s' % url
            print u
            return None
        
        """Read the image and resize it, so it is more suitable for the Editor tool UI"""
        x = u.read()
        img = Image.open(StringIO.StringIO(x))
        output = StringIO.StringIO()
        img = img.resize([105, 79])
        img.save(output, 'JPEG', quality=90)
        
        return output.getvalue()        
    
    """ TODO dit moet gefixed worden!!! irritant gedoe!"""
    def getEnrichmentThumb(self, url):
        o = urlparse.urlparse(url)
        print o                
        print '\n\n'
        url = '%s://%s%s%s' % (o.scheme, o.netloc, urllib.urlencode({'q' : o.path.encode('utf-8')})[2:].replace('%2F', '/'), urllib.urlencode({'q' : o.params})[2:])
        print url
        r = requests.get(url, verify=False)
        return r.content
    
    """This function converts an amount of seconds into a tuple (hours, minutes, seconds)"""
    def millisToTimeTuple(self, millis):
        if millis:            
            millis = int(millis)
            h = m = s = 0
            while millis >= 3600000:
                h += 1
                millis -= 3600000
            while millis >= 60000:
                m += 1
                millis -= 60000
            while millis >= 1000:
                s+= 1        
                millis -= 1000
            return (h, m, s)
        return None
