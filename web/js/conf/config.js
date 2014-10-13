/*
TODO:
	- properly import the programme configs from an external file

READ:	
	- RBB types => http://www.linkedtv.eu/wiki/index.php/Annotation_types_in_RBB#Proposal_for_common_entity_types
	- TKK types => http://www.linkedtv.eu/wiki/index.php/Creating_rich_descriptions_of_cultural_artefacts_out_of_a_TV_program
*/

var informationCardTemplates = {

	//FIXME the RBB types are directly taken from the DBpedia types
	rbb : [
		{ 
			label : 'Film',			
			properties : [
				{key : 'label', type: 'literal', optional : false},
				{key : 'genre', type: 'entity', optional : true},
				{key : 'director', type: 'entity', optional : true},
				{key : 'cinematographor', type: 'entity', optional : true},
				{key : 'music composer', type: 'entity', optional : true},
				{key : 'starring', type: 'entity', optional : true}
			]
		},
		{ 
			label : 'Organization',			
			properties : [
				{key : 'label', type: 'literal', optional : false},
				{key : 'founder', type: 'entity', optional : false},
				{key : 'chairman', type: 'entity', optional : false},
				{key : 'city', type: 'entity', optional : false},
				{key : 'type of industry', type: 'literal', optional : false},
				{key : 'founding date', type: 'entity', optional : false},
				{key : 'founding location', type: 'entity', optional : false},
				{key : 'number of employees', type: 'literal', optional : false}
			]	
		},
		{
			label : 'Political party',
			properties : [
				{key : 'label', type: 'literal', optional : false},
				{key : 'orientation', type: 'entity', optional : false},
				{key : 'general director', type: 'entity', optional : false},
				{key : 'chairman', type: 'entity', optional : false},
				{key : 'founding date', type: 'literal', optional : false},
				{key : 'founding location', type: 'entity', optional : false}
			]
		},
		{
			label : 'Politicians and other office holders',
			properties : [
				{key : 'label', type: 'literal', optional : false},
				{key : 'party', type: 'entity', optional : false},
				{key : 'active since', type: 'literal', optional : false},
				{key : 'active till', type: 'literal', optional : false}				
			]
		},
		{
			label : 'Places',
			properties : [
				{key : 'label', type: 'literal', optional : false},
				{key : 'founding date', type: 'literal', optional : false},
				{key : 'population', type: 'literal', optional : false},
				{key : 'capital city', type: 'entity', optional : false}
			]
		}
	],

	sv : [		
		{
			label : 'Art object',
			properties : [
				{key : 'label', type: 'literal', optional : false},
				{key : 'description', type : 'literal', optional : false},
				{key : 'creator', type : 'entity', optional : true},
				{key : 'period', type : 'entity', optional : true},
				{key : 'material', type : 'entity', optional : true},
				{key : 'style', type : 'entity', optional : true},
			]
		}
	],

	trial : null

}

var rbbConfig = {
	dimensions : [
		{//temporary
		'id' : 'maintopic',
		'label' : 'Information cards',
		'service' : 'informationCards'
		},
		{
		'id' : 'opinion',
		'label' : 'Opinion',
		'service' : 'TvNewsEnricher'
		},		
		{		
		'id' : 'othermedia',
		'label' : 'Other media',
		'service' : 'TvNewsEnricher'
		},
		{		
		'id' : 'timeline',
		'label' : 'Timeline',
		'service' : 'TvNewsEnricher'
		},
		{		
		'id' : 'indepth',
		'label' : 'In depth',
		'service' : 'TvNewsEnricher'
		},
		{
		'id' : 'tweets',
		'label' : 'Tweets',
		'service' : 'TvNewsEnricher'
		},
		{
		'id' : 'related',
		'label' : 'Related news',
		'service' : 'TvEnricher'
		},
	]
};

var tkkConfig = {
	dimensions : [
		{
		'id' : 'maintopic',
		'label' : 'The art object',
		'service' : 'informationCards'
		},
		{
		'id' : 'SV',
		'label' : 'Background information',
		'service' : 'TvEnricher'
		},
		{
		'id' : 'Europeana',
		'label' : 'Related Europeana objects',
		'service' : 'TvEnricher'
		},
		{
		'id' : 'Solr',
		'label' : 'Related fragments',
		'service' : 'TvEnricher'
		}
	]
};

var trialConfig = {
	dimensions : [
		{
		'id' : 'maintopic',
		'label' : 'Main topics',
		'service' : 'informationCards'
		},
		{
		'id' : 'freshMedia',
		'label' : 'Background information',
		'service' : 'TvEnricher'
		}
	]
}

//make sure to map this to the provider part in the ET URL
var programmeConfigs = {
	sv : tkkConfig,
	rbb : rbbConfig,
	trial : trialConfig
}


var config = angular.module('configuration', []).constant('conf', {
	languageMap : {'rbb' : 'de', 'sv' : 'nl'},
	chapterSlotsMap : {'rbb' : 8, 'sv' : 6},
	loadingImage : '/site_media/images/loading.gif'	
});	