//TODO properly import the programme configs from an external file
//TODO add templates for partner specific information cards

var rbbConfig = {
	dimensions : [
		{		
		'id' : 'RBB',
		'label' : 'Background information',		
		'output' : 'object'
		},
		{
		'id' : 'Solr',
		'label' : 'Related news',
		'output' : 'literal'
		},
	]
};

var tkkConfig = {
	dimensions : [
		{
		'id' : 'SV',
		'label' : 'Background information',		
		'output' : 'object'
		},
		{
		'id' : 'Europeana',
		'label' : 'Related Europeana objects',		
		'output' : 'object'
		},
		{
		'id' : 'Solr',
		'label' : 'Related fragments',
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