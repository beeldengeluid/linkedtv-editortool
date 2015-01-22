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
				{key : 'description', type : 'literal', optional : true},
				{key : 'type', type: 'entity', optional : true},
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
	entityExpansion : true,
	loadGroundTruth : false,
	dimensions : [
		{
			id : 'maintopic',//check this
			label : 'Mehr Zu',
			linkedtvDimension : 'InDepth',
			service : {
				id :'informationCards',
				params : {
					vocabulary : 'DBpedia'
				}
			}
		},
		{
			id : 'tvne_1',
			label : 'Aktuell',
			linkedtvDimension : 'CurrentEvents',
			service : {
				id : 'TvNewsEnricher',
				params : {
					dimension : 'othermedia',
					periodInDays : 7,
					endDate : '$VIDEO_DATE'
				}
			}
		},
		{
			id : 'tvne_2',
			label : 'Hintergrund',
			linkedtvDimension : 'Background',
			service : {
				id : 'TvNewsEnricher',
				params : {
					dimension : 'othermedia',
					periodInDays : 365 * 10,//search for events in the last 10 years
					endDate : '$VIDEO_DATE'
				}
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
		{
			id : 'tve_2',
			label : 'Andere Medien',
			linkedtvDimension : 'OtherMedia',
			service : {
				id : 'TvEnricher',
				params : {
					dimension : 'RBB'//+ current date
				}
			}
		}
	]
};

var tkkConfig = {
	entityExpansion : false,
	loadGroundTruth : true,
	dimensions : [
		{
			id : 'maintopic',//check this
			label : 'About',
			linkedtvDimension : 'ArtObject',
			service : {
				id :'informationCards',
				params : {
					vocabulary : 'DBpedia'
				}
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
				id : 'EuropeanaAPI',
				params : {
					queryParts : ['COUNTRY:netherlands']
				}
			}
		},
		{
			id : 'tve_3',
			label : 'Related Chapters',
			linkedtvDimension : 'RelatedChapter',
			service : {
				id : 'RelatedChapterEnricher',
				params : {
					provider : 'sv'
				}
			}
		},
		{
			id : 'anefo_1',
			label : 'Related photos',
			linkedtvDimension : 'RelatedArtWork',
			service : {
				id : 'AnefoAPI'
			}
		}
	]
};

var trialConfig = {
	entityExpansion : false,
	loadGroundTruth : false,
	dimensions : [
		{
			id : 'maintopic',
			label : 'Main Topics',
			linkedtvDimension : 'Background',
			service : {
				id : 'informationCards',
				params : {
					vocabulary : 'DBpedia'
				}
			}
		},
		{
			id : 'freshMedia',
			label : 'Background Information',
			linkedtvDimension : 'Background',
			service : {
				id : 'TvEnricher'
			}
		},
		{
			id : 'anefo_1',
			label : 'Related photos',
			linkedtvDimension : 'Background',
			service : {
				id : 'AnefoAPI'
			}
		}
	]
}

var programmeConfigs = {
	sv : tkkConfig,
	rbb : rbbConfig,
	trial : trialConfig
}

var config = angular.module('configuration', []).constant('conf', {
	languageMap : {'rbb' : 'de', 'sv' : 'nl'},
	loadingImage : '/site_media/images/loading.gif',
	platform : 'linkedtv',
	logUserActions : true,
	syncLinkedTVChapters : true
});
