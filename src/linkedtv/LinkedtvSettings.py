from django.conf import settings

LTV_API_ENDPOINT = getattr(settings, 'LTV_API_ENDPOINT', 'yourlinkedtvinstallation')
LTV_SPARQL_ENDPOINT = getattr(settings, 'LTV_SPARQL_ENDPOINT', 'yoursparqlendpoint')
LTV_SAVE_GRAPH = getattr(settings, 'LTV_SAVE_GRAPH', 'yourgraph')
LTV_DBPEDIA_PROXY = getattr(settings, 'LTV_DBPEDIA_PROXY', 'yourentityproxy')
LTV_STOP_FILE = getattr(settings, 'LTV_STOP_FILE', 'yourstopwordfile')

LTV_SOLR_INDEX = getattr(settings, 'LTV_SOLR_INDEX', {
	'host' : 'yoursolr',
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
	'output-csv' : 'your.csv'
})

LTV_GROUND_TRUTH = getattr(settings, 'LTV_GROUND_TRUTH', {
	'id' : 'TKKChapters',
	'chapters' : 'your.xlsx',
	'redis-host' : 'localhost',
	'redis-port' : 6379,
	'redis-db' : 8
})

LTV_PLATFORM_LOGIN = getattr(settings, 'LTV_PLATFORM_LOGIN', {
	'user' : 'login',
	'password' : 'login'
})

LTV_EUROPEANA = getattr(settings, 'LTV_EUROPEANA', {
	'apikey' : 'yourkey'
})

LTV_ES_SETTINGS = getattr(settings, 'LTV_ES_SETTINGS', {
	'host' : 'host',
	'port' : 9200
})
