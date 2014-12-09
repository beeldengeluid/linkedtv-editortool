import json
import urllib2
import httplib2
import urllib
from subprocess import *
from django.conf import settings

"""
VOORBEELD REQUESTS:
    http://production.openskos.beeldengeluid.nl.pictura-dp.nl/api/find-concepts?q=kerk*&format=json&fl=prefLabel,scopeNote,inScheme
    http://production.openskos.beeldengeluid.nl.pictura-dp.nl/api/find-concepts?q=prefLabelText:stichting*&format=json&fl=prefLabel,scopeNote,inScheme
    http://production.openskos.beeldengeluid.nl.pictura-dp.nl/api/find-concepts?q=LexicalLabelsText:stichting*&format=json&fl=prefLabel,scopeNote,inScheme

ALS DE LIJST GROOT IS
    http://stackoverflow.com/questions/5073612/jquery-ui-autocomplete-combobox-very-slow-with-large-select-lists
"""

class OpenSKOSHandler():

    def __init__(self):
        print ' -- Initializing OpenSKOSHandler -- '
        self.name = 'openskos'
        #self.OPENSKOS_API = 'http://openskos.org/api'
        self.OPENSKOS_API = 'http://openskos.beeldengeluid.nl/api'
        self.GTAA_TYPE_MAPPINGS = {'http://data.beeldengeluid.nl/gtaa/GeografischeNamen' : 'Geografisch', 'http://data.beeldengeluid.nl/gtaa/Namen' : 'Naam',
                'http://data.beeldengeluid.nl/gtaa/Persoonsnamen' : 'Persoon', 'http://data.beeldengeluid.nl/gtaa/OnderwerpenBenG' : 'B&G Onderwerp',
                'http://data.beeldengeluid.nl/gtaa/Onderwerpen' : 'Onderwerp', 'http://data.beeldengeluid.nl/gtaa/Maker' : 'Maker',
                'http://data.beeldengeluid.nl/gtaa/Genre' : 'Genre', 'http://data.beeldengeluid.nl/gtaa/GTAA' : ''};
        self.NON_GTAA = 'Vervallen/extern'

    def autoComplete(self, text):
        if text == None:
            return None
        params = {'lang' : 'nl'}
        resp = self.http.__sendRequest('%s/autocomplete/%s' % (self.OPENSKOS_API, text), params, 'GET')
        return resp

    def autoCompleteTable(self, text, conceptScheme = None, scopeNoteSearch = None, rows = 250):
        if(text and len(text) > 0):
            text = self.toLuceneFriendlyString(text)
            q = None
            queryScope = None
            s = self.toSearchString(text)
            if conceptScheme:
                if conceptScheme == 'http://data.beeldengeluid.nl/gtaa/Persoonsnamen':
                    queryScope = 'inScheme:"%s" OR inScheme:"%s"' % (conceptScheme, 'http://data.beeldengeluid.nl/gtaa/Maker')
                else:
                    queryScope = 'inScheme:"%s"' % conceptScheme
            if queryScope and queryScope.find('GTAA') == -1:
                if(scopeNoteSearch == 'true'):
                    q = '(LexicalLabelsText:%s*^1.0  OR LexicalLabelsPhrase:%s*^1.0 OR scopeNoteText:%s^0.5) AND (%s)' % (s, s, s, queryScope)
                    # OR note:%s*^0.3 OR example:%s*^0.1
                else:
                    q = 'LexicalLabelsText:%s* OR LexicalLabelsPhrase:%s* AND (%s)' % (s, s, queryScope)
            else:
                if(scopeNoteSearch == 'true'):
                    q = '(LexicalLabelsText:%s*^1.0 OR LexicalLabelsPhrase:%s*^1.0 OR scopeNoteText:%s^0.5)' % (s, s, s)
                    # OR note:%s*^0.3 OR example:%s*^0.1
                else:
                    q = 'LexicalLabelsText:%s* OR LexicalLabelsPhrase:%s*' % (s, s)
            params = {'q' : q, 'format' : 'json', 'fl' : 'uri,prefLabel,scopeNote,inScheme', 'rows' : rows, 'set' : 'beng:gtaa'}
            #print q
            #,example,note,altLabel
            #resp = self.http.__sendRequest('%s/find-concepts' % self.OPENSKOS_API, params, 'GET')
            resp = self.__sendSearchRequest(params)
            try:
                cd = json.loads(resp)
            except ValueError, e:
                print e
                return json.dumps({'error': 'ValueError'})
            except TypeError, e:
                return json.dumps({'error': 'TypeError'})
            if cd:
                try:
                    numFound = cd['response']['numFound']
                    cd = cd['response']['docs']
                    resp = self.toAutoCompleteResponseList(cd)
                    #return json.dumps(resp)
                    return resp
                except KeyError, ke:
                    print ke
                    print 'autocomplete KeyError'
                except ValueError, ve:
                    print ve
                    print 'autocomplete ValueError'
        return json.dumps({'error' : 'Could not find anything'})

    def toLuceneFriendlyString(self, s):
        specialChars = ['+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\']
        t = s
        if t:
            for c in specialChars:
                if s.find(c) != -1:
                    t = t.replace(c, '\%s' % c)
        return t

    """
    def sendSearchRequest(self, params):
        url = '%s/find-concepts' % self.OPENSKOS_API
        url_values = urllib.urlencode(params)
        full_url = url + '?' + url_values
        print full_url
        respData = urllib2.urlopen(full_url)
        resp = respData.read()
        return resp
    """

    def __sendSearchRequest(self, params):
        http = httplib2.Http()
        url = '%s/find-concepts' % self.OPENSKOS_API
        url_values = urllib.urlencode(params)
        url = url + '?' + url_values
        if url:
            headers = {'Accept':'application/json'}
            resp, content = http.request(url, 'GET', headers=headers)
            if content:
                return content
        return None

    def toSearchString(self, s):
        if s:
            s = s.replace('+', ' ')
            if s[len(s) -1:len(s)] == ' ':
                s = s[0:len(s) -1]
        return s

    def toAutoCompleteResponseList(self, resultList):
        results = []
        for item in resultList:
            correctScheme = True
            uri = prefLabel = inSchemes = ''
            notes = []
            if item.has_key('uri'):
                uri = item['uri']
                if item.has_key('prefLabel'):
                    prefLabel = ' '.join(item['prefLabel'])
                if item.has_key('inScheme'):
                    schemes = []
                    for s in item['inScheme']:
                        if self.GTAA_TYPE_MAPPINGS.has_key(s):
                            if s == 'http://data.beeldengeluid.nl/gtaa/OnderwerpenBenG':
                                correctScheme = False
                                break
                            schemes.append(self.GTAA_TYPE_MAPPINGS[s])
                        else:
                            correctScheme = False
                            schemes.append(self.NON_GTAA)
                            break
                    inSchemes = ' '.join(schemes)
                if item.has_key('note'):
                    notes.append(','.join(item['note']))
                if item.has_key('example'):
                    notes.append(','.join(item['example']))
                if item.has_key('scopeNote'):
                    notes.append(','.join(item['scopeNote']))

                """Don't add results if it's a person without a scope note. The rest will be added"""
                if not (inSchemes.find('Persoon') != -1 and not item.has_key('scopeNote')) :
                    if(correctScheme):
                        results.append({'value': uri, 'label' : '%s|%s|%s' % (prefLabel, inSchemes, ' '.join(notes))})
        return results

    def getConceptDetails(self, prefLabel, format='json'):
        if prefLabel == None:
            return None
        params = {'q' : '"%s"' % prefLabel, 'format' : format}#, 'fl' : 'uri'
        print 'Getting concept details for: %s' % prefLabel
        resp = self.http.__sendRequest('%s/find-concepts' % self.OPENSKOS_API, params, 'GET')
        return resp

    def findConcepts(self, q, format = 'json'):
        if q == None:
            return None
        params = {'q' : q, 'format' : format}
        resp = self.http.__sendRequest('%s/find-concepts' % self.OPENSKOS_API, params, 'GET')
        return resp

    """
    GEZOCHT OP docent
    {u'response':
    {u'start': 0, u'maxScore': 12.439527999999999, u'numFound': 2, u'docs':
     [
     {u'xmlns': [u'skos', u'rdf'],
      u'uuid': u'64104a42-87ec-5803-b7a9-47240e95f2f9',
      u'deleted': False,
      u'timestamp': u'2012-04-02T07:11:33.931Z',
      u'uri': u'http://service.aat-ned.nl/skos/1000281267',
      u'collection': 5,
      u'LexicalLabels': [u'docent'],
      u'score': 12.439527999999999,
      u'LexicalLabels@en-US': [u'docent'],
      u'prefLabel': [u'docent'],
      u'prefLabel@en-US': [u'docent'],
      u'inScheme': [u'http://service.aat-ned.nl/'],
      u'class': u'Concept',
      u'tenant': u'rkd'}
      ,
     {u'xmlns': [u'skos', u'rdf'],
      u'uuid': u'4c7b704b-aff0-ed4c-f02f-1114d7348480',
      u'deleted': False,
      u'timestamp': u'2012-04-02T07:11:33.931Z',
      u'uri': u'http://service.aat-ned.nl/skos/1000281265',
      u'collection': 5,
      u'LexicalLabels':[u"docent's"],
      u'score': 12.439527999999999,
      u'LexicalLabels@en-US': [u"docent's"],
      u'prefLabel': [u"docent's"],
      u'prefLabel@en-US': [u"docent's"],
      u'inScheme': [u'http://service.aat-ned.nl/'],
      u'class': u'Concept',
      u'tenant': u'rkd'
     }]
     }
     }

    """

    def fetchEntities(self, input):
        if input is None:
            return None
        nes = []
        #loop through the words in the input waarom
        for s in input:
            c = self.findConcepts(s)
            entity = None
            inScheme = None
            label = None
            uri = None
            score = None
            if c != None and c != '':
                #print 'results for search: %s\n' % s
                try:
                    obj = json.loads(c, 'utf-8')
                    if u'response' in obj and len(obj) > 0  :
                        if u'docs' in obj[u'response'] and u'numFound' in obj[u'response']:
                            if int(obj[u'response'][u'numFound']) > 0:
                                #print 'Found results:\n'
                                for res in obj[u'response'][u'docs']:
                                    #print res
                                    #print '---------------\n'
                                    if u'LexicalLabels' in res:
                                        #TODO alle labels zijn mogelijk interessant
                                        label = res[u'LexicalLabels'][0]
                                    if u'uri' in res:
                                        uri = res[u'uri']
                                    if u'inScheme' in res:
                                        inScheme = res[u'inScheme']
                                    if u'score' in res:
                                        score = res[u'score']
                                    if self.disambiguate(s, label):
                                        entity = {
                                            'text' : label,
                                            'originalText' : s,
                                            'type' : inScheme,
                                            'url' : uri ,
                                            'time' : None,
                                            'score' : score,
                                            'count' : 1
                                        }
                                        nes.append(entity)
                                        break
                                    else:
                                        """ blijf net zolang zoeken tot het niet meer ambigu is """
                                        print 'AMBIGUOUS: %s != %s' % (s, label)
                                        pass
                except KeyError, e:
                    print 'KeyError'
                except TypeError, e:
                    print 'TypeError'
                except ValueError, e:
                    print 'ValueError'
                print '\n'
                print '%' * 100
        return nes

    def disambiguate(self, originalText, resultingText):
        """o_arr = originalText.split(' ')
        r_arr = resultingText.split(' ')
        return len(o_arr) == len(r_arr)
        """
        return originalText.lower() == resultingText.lower()
