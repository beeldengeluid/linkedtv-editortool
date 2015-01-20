from django.conf import settings

LTV_API_ENDPOINT = getattr(settings, 'LTV_API_ENDPOINT', 'http://api.linkedtv.eu')
LTV_SPARQL_ENDPOINT = getattr(settings, 'LTV_SPARQL_ENDPOINT', 'http://data.linkedtv.eu/sparql')
LTV_SAVE_GRAPH = getattr(settings, 'LTV_SAVE_GRAPH', 'http://data.linkedtv.eu/graph/et_v2')
LTV_DBPEDIA_PROXY = getattr(settings, 'LTV_DBPEDIA_PROXY', 'http://linkedtv.project.cwi.nl/explore/entity_proxy')
LTV_STOP_FILE = getattr(settings, 'LTV_STOP_FILE', '/Users/jblom/workspace/linkedtv-et-v2/resources/stoplist_tno.tab')

LTV_SOLR_INDEX = getattr(settings, 'LTV_SOLR_INDEX', {
	'host' : 'data.linkedtv.eu',
	'port' : 8983
})

LTV_REDIS_SETTINGS = getattr(settings, 'LTV_REDIS_SETTINGS', {
	'host' : 'localhost',
	'port' : 6379,
	'db' : 0
})

LTV_LOGGING_SETTINGS = getattr(settings, 'LTV_LOGGING_SETTINGS', {
	'redis-host' : 'localhost',
	'redis-port' : 6379,
	'redis-db' : 9,
	'output-csv' : '/Users/jblom/temp/linkedtv-user-log.csv'
})

LTV_PLATFORM_LOGIN = getattr(settings, 'LTV_PLATFORM_LOGIN', {
	'user' : 'admin',
	'password' :
	'linkedtv'
})

LTV_EUROPEANA = getattr(settings, 'LTV_EUROPEANA', {
	'apikey' : '1hfhGH67Jhs'
})