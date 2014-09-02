//TODO properly import the programme configs from an external file
//TODO add templates for partner specific information cards

var rbbConfig = {
	dimensions : [
		{		
		'id' : 'opinion',
		'label' : 'Opinion',
		'service' : 'TVNewsEnricher',
		'output' : 'object'
		},
		{		
		'id' : 'othermedia',
		'label' : 'Other media',
		'service' : 'TVNewsEnricher',
		'output' : 'object'
		},
		{		
		'id' : 'timeline',
		'label' : 'Timeline',
		'service' : 'TVNewsEnricher',
		'output' : 'object'
		},
		{		
		'id' : 'indepth',
		'label' : 'In depth',
		'service' : 'TVNewsEnricher',
		'output' : 'object'
		},
		{		
		'id' : 'tweets',
		'label' : 'Tweets',
		'service' : 'TVNewsEnricher',
		'output' : 'object'
		},
		{
		'id' : 'Solr',
		'label' : 'Related news',
		'service' : 'TVEnricher',
		'output' : 'literal'
		},
	]
};

var tkkConfig = {
	dimensions : [
		{
		'id' : 'SV',
		'label' : 'Background information',
		'service' : 'TVEnricher',
		'output' : 'object'
		},
		{
		'id' : 'Europeana',
		'label' : 'Related Europeana objects',
		'service' : 'TVEnricher',
		'output' : 'object'
		},
		{
		'id' : 'Solr',
		'label' : 'Related fragments',
		'service' : 'TVEnricher',
		'output' : 'literal'
		}
	]
};

//make sure to map this to the provider part in the ET URL
var programmeConfigs = {
	'sv' : tkkConfig,
	'rbb' : rbbConfig
}


var config = angular.module('configuration', []).constant('conf', {
	languageMap : {'rbb' : 'de', 'sv' : 'nl'},
	chapterSlotsMap : {'rbb' : 8, 'sv' : 6},
	loadingImage : '/site_media/images/loading.gif'	
});	