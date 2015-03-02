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
	euspace : null,

	trial : null

}

var rbbConfig = {
	lang : 'de',
	entityExpansion : true,
	loadGroundTruth : false,
	platform : 'linkedtv',
	logUserActions : true,
	synchronization : {
		syncOnLoad : true,
		syncOnSave : true,
		platform : 'LinkedTVSOLR'
	},
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
			id : 'irapi_1',
			label : 'Hintergrund',
			linkedtvDimension : 'Background',
			service : {
				id : 'IRAPI',
				class : 'linkedtv.api.dimension.ltv.IRAPI',
				params : {
					domain : 'RBB'
				}
			}
		},
		{
			id : 'solr_1',
			label : 'Aktuelle RBB-Videos',
			linkedtvDimension : 'RelatedChapter',
			service : {
				id : 'RelatedChapterEnricher',
				class : 'linkedtv.api.dimension.ltv.RelatedChapterEnricher',
				params : {
					provider : 'rbb',
					curatedOnly : false,
					sillyHack : true
				}
			}
		}
	]
};

var tkkConfig = {
	lang : 'nl',
	entityExpansion : false,
	loadGroundTruth : true,
	platform : 'linkedtv',
	logUserActions : true,
	synchronization : {
		syncOnLoad : true,
		syncOnSave : true,
		platform : 'LinkedTVSOLR'
	},
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
				id : 'IRAPI',
				class : 'linkedtv.api.dimension.ltv.IRAPI',
				params : {
					domain : 'SV'
				}
			}
		},
		{
			id : 'tve_2',
			label : 'Related Art Work',
			linkedtvDimension : 'RelatedArtWork',
			service : {
				id : 'EuropeanaAPI',
				class : 'linkedtv.api.dimension.public.EuropeanaAPI',
				params : {
					//queryParts : ['COUNTRY:netherlands']
				}
			}
		},
		{
			id : 'tve_3',
			label : 'Related Chapters',
			linkedtvDimension : 'RelatedChapter',
			service : {
				id : 'RelatedChapterEnricher',
				class : 'linkedtv.api.dimension.ltv.RelatedChapterEnricher',
				params : {
					provider : 'sv',
					curatedOnly : true
				}
			}
		}
	]
};

var europeanaSpaceConfig = {
	lang : 'de',
	entityExpansion : false,
	loadGroundTruth : false,
	platform : 'europeanaspace',
	logUserActions : false,
	synchronization : false,
	dimensions : [
		{
			id : 'maintopic',
			label : 'About',
			linkedtvDimension : 'InDepth',
			service : {
				id :'informationCards',
				params : {
					vocabulary : 'DBpedia'
				}
			}
		},
		{
			id : 'tve_2',
			label : 'Related Europeana links',
			linkedtvDimension : 'Background',
			service : {
				id : 'EuropeanaAPI',
				class : 'linkedtv.api.dimension.public.EuropeanaAPI',
				params : {
					//queryParts : ['COUNTRY:netherlands']
					rights : ['sa', 'open', 'nc']
				}
			}
		},
		{
			id : 'tve_3',
			label : 'Related Videos',
			linkedtvDimension : 'RelatedChapter',
			service : {
				id : 'ESRelatedVideoEnricher',
				class : 'linkedtv.api.dimension.europeanaspace.ESRelatedVideoEnricher',
				params : {
					provider : 'rbb'
				}
			}
		}
	]
}

var trialConfig = {
	lang : 'nl',
	entityExpansion : false,
	loadGroundTruth : false,
	platform : 'linkedtv',
	logUserActions : false,
	synchronization : false,
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
				id : 'TvEnricher',
				class : 'linkedtv.api.dimension.ltv.TvEnricher'
			}
		},
		{
			id : 'anefo_1',
			label : 'Related photos',
			linkedtvDimension : 'Background',
			service : {
				id : 'AnefoAPI',
				class : 'linkedtv.api.dimension.public.AnefoAPI'
			}
		}
	]
}

//specific config for each television program / content provider
var programmeConfigs = {
	sv : tkkConfig,
	rbb : rbbConfig,
	euspace : europeanaSpaceConfig,
	trial : trialConfig
}

//main config
var config = angular.module('configuration', []).constant('conf', {
	loadingImage : '/site_media/images/loading.gif'
});
