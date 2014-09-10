//TODO properly import the programme configs from an external file
//RBB types => http://www.linkedtv.eu/wiki/index.php/Annotation_types_in_RBB#Proposal_for_common_entity_types
//TKK types => http://www.linkedtv.eu/wiki/index.php/Creating_rich_descriptions_of_cultural_artefacts_out_of_a_TV_program

//FIXME this is not used yet
var informationCardTemplates = {
	rbb : [//FIXME the RBB types are directly taken from the DBpedia types
		{ 
			label : 'Film',			
			properties : ['Cinematography', 'Director',
				'Music composer', 'Starring']
		},
		{ 
			label : 'Organization',			
			properties : ['Chairman', 'Focus',
				'Formation year', 'Founder',
				'Founding year', 'industry',
				'Location', 'City',
				'Number of employees', 'Founding date']
		},
		{
			label : 'Political party',		
			properties : ['Headquarters', 'Second leader',
				'Orientation', 'General director',
				'EU parlement', 'Founding date', 
				'Founding location', 'Chairman']
		},
		{
			label : 'Politicians and other office holders',			
			properties : ['Active since', 'Active till', 
				'Office', 'Party', 'Before',
				'After']
		},
		{
			label : 'Places',			
			properties : ['Owner', 'Opening', 
				'Stand place', 'Architect', 
				'Builder', 'Building year', 
				'Style', 'Place', 
				'Leader', 'Title of leader', 
				'Unemployment rate', 'Foreign immigrants',
				'Party']
		}
	],

	sv : [
		{
			label : 'Art object',
			properties : ['Creator', 'Styles', 'Period', 'Materials', 'Container']
		},
		{
			label : 'Person/artist/creator',
			properties : ['Name', 'Description', 'Profession', 'Birth place', 'Death place', 'Born', 'Deceased']
		}
	]

}

var rbbConfig = {
	dimensions : [
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
		'id' : 'Europeana',//TODO add some service specific params here
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

//make sure to map this to the provider part in the ET URL
var programmeConfigs = {
	sv : tkkConfig,
	rbb : rbbConfig
}


var config = angular.module('configuration', []).constant('conf', {
	languageMap : {'rbb' : 'de', 'sv' : 'nl'},
	chapterSlotsMap : {'rbb' : 8, 'sv' : 6},
	loadingImage : '/site_media/images/loading.gif'	
});	