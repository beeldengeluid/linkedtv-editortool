//TODO properly import the programme configs from an external file
//TODO add templates for partner specific information cards

var rbbConfig = {
	dimensions : [
		{		
		'label' : 'Background information',
		'service' : 'TVNewsEnricher',
		'input' : 'entities'
		},
		{
		'label' : 'Opinions',
		'service' : 'TVNewsEnricher',
		'input' : 'entities'
		},
		{
		'label' : 'In depth',
		'service' : 'TVNewsEnricher',
		'input' : 'entities'
		},
		{
		'label' : 'Global to local',
		'service' : 'TVNewsEnricher',
		'input' : 'entities'
		},
		{
		'label' : 'Related news',
		'service' : 'TVNewsEnricher',
		'input' : 'entities'
		},
	]
};

var tkkConfig = {
	dimensions : [
		{
		'label' : 'Background information',
		'service' : 'TVEnricher',
		'input' : 'entities'
		},
		{
		'label' : 'Related Europeana objects',
		'service' : 'TVEnricher',
		'input' : 'entities'
		},
		{
		'label' : 'Related fragments',
		'service' : 'TVEnricher',
		'input' : 'entities'
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