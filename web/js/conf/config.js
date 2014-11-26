/*
TODO:
	- properly import the programme configs from an external file
	- make sure there is a separate property that directly maps to the RDF dimension

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
				{key : 'description', type : 'literal', optional : true},
				{key : 'type', type: 'literal', optional : true},
				{key : 'creator', type : 'entity', optional : true},
				{key : 'creation location', type : 'entity', optional : true},
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
		{
			id : 'maintopic',//check this
			label : 'Mehr Zu',
			linkedtvDimension : 'InDepth',
			service : {
				id :'informationCards'
			}
		},
		{
			id : 'tve_1',
			label : 'Related RBB News',
			linkedtvDimension : 'RelatedChapter',
			service : {
				id :'TvEnricher',
				params : {
					dimension : 'Solr',
					index : 'RBB',
					granularity : 'Chapter'
				}
			}
		},
		{//AKTUELL
			id : 'tve_2',
			label : 'Aktuell (1)',
			linkedtvDimension : 'CurrentEvents',
			service : {
				id : 'TvEnricher',
				params : {
					dimension : 'RBB'//+ current date
				}
			}
		},
		{
			id : 'tvne_1',
			label : 'Aktuell (2)',
			linkedtvDimension : 'CurrentEvents',
			service : {
				id : 'TvNewsEnricher',
				params : {
					dimension : 'othermedia',//+ current date
					periodInDays : 7,
					endDate : '$VIDEO_DATE'
				}
			}
		},
		{//HISTORY
			id : 'tve_3',
			label : 'Hintergrund (1)',
			linkedtvDimension : 'History',
			service : {
				id :'TvEnricher',
				params : {
					dimension : 'RBB' //+ current date
				}
			}
		},
		{
			id : 'tvne_2',
			label : 'Hintergrund (2)',
			linkedtvDimension : 'History',
			service : {
				id : 'TvNewsEnricher',
				params : {
					dimension : 'othermedia',//+ current date
					periodInDays : 365 * 10,//search for events in the last 10 years
					endDate : '$VIDEO_DATE'
				}
			}
		}
	]
};

var tkkConfig = {
	dimensions : [
		{
			id : 'maintopic',//check this
			label : 'About',
			linkedtvDimension : 'ArtObject',
			service : {
				id :'informationCards'
			}
		},
		{
			id : 'tve_1',
			label : 'Background',
			linkedtvDimension : 'Background',
			service : {
				id : 'TvEnricher',
				params : {
					dimension : 'SV'
				}
			}
		},
		{
			id : 'tve_2',
			label : 'Related Art Work',
			linkedtvDimension : 'RelatedArtWork',
			service : {
				id : 'TvEnricher',
				params : {
					dimension : 'Europeana'
				}
			}
		},
		{
			id : 'tve_3',
			label : 'Related Chapters',
			linkedtvDimension : 'RelatedChapter',
			service : {
				id : 'TvEnricher',
				params : {
					dimension : 'Solr',
					index : 'SV',
					granularity : 'Chapter'
				}
			}
		}
	]
};

var trialConfig = {
	dimensions : [
		{
			id : 'maintopic',
			label : 'Main Topics',
			linkedtvDimension : 'Background',
			service : {
				id : 'informationCards'
			}
		},
		{
			id : 'freshMedia',
			label : 'Background Information',
			linkedtvDimension : 'Background',
			service : {
				id : 'TvEnricher'
			}
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