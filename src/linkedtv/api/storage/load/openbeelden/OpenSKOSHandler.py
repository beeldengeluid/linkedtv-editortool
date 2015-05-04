import json
import urllib2
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
        resp = self.http.sendRequest('%s/autocomplete/%s' % (self.OPENSKOS_API, text), params, 'GET')
        return resp

    def autoCompleteTable(self, text, conceptScheme = None, scopeNoteSearch = None, rows = 250):
        if(text and len(text) > 0):
            text = self.toLuceneFriendlyString(text)
            q = None
            queryScope = None
            s = self.toSearchString(text)
            if conceptScheme:
                if conceptScheme == 'http://data.beeldengeluid.nl/gtaa/Persoonsnamen' and 1 == 2:
                    queryScope = 'inScheme:"%s" OR inScheme:"%s"' % (conceptScheme, 'http://data.beeldengeluid.nl/gtaa/Maker')
                else:
                    queryScope = 'inScheme:"%s"' % conceptScheme
            if queryScope and queryScope.find('GTAA') == -1:
                if(scopeNoteSearch == 'true'):
                    q = '(LexicalLabelsText:%s^1.0  OR LexicalLabelsPhrase:%s^1.0 OR scopeNote:%s^0.5) AND (%s)' % (s, s, s, queryScope)
                else:
                    q = 'LexicalLabelsText:%s OR LexicalLabelsPhrase:%s AND (%s)' % (s, s, queryScope)
            else:
                if(scopeNoteSearch == 'true'):
                    q = '(LexicalLabelsText:%s^1.0 OR LexicalLabelsPhrase:%s^1.0 OR scopeNote:%s^0.5)' % (s, s, s)
                    # OR note:%s*^0.3 OR example:%s*^0.1
                else:
                    q = 'LexicalLabelsText:%s OR LexicalLabelsPhrase:%s' % (s, s)
            params = {'q' : q, 'format' : 'json', 'fl' : 'uri,prefLabel,scopeNote,inScheme', 'rows' : rows}
            #print q
            #,example,note,altLabel
            #resp = self.http.sendRequest('%s/find-concepts' % self.OPENSKOS_API, params, 'GET')
            resp = self.sendSearchRequest(params)
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
        return t.encode('utf-8')


    def sendSearchRequest(self, params):
        url = '%s/find-concepts' % self.OPENSKOS_API
        url_values = urllib.urlencode(params)
        full_url = url + '?' + url_values
        #print full_url
        resp = None
        try:
            respData = urllib2.urlopen(full_url)
            if respData:
                resp = respData.read()
        except HTTPError, he:
            print he
        return resp

    def toSearchString(self, s):
        if s:
            s = s.replace('+', ' ')
            if s[len(s) -1:len(s)] == ' ':
                s = s[0:len(s) -1]
        return s

    def toAutoCompleteResponseList(self, resultList):
        results = []
        for item in resultList:
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
                            schemes.append(self.GTAA_TYPE_MAPPINGS[s])
                        else:
                            #print 'Expired term? %s' %  s
                            schemes.append(self.NON_GTAA)
                    inSchemes = ' '.join(schemes)
                if item.has_key('note'):
                    notes.append(','.join(item['note']))
                if item.has_key('example'):
                    notes.append(','.join(item['example']))
                if item.has_key('scopeNote'):
                    notes.append(','.join(item['scopeNote']))
                    results.append({'value': uri, 'label' : '%s [%s] (%s)' % (prefLabel, inSchemes, ' | '.join(notes))})
        return results

