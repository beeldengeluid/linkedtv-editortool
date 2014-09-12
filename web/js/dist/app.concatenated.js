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
		{//temporary
		'id' : 'maintopic',
		'label' : 'The art object',
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
});	;var linkedtv = angular.module('linkedtv', ['ngRoute', 'ui.bootstrap', 'configuration']);

linkedtv.run(function($rootScope, conf) {

	var urlParts = window.location.pathname.split('/');	
	
	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 2) {
		$rootScope.provider = urlParts[1];		
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
		conf.templates = informationCardTemplates[$rootScope.provider];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.resourceUri = urlParts[2];
	}

	/*
	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
   });*/
});;angular.module('linkedtv').factory('enrichmentUtils', ['$modal', 'chapterCollection', function($modal, chapterCollection) {

	function openMultipleLinkDialog(dimension) {
		console.debug(dimension);
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/multipleLinkModal.html',
			controller: 'multipleLinkModalController',
			size: 'lg',
			resolve: {
				dimension: function () {
					return dimension;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (data) {
			console.debug('I saved some enrichments');
			var activeChapter = chapterCollection.getActiveChapter();
			activeChapter.dimensions[data.dimension.id] = data.enrichments;
			
			//update the chapter collection
			chapterCollection.saveChapter(activeChapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	function openLinkDialog(dimension, link) {
		console.debug(dimension);
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/linkModal.html',
			controller: 'linkModalController',
			size: 'lg',
			resolve: {
				dimension: function () {
					return dimension;
				},
				link: function() {
					return link;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (data) {
			console.debug('I saved a link');
			console.debug(data);
			chapterCollection.saveChapterLink(data.dimension, data.link);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	function openCardDialog(dimension, link) {		
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/informationCardModal.html',
			controller: 'informationCardModalController',
			size: 'lg',
			resolve: {				
				dimension : function () {
					return dimension;
				},
				link: function() {
					return link;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (data) {
			console.debug('I saved a damn card yeah!');			
			chapterCollection.saveChapterLink(data.dimension, data.link);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	/*------------------------formatting service specific functions (could also be done on server...)---------------------*/

	

	return {
		openMultipleLinkDialog : openMultipleLinkDialog,
		openLinkDialog : openLinkDialog,
		openCardDialog : openCardDialog
	}
}]);;angular.module('linkedtv').factory('entityUtils', ['entityCollection', 'chapterCollection', 
	function(entityCollection, chapterCollection) {


	function getConfidenceClass(entity) {
		var c = parseFloat(entity.confidence);
		if(c <= 0) {
			return 'verylow';
		} else if (c > 0 && c <= 0.2) {
			return 'low';
		} else if (c > 0.2 && c <= 0.4) {
			return 'fair';
		} else if (c > 0.4 && c <= 0.6) {
			return 'medium';
		} else if (c > 0.6 && c <= 0.8) {
			return 'high';
		} else if (c > 0.8) {
			return 'veryhigh';
		}
	};

	

	return {		
		getConfidenceClass : getConfidenceClass
	}
}]);;angular.module('linkedtv').factory('timeUtils', [function(){

	function toMillis(t) {
		var ms = -1;
		var tmp = t + '';
		if (tmp.indexOf(':') == -1) {
			//converts seconds to millis (e.g. strings like 24124.22)
			ms = t * 1000 + '';
			if(ms.indexOf('.') == -1) {
				return parseInt(ms);
			} else {
				return parseInt(ms.substring(0, ms.indexOf('.')));
			}
		} else if (t.indexOf(':') != -1) {
			//converts a hh:mm:ss.ms timestring into millis 
			var t_arr = t.split(':');
			if(t_arr.length == 3) {
				//add the hours
				ms = parseInt(t_arr[0]) * 3600000;
				//add the minutes
				ms += parseInt(t_arr[1]) * 60000;
				if(t_arr[2].indexOf('.') == -1) {
					//add the seconds
					ms += parseInt(t_arr[2]) * 1000;
				} else {
					//add the seconds before the '.'
					ms += parseInt(t_arr[2].substring(0, t_arr[2].indexOf('.'))) * 1000;
					//add the remaining ms after the '.'
					ms += parseInt(t_arr[2].indexOf('.') + 1);
				}
				return ms;
			}
		}
		return -1;
	}
		
	function toPrettyTime(millis) {
		var h = 0;
		var m = 0;
		var s = 0;
		while (millis >= 3600000) {
			h++;
			millis -= 3600000;
		}
		while (millis >= 60000) {
			m++;
			millis -= 60000;
		}
		while (millis >= 1000) {
			s++;
			millis -= 1000;
		}
		h = h < 10 ? '0' + h : h + '';
		m = m < 10 ? '0' + m : m + '';
		s = s < 10 ? '0' + s : s + '';
		millis = millis + '';
		for(var i=millis.length;i<3;i++) {
			millis += '0';
		}
		return h + ':' + m + ':' + s; //+ '.' + millis;
	}

	return {
		toMillis : toMillis,
		toPrettyTime : toPrettyTime
	}
}]);;angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'imageService', 'entityCollection', 'dataService',
	 function(conf, imageService, entityCollection, dataService) {

	var TYPE_AUTO = 'auto';
	var TYPE_CURATED = 'curated';
	var _chapters = [];
	var _activeChapter = null;
	var _thumbBaseUrl = null;
	var _observers = [];

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(provider, resourceData, curatedData) {
		console.debug('Initializing chapter data');
		_thumbBaseUrl = resourceData.thumbBaseUrl;
		var chapters = [];
		//old curations take precedence over v2.0 curations (for now)		
		if (curatedData) {
			console.debug('Loading v2.0 curations...');
			chapters = curatedData.chapters;
			var autoChapters = resourceData.chapters;
			_.each(autoChapters, function(c) {	
				c.type = TYPE_AUTO;
				chapters.push(c);
			});
		} else if(resourceData.curated.chapters && resourceData.curated.chapters.length > 0) {
			console.debug('Loading v1.0 curations...');		
			chapters = initCollectionWithRDFData(resourceData);
		} else {
			console.debug('No curations found...');
			chapters = initCollectionWithRDFData(resourceData);
		}
		//sort the chapters by start time
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});

		//make sure all the basic properties are added to each chapter
		_.each(chapters, function(c){
			setBasicProperties(c, true);
		});

		setChapters(chapters);
	}

	//This function must be used once all the curated data is saved in the LinkedTV graph
	function initCollectionWithRDFData(resourceData) {		
		var chapters = [];
		var autoChapters = resourceData.chapters;
		var curatedChapters = resourceData.curated.chapters;
		_.each(autoChapters, function(c) {
			c.type = TYPE_AUTO;
			chapters.push(c);
		});
		//TODO test if this works good enough for the ET sources that are actually saved in the old way!
		_.each(curatedChapters, function(c) {
			c.type = TYPE_CURATED;
			chapters.push(c);
		});
		return chapters;
	}

	function setBasicProperties(chapter, updateGuid) {
		if(updateGuid) {
			chapter.guid = _.uniqueId('chapter_');
			//chapter.label = chapter.label.replace(/ /g,'');
		}
		chapter.poster = imageService.getThumbnail(_thumbBaseUrl, chapter.start);
		if(!chapter.dimensions) {
			chapter.dimensions = {};
		}
	}

	function addObserver(observer) {
		_observers.push(observer);
	}

	function notifyObservers() {
		for (o in _observers) {
			_observers[o](_chapters);
		}
	}

	function setChapters(chapters) {
		_chapters = chapters;
		notifyObservers();
	}

	function getChapters() {
		return _chapters;
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
	}

	function getActiveChapter() {
		return _activeChapter;
	}

	function getAllEnrichmentsOfChapter(chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var dimensions = chapter.dimensions;
		var all = [];
		_.each(dimensions, function(d) {
			all.push.apply(all, d);
		});
		return all;
	};

	function getSavedEnrichmentsOfDimension(dimension, chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var enrichments = chapter.dimensions[dimension.id];
		return enrichments ? enrichments.slice(0) : [];
	}

	function removeChapter(chapter) {
		_.each(_chapters, function(c, index){
			if(c.guid == chapter.guid) {
				_chapters.splice(index, 1);
			}
		});
		saveOnServer();	
	}

	function saveChapter(chapter) {
		var exists = false;
		chapter.type = TYPE_CURATED;
		/*
		if(chapter.type == TYPE_AUTO) {
			chapter.type = TYPE_CURATED;	
		} */
		for(c in _chapters) {
			if(_chapters[c].guid == chapter.guid) {
				setBasicProperties(chapter, false);
				_chapters[c] = chapter;
				exists = true;
			}
		}
		if(!exists) { //if it's a new chapter add it
			setBasicProperties(chapter, true);
			_chapters.push(chapter);
		}
		//sort the chapters again
		_chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		//update the entire resource on the server
		saveOnServer();
	}

	//works for both information cards and enrichments
	function saveChapterLink(dimension, link) {
		if(link.remove) {
			for(var i=0;i<_activeChapter.dimensions[dimension.id].length;i++){
				if(_activeChapter.dimensions[dimension.id][i].uri == link.uri) {
					_activeChapter.dimensions[dimension.id].splice(i, 1);
				}
			}
		} else if(_activeChapter.dimensions[dimension.id]) {
			var exists = false;
			for(var i=0;i<_activeChapter.dimensions[dimension.id].length;i++){
				if(_activeChapter.dimensions[dimension.id][i].uri == link.uri) {
					_activeChapter.dimensions[dimension.id][i] = link;
					exists = true;
				}
			}
			if (!exists) {
				_activeChapter.dimensions[dimension.id].push(link);
			}
		} else {
			_activeChapter.dimensions[dimension.id] = [link];
		}
		saveChapter(_activeChapter);
	}

	function saveOnServer() {
		dataService.saveResource(_.filter(_chapters, function(c) {
			return c.type == TYPE_CURATED;
		}));
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setChapters : setChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		getAllEnrichmentsOfChapter : getAllEnrichmentsOfChapter,
		getSavedEnrichmentsOfDimension : getSavedEnrichmentsOfDimension,
		removeChapter : removeChapter,
		saveChapter : saveChapter,
		saveChapterLink : saveChapterLink,
		addObserver : addObserver
	}

}]);;angular.module('linkedtv').factory('entityCollection', ['timeUtils', function(timeUtils) {
	
	var _entities = [];
	var _groupedChapterEntities = {};//stores all the entities grouped by label
	var _chapterEntities = [];//only stores the unique entities (based on labels)

	function initCollectionData(resourceData) {
		console.debug('Initializing entity data');
		_entities = resourceData; //no transformation necessary
	}

	function getEntities() {
		return _entities;
	}

	function getChapterEntities() {
		return _chapterEntities;
	}

	function updateChapterEntities(chapter) {
		if(chapter) {
			//first filter all the entities to be only of the selected chapter
			var entities = _.filter(_entities, function(item) {
				if(item.start >= chapter.start && item.end <=  chapter.end) {
					return item;
				}
			});

			//group all the entities by label
			_groupedChapterEntities = _.groupBy(entities, function(e) {
				return e.label;
			});

			_chapterEntities = [];
			
			//generate a list of unique entities for displaying in the UI/templates
			//TODO make sure to adjust this. The proxy also supports wikipedia URLs
			for(key in _groupedChapterEntities) {
				var temp = null;
				var found = false;
				_.each(_groupedChapterEntities[key], function(entity) {
					if(temp) { //always assign the entity with the highest confidence score (for the UI)
						if(parseFloat(entity.confidence) > parseFloat(temp.confidence)) {
							temp = entity;
						}
					} else {
						temp = entity;
					}
					if(entity.disambiguationURL && entity.disambiguationURL.indexOf('dbpedia') != -1 && !found) {
						_chapterEntities.push(entity);
						found = true;						
					}
				});
				if(!found) { //in case no dbpedia version of this entity was found add the entity with the highest score
					_chapterEntities.push(temp);
				}
			}			
			//TODO sort the entities
			_chapterEntities.sort(function(a, b) {
				return parseFloat(b.confidence) - parseFloat(a.confidence);
			});
		}
	}

	return {
		initCollectionData : initCollectionData,
		getEntities : getEntities,		
		getChapterEntities : getChapterEntities,
		updateChapterEntities : updateChapterEntities
	}

}]);;angular.module('linkedtv').factory('shotCollection', ['imageService', function(imageService) {
	
	var _shots = [];
	var _groupedChapterShots = {};//stores all the entities grouped by label
	var _chapterShots = [];//only stores the unique entities (based on labels)
	var _thumbBaseUrl = null;

	function initCollectionData(resourceData) {
		console.debug('Initializing shot data');
		_thumbBaseUrl = resourceData.thumbBaseUrl;
		_shots = resourceData.shots; //no transformation necessary
		_.each(_shots, function(s){
			s.poster = imageService.getThumbnail(_thumbBaseUrl, s.start);
		});
		_shots.sort(function(a, b) {
			return parseFloat(a.start) - parseFloat(b.start);
		});
	}

	function getShots() {
		return _shots;
	}

	function getChapterShots() {
		return _chapterShots;
	}

	function updateChapterShots(chapter) {
		if(chapter) {
			//first filter all the entities to be only of the selected chapter
			var _chapterShots = _.filter(_shots, function(item) {
				if(item.start >= chapter.start && item.end <=  chapter.end) {
					return item;
				}
			});
			_chapterShots.sort(function(a, b) {
				return parseFloat(a.start) - parseFloat(b.start);
			});
		}
	}

	return {
		initCollectionData : initCollectionData,
		getShots : getShots,		
		getChapterShots : getChapterShots,
		updateChapterShots : updateChapterShots
	}

}]);;angular.module('linkedtv').factory('videoModel', function() {
	
	var _video = null;

	function initModelData(resourceData) {
		_video = {
			title : resourceData.videoMetadata.mediaResource.titleName,
			playoutUrl : resourceData.locator
		}
		console.debug('Loaded the video data');
	}

	function getVideo() {
		return _video;
	}

	return {
		initModelData : initModelData,
		getVideo : getVideo
	}

});;angular.module('linkedtv').factory('chapterService', [function(){
	
	//TODO later on when using this again make sure to fill the chapterCollection
	function getChaptersOfResource(resourceUri, callback) {
		console.debug('Getting chapters of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/chapters?r=' + resourceUri,
			success : function(json) {
				callback(json.chapters);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	return {
		getChaptersOfResource : getChaptersOfResource
	}

}]);;angular.module('linkedtv').factory('dataService', ['$rootScope', function($rootScope) {
	
	//rename this to: loadDataFromLinkedTVPlatform or something that reflects this
	function getResourceData(loadData, callback) {		
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/resource?id=' + $rootScope.resourceUri + '&ld=' + (loadData ? 'true' : 'false'),
			success : function(json) {
				console.debug(json);
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function getCuratedData(callback) {
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/curatedresource?id=' + $rootScope.resourceUri,
			success : function(json) {
				callback(json.error ? null : json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	//now this only takes chapters (which contain evertything), but maybe this needs to be changed later
	function saveResource(chapters, action) {
		console.debug('Saving resource...');
		console.debug(chapters);
		action = action == undefined ? 'save' : action; //not used on the server (yet?)
		var saveData = {'uri' : $rootScope.resourceUri, 'chapters' : chapters};
		$.ajax({
			type: 'POST',
			url: '/saveresource?action=' + action,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				console.debug(json);
				if(json.error) {
					alert('Could not save data');
				} else {
					//TODO animate the saved data on the screen
				}
			},
			error: function(err) {
	    		console.debug(err);	    		
			},
			dataType: 'json'
		});
	}

	return {
		getResourceData : getResourceData,
		getCuratedData : getCuratedData,
		saveResource : saveResource
	}

}]);;angular.module('linkedtv').factory('enrichmentService', [function(){
	
	function search(query, provider, dimension, callback) {
		console.debug('Querying enrichments using ' + query + '['+provider+']');
		console.debug(dimension);
		var fetchUrl = '/enrichments?q=' + query.split('+').join(',') + '&p=' + provider;
		fetchUrl += '&d=' + dimension.id + '&s=' + dimension.service;
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : fetchUrl,
			success : function(json) {
				var enrichments = json.error ? null : json.enrichments;	
				callback(formatServiceResponse(enrichments, dimension));
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function formatServiceResponse(data, dimension) {		
		if(dimension.service == 'TvEnricher') {
			return formatTvEnricherResponse(data, dimension);
		} else if(dimension.service == 'TvNewsEnricher') {
			return formatTvNewsEnricherResponse(data, dimension);
		}
		return null;
	}

	function formatTvEnricherResponse(data, dimension) {
		var temp = [];//will contain enrichments
		var sources = [];
		var eSources = [];		
		for (var es in data) {
			//if not added already, add the entity source to the list of possible sources
			if(eSources.indexOf(es) == -1) {
				eSources.push(es);
			}
			var entitySources = data[es];
			for (var s in entitySources) {
				var enrichmentsOfSource = entitySources[s];
				//if not added already, add the source to the list of possible sources
				if(sources.indexOf(s) == -1 && enrichmentsOfSource.length > 0) {
					sources.push(s);
				}
				//loop through the eventual enrichments and add them to temp				
				_.each(enrichmentsOfSource, function(e) {
					//set what you can right away
					var enrichment = {
						label : 'No title',
						description : 'No description',//TODO if it's there fetch it from the data
						uri : e.micropostUrl,
						source : s, //add the source to each enrichment (for filtering)
						entitySource : es //add the source entities to each enrichment (for filtering)
					};
					//find the right poster
					if(e.posterUrl && isValidPosterFormat(e.posterUrl)) {
						enrichment.poster = e.posterUrl;
					} else if(e.mediaUrl && isValidPosterFormat(e.mediaUrl)) {
						enrichment.poster = e.mediaUrl;						
					}					
					//set the correct label
					if(e.micropost && e.micropost.plainText) {
						enrichment.label = e.micropost.plainText;
					}
					temp.push(enrichment);
				});
			}
		}
		if(temp.length == 0) {
			return null;
		}
		return {enrichmentSources : sources, enrichmentEntitySources : eSources, allEnrichments : temp}
	}

	function formatTvNewsEnricherResponse(data, dimension) {
		console.debug('Formatting data from the TvNewsEnricher');
		console.debug(data);
		var temp = [];//will contain enrichments
		var sources = [];//sometimes available in the data
		var eSources = [];//always empty in this case
		if(dimension.id != 'tweets') { //TODO make sure that Tweets can also be shown (build another formatXXX function)
			_.each(data, function(e){
				var enrichment = {
					label : e.title,
					uri : e.url,
					description : e.text
				}
				//add the source to the list of possible sources and attach it to the retrieved enrichment
				if(e.source && e.source.name && sources.indexOf(e.source.name) == -1) {
					sources.push(e.source.name);
					enrichment.source = e.source.name;
				}
				if (e.media) {
					enrichment.poster = e.media.thumbnail;
					enrichment.mediaType = e.media.type;
					enrichment.mediaUrl = e.media.url;
				}
				temp.push(enrichment);
				//TODO add  more data to the enrichment
			});
		}
		if(temp.length == 0) {
			return null;
		}
		return {enrichmentSources : sources, enrichmentEntitySources : eSources, allEnrichments : temp};
	}

	function isValidPosterFormat(img) {
		if(img == null) {
			return false;
		}
		var formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'gif', 'GIF', 'JPEG', 'bmp', 'BMP'];
		for(i in formats) {
			if(img.indexOf(formats[i]) != -1) {
				return true;
			}
		}
		return false;
	}

	return {
		search : search
	}

}]);;angular.module('linkedtv').factory('entityProxyService', ['$rootScope', 'conf', function($rootScope, conf){
	

	function fetch(dbpediaUri, callback) {
		console.debug('Getting entity info for: ' + dbpediaUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + dbpediaUri + '&lang=' + conf.languageMap[$rootScope.provider],
			success : function(json) {				
				callback(json.error ? null : formatResponse(json));
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function formatResponse(data) {		
		console.debug(data);
		var info = [];
		var thumbs = [];
		for (key in data) {
			var prop = null;
			for(k in data[key]) {
				prop = data[key][k];
				var values = [];
				var uris = [];
				if(prop.length > 0) {
					for(p in prop) {
						values.push(prop[p].value || prop[p]);
						uris.push(prop[p].uri);
					}
					if(key !== 'thumb') {
						info.push({index : 0, key : k, values : values, uris : uris});
					}
				}
			}
		}
		info.sort();
		thumbs = getThumbs(info);
		return {info : info, thumbs : thumbs};
	}

	function getThumbs(info) {
		for(var i=0;i<info.length;i++) {
			if(info[i].key == 'thumb') {
				return info[i].values;
			}
		}
		return null;
	}


	return {
		fetch : fetch
	}

}]);;angular.module('linkedtv').factory('imageService', [function(){
	
	function getThumbnail(thumbBaseUrl, millis, useImageProxy) {
		if (useImageProxy) {
			return '/image?ms=' + millis + '&baseUrl=' + thumbBaseUrl;
		}
		var h = m = s = 0;
		while (millis >= 3600000) {
			h ++;
            millis -= 3600000;
		}
        while (millis >= 60000) {
            m ++;
            millis -= 60000;
        }
        while (millis >= 1000) {
            s++;        
            millis -= 1000;
        }
        var url = thumbBaseUrl;
        url += 'h/' + h + '/m/' + m + '/sec' + s + '.jpg';
        return url;
	}

	return {
		getThumbnail : getThumbnail
	}

}]);;angular.module('linkedtv').factory('playerService', [function() {
	
	var _mediaPlaying = false;
	var _videoPlayer = null;

	function playFragment(playoutUrl, start) {
		if(playoutUrl == 'none') {
			return false;
		}
		console.debug('Playing video: ' + playoutUrl);
		_mediaPlaying = false;
		_videoPlayer = document.getElementById('html5player');
		$('#videoSource').attr('src', playoutUrl + '?' + new Date().getTime());
		_videoPlayer.addEventListener('play', onPlay, false);
		_videoPlayer.addEventListener('pause', onPause, false);
		_videoPlayer.addEventListener('loadeddata', onLoadedData, false);
		_videoPlayer.addEventListener('loadstart', onLoadStart, false);
		_videoPlayer.addEventListener('error', onError, true);
		_videoPlayer.addEventListener('stalled', onStalled, false);
		var canPlayMP3 = (typeof _videoPlayer.canPlayType === "function" && _videoPlayer.canPlayType("video/mp4") !== "");
		if (canPlayMP3) {
		    _videoPlayer.pause();
		    _videoPlayer.load();
		    return true;
		} else {
			alert('Your browser does not support mp3...');
			return false;
		}
	}
		
	function getPlayerTime () {		
		if(_videoPlayer) {
			return _videoPlayer.currentTime * 1000;
		}
		return 0;
	};

	function seek(millis) {
		if(_videoPlayer) {
			_videoPlayer.currentTime = millis / 1000;
		}
	}

	/*----------------PLAYER EVENTS----------------*/

		
	function onLoadedData(e) {
		console.debug('loaded data...');
	}

	function onLoadStart(e) {
		console.debug('loading...');
	}
	
	function onStalled(e) {
		console.debug('stalled...');
	}
	
	function onError(e) {
		console.debug('An unknown error occurred.');
	}
	
	function onPlay(e) {
		_mediaPlaying = true;
		console.debug('play');
	}
	
	function onPause(e) {		
		_mediaPlaying = false;
		console.debug('pause');
	}

	return {
		playFragment : playFragment,
		getPlayerTime : getPlayerTime,
		seek : seek
	}

}]);;angular.module('linkedtv').factory('videoSelectionService', [function(){
	
	function getVideosOfProvider(provider, callback) {
		console.debug('Getting videos of provider: ' + provider);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/videos?p=' + provider,
			success : function(json) {
				callback(json.videos);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	return {
		getVideosOfProvider : getVideosOfProvider
	}

}]);;angular.module('linkedtv').filter('prettyTime', function(timeUtils) {
	return function(input) {
		input = input || 0;
		return timeUtils.toPrettyTime(input);
    };
});;angular.module('linkedtv').controller('appController',
	function($rootScope, $scope, conf, dataService, chapterCollection, entityCollection, shotCollection, videoModel) {	
	
	$scope.resourceData = null;

	//fetch all of this resource's data from the server
	$rootScope.$watch('resourceUri', function(resourceUri) {
		if(resourceUri) {
			dataService.getResourceData(true, $scope.dataLoaded);
		}
	});	

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		console.debug('Loaded the SPARQL data from the server');
		console.debug(resourceData);
		$scope.resourceData = resourceData;
		dataService.getCuratedData($scope.curatedDataLoaded);
	};

	//TODO finish testing this!!!
	$scope.curatedDataLoaded = function(curatedData) {					
		console.debug('Loaded the curated/Redis data from the server');
		console.debug(curatedData);

		//load the videoModel with metadata
		videoModel.initModelData($scope.resourceData);
					
		//load the chapterCollection with chapter data
		chapterCollection.initCollectionData($rootScope.provider, $scope.resourceData, curatedData);

		//load the entityCollection with entity data
		entityCollection.initCollectionData($scope.resourceData.nes);		

		//load the shotCollection with shot data
		shotCollection.initCollectionData($scope.resourceData);
	}

});;angular.module('linkedtv').controller('chapterController', 
	function($scope, $modal, chapterCollection, chapterService, playerService) {
	
	$scope.allChapters = [];
	$scope.chapters = [];
	$scope.showCuratedOnly = false;
	$scope.shotsCollapsed = true;

	//needed since the $watch function on the chapterCollection no longer works
	$scope.update = function(chapters) {
		$scope.$apply(function() {
			$scope.allChapters = chapters;
			$scope.chapters = chapters;
		});
	};

	$scope.toggleShowCuratedOnly = function() {
		$scope.showCuratedOnly = !$scope.showCuratedOnly;
		if($scope.showCuratedOnly) {
			$scope.chapters = _.filter($scope.allChapters, function(c) {
				return c.type == 'curated';
			})
		} else {
			$scope.chapters = $scope.allChapters;
		}
	};

	$scope.setActiveChapter = function(chapter) {
		chapterCollection.setActiveChapter(chapter);
		playerService.seek(chapter.start);
	};

	$scope.isChapterSelected = function(chapter) {
		if(chapterCollection.getActiveChapter()) {
			return chapterCollection.getActiveChapter().guid == chapter.guid ? 'selected' : '';
		}
		return '';
	};

	$scope.editChapter = function(chapter) {
		$scope.openChapterDialog(chapter)
	}

	$scope.createNewChapter = function() {
		$scope.openChapterDialog(null);
	}

	$scope.openChapterDialog = function(chapter) {
		/*
		chapter = {//copy the chapter
			annotationURI: chapter.annotationURI,
			bodyURI: chapter.bodyURI, 
			confidence: chapter.confidence,
			dimensions: chapter.dimensions,
			end: chapter.end,
			guid: chapter.guid,
			label: chapter.label, 
			mfURI: chapter.mfURI,
			poster: chapter.poster,
			relevance: chapter.relevance,
			start: chapter.start, 
			type: chapter.type
		}*/
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/chapterModal.html',
			controller: 'chapterModalController',
			size: 'lg',
			resolve: {				
				chapter : function () {
					return chapter;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (chapter) {			
			console.debug(chapter);
			if(chapter.remove) {
				chapterCollection.removeChapter(chapter);
			} else {
				//update the chapter collection
				chapterCollection.saveChapter(chapter);
			}
			
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	//add the update function as an observer to the chapterCollection
	chapterCollection.addObserver($scope.update);

});;angular.module('linkedtv').controller('chapterModalController', 
	['$scope', '$modalInstance', 'entityProxyService', 'shotCollection', 'chapter',
	function ($scope, $modalInstance, chapterCollection, shotCollection, chapter) {
	
	$scope.chapter = chapter || {};
	$scope.shots = shotCollection.getShots() || [];
	$scope.selectionStart = $scope.chapter.start;
	$scope.selectionEnd = $scope.chapter.end;//the start time of the last shot
	$scope.settingStart = true;

	console.debug($scope.selectionStart + ' - ' + $scope.selectionEnd);

	$scope.setSelection = function(shot) {
		if($scope.settingStart) {
			$scope.setSelectionStart(shot);
		} else {
			$scope.setSelectionEnd(shot);
		}
	}

	$scope.setSelectionStart = function(shot) {
		$scope.selectionStart = shot.start;
		$scope.selectionEnd = -1;
		$scope.settingStart = !$scope.settingStart;
	}

	$scope.setSelectionEnd = function(shot) {
		if(shot.start > $scope.selectionStart) {
			$scope.selectionEnd = shot.start;
			$scope.settingStart = !$scope.settingStart;
			$scope.chapter.start = $scope.selectionStart;
			$scope.chapter.end = $scope.selectionEnd;
		}
	}

	$scope.withinRange = function(shot) {		
		//first check if the shot is in the selected shots
		if($scope.selectionStart == shot.start) {
			return 'starting-point';
		}
		if($scope.selectionEnd == shot.start) {
			return 'in-range';
		}
		//then check if it's within the range of two selected shots
		if($scope.selectionEnd != -1) {
			return shot.start >= $scope.selectionStart && shot.start <= $scope.selectionEnd ? 'in-range' : '';
		}
		return '';
	}

	$scope.saveChapter = function () {
		if($scope.chapter.label) {
			$modalInstance.close($scope.chapter);
		} else {
			alert('Please add a title');
		}
	};

	$scope.deleteChapter = function () {		
		$scope.chapter.remove = true;
		$modalInstance.close($scope.chapter);
		
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};		
	
}]);;angular.module('linkedtv').controller('editorPanelController', 
	function($rootScope, $scope, conf, chapterCollection) {
	
	$scope.activeChapter = null;
	$scope.activeDimension = conf.programmeConfig.dimensions[0];
	$scope.conf = conf;	

	//watch the chapterCollection to see what chapter has been selected
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		if(newValue) {
			$scope.activeChapter = newValue;
		}
	});

	$scope.setActiveDimension = function(dimension) {
		$scope.activeDimension = dimension;
	}
	
});;angular.module('linkedtv').controller('enrichmentController', 
	function($rootScope, $scope, $modal, conf, chapterCollection, 
		entityCollection, enrichmentService, entityProxyService, enrichmentUtils) {
	
	$scope.enrichmentUtils = enrichmentUtils;
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		$scope.activeChapter = newValue;
	});

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		if(newValue) {
			$scope.updateEntities(newValue);
		}
	});
	
	//called whenever a chapter is selected
	$scope.updateEntities = function(entities) {
		$scope.entities	= entities;
	}

	$scope.editLink = function(dimension, link) {
		if(dimension.service != 'informationCards') {
			if(link) {
				enrichmentUtils.openLinkDialog(dimension, link);
			} else {
				enrichmentUtils.openMultipleLinkDialog(dimension);
			}
		} else {
			enrichmentUtils.openCardDialog(dimension, link);
		}
	}

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};
	
	
});;angular.module('linkedtv').controller('entityController', 
	function($scope, entityCollection) {
	
	$scope.activeEntities = [];
	$scope.entities = {};	
	$scope.popOverContent = {};//contains the HTML for each entity

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		$scope.updateEntities(newValue);
	});
	
	//called whenever a chapter is selected
	$scope.updateEntities = function(entities) {
		$scope.entities	= entities;
		$.each(entities, function(k, v) {
			var labels = [];
			var daUrls = [];
			for (var e in v) {
				labels.push(v[e].label);
				daUrls.push(v[e].disambiguationURL);
			}
			$scope.popOverContent[k] = labels.join(' ') + '&nbsp;' + daUrls.join(' ');
		});
	}

	$scope.toggleEntity = function(entityLabel) {
		if($scope.activeEntities.indexOf(entityLabel) == -1) {
			$scope.activeEntities.push(entityLabel);
		} else {
			$scope.activeEntities.splice($scope.activeEntities.indexOf(entityLabel),1);
		}
	};

	$scope.isEntitySelected = function(entityLabel) {
		return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
	};

	$scope.getConfidenceClass = function(entityList) {
		//really ugly hack: somehow the reduce function screws up when there is one item in the list
		var confidenceSum = entityList.length == 1 ? entityList[0].confidence : _.reduce(entityList, function(memo, e) {			
			return memo ? parseFloat(memo.confidence) + parseFloat(e.confidence) : parseFloat(e.confidence);
		});		
		var c = confidenceSum / entityList.length;		
		if(c <= 0) {
			return 'verylow';
		} else if (c > 0 && c <= 0.2) {
			return 'low';
		} else if (c > 0.2 && c <= 0.4) {
			return 'fair';
		} else if (c > 0.4 && c <= 0.6) {
			return 'medium';
		} else if (c > 0.6 && c <= 0.8) {
			return 'high';
		} else if (c > 0.8) {
			return 'veryhigh';
		}
	};

});;angular.module('linkedtv').controller('informationCardModalController', 
	['$scope', '$modalInstance', 'conf', 'entityProxyService', 'entityCollection', 'chapterCollection', 'entityUtils',
	 'dimension', 'link', function ($scope, $modalInstance, conf, entityProxyService, entityCollection, chapterCollection,
	 entityUtils, dimension, link) {
	
	$scope.dimension = dimension;
	$scope.card = link || {};
	$scope.entityUtils = entityUtils;

	$scope.autogeneratedEntities = entityCollection.getChapterEntities();//fetch the correct entities from the entityCollection	
	$scope.expandedEntities = chapterCollection.getActiveChapter().expandedEntities || [];//TODO
	
	$scope.thumbs = null;
	$scope.thumbIndex = 0;

	$scope.fetchedTriples = null;

	$scope.autocompleteId = 'autocomplete_1';
	$scope.foundEntity = {};//for the autocomplete box

	$scope.loading = false;

	//$scope.templates = conf.templates;
	//$scope.activeTemplate = null;//is set when using the dropdown


	$scope.addToCard = function(triple) {
		var t = null;
		if(triple) {
			//create a triple based on values/uris that are currently selected by the user
			t = {key : triple.key, value : triple.values[triple.index], uri : triple.uris[triple.index]};
			//use the key/value to add a property to a card (for convenience)
			$scope.card[t.key] = t.value;
		} else {
			t = {key : null, value : null, uri : null};
		}

		//Also add the triple to the list of triples (for convencience)
		$scope.addCardTriple(t);
	}

	$scope.addCardTriple = function(triple) {
		if($scope.card.triples) {
			$scope.card.triples.push(triple);
		} else {
			$scope.card.triples = [triple];
		}	
	}

	$scope.removeFromCard = function(index) {
		if($scope.card.triples[index].key === 'label') {
			$scope.card.label = null;
		} else if($scope.card.triples[index].key === 'poster') {
			$scope.card.poster = null;
		}
		$scope.card.triples.splice(index, 1);
	}

	$scope.nextTriple = function(index) {
		if($scope.fetchedTriples[index].index + 1 < $scope.fetchedTriples[index].values.length) {
			$scope.fetchedTriples[index].index++;
		} else {
			$scope.fetchedTriples[index].index = 0;
		}
	}

	$scope.setCardPoster = function(thumb) {
		$scope.card.poster = thumb;
		$scope.addCardTriple({key : 'poster', value : thumb, uri : null});
	}

	$scope.nextThumb = function() {
		if($scope.thumbIndex + 1 < $scope.thumbs.length) {
			$scope.thumbIndex++;
		} else {
			$scope.thumbIndex = 0;
		}
	}	

	$scope.isReserved = function(key) {
		return key === 'thumb';
	}


	//----------------------------FETCH INFO FROM THE ENTITY PROXY------------------------------

	$scope.fetchExtraInfo = function(entity) {
		var uri = entity.disambiguationURL ? entity.disambiguationURL : entity.uri;
		if(uri) {
			if(!$scope.card.uri) {
				$scope.card.uri = uri;
			}
			entityProxyService.fetch(uri, $scope.entityInfoFetched);
			$scope.loading = true;
		}
	}

	$scope.entityInfoFetched = function(data) {
		$scope.fetchedTriples = [];
		$scope.$apply(function() {
			$scope.loading = false;
			$scope.thumbIndex = 0;
			$scope.thumbs = data.thumbs;
			$scope.fetchedTriples = data.info;
		})
	}


	//----------------------------BUTTON PANEL------------------------------

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.ok = function () {
		$scope.updateCardProperties();
		if($scope.card.label) {
			$modalInstance.close({dimension : $scope.dimension, link : $scope.card});
		} else {
			alert('Please add a label');
		}
	};
	
	$scope.updateCardProperties = function() { //really ugly, but necessary for now...
		//TODO properly generate a URI
		if(!$scope.card.uri) {
			$scope.card.uri = 'http://linkedtv.eu/' + new Date().getTime();
		}
		for(t in $scope.card.triples) {
			$scope.card[$scope.card.triples[t].key] = $scope.card.triples[t].value;
		}
	}

	$scope.removeCard = function() {
		$scope.card.remove = true;
		$modalInstance.close({dimension : $scope.dimension, link : $scope.card});
	}
	
}]);;angular.module('linkedtv').controller('linkModalController', 
	['$scope', '$modalInstance', 'dimension', 'link', function ($scope, $modalInstance, dimension, link) {
		

	$scope.link = link;	
	$scope.dimension = dimension;//currently selected dimension

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {		
		$modalInstance.close({dimension: $scope.dimension, link : $scope.link});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};	

	$scope.removeLink = function() {
		$scope.link.remove = true;
		$modalInstance.close({dimension: $scope.dimension, link : $scope.link});	
	}
	
}]);;angular.module('linkedtv').controller('multipleLinkModalController', 
	['$scope', '$modalInstance', '$rootScope', 'entityProxyService', 'enrichmentService', 'chapterCollection', 
	'entityCollection', 'enrichmentUtils', 'entityUtils', 'dimension', 
	function ($scope, $modalInstance, $rootScope, entityProxyService, enrichmentService, chapterCollection,
	 entityCollection, enrichmentUtils, entityUtils, dimension) {
	
	//collapse states
	$scope.enrichmentsCollapsed = true;
	$scope.savedEnrichmentsCollapsed = false;
	$scope.entitiesCollapsed = false;
	
	$scope.nothingFound = false;
	$scope.fetchButtonText = 'Find links'

	//main variables
	$scope.enrichmentUtils = enrichmentUtils;
	$scope.entityUtils = entityUtils;
	$scope.dimension = dimension;//currently selected dimension

	//populate the 3 levels of entities
	$scope.combinedEnrichments =  chapterCollection.getAllEnrichmentsOfChapter() || []; //get the combined enrichments from all dimensions
	$scope.autogeneratedEntities = entityCollection.getChapterEntities();//fetch the correct entities from the entityCollection	
	$scope.expandedEntities = chapterCollection.getActiveChapter().expandedEntities || [];

	$scope.savedEnrichments = chapterCollection.getSavedEnrichmentsOfDimension(dimension) || null;

	//used to formulate the enrichment query for the TVenricher (or another service)
	$scope.enrichmentQuery = '';//the query that will be sent to the enrichmentService
	$scope.activeEntities = [];//selected entities
	

	$scope.allEnrichments = null; //all fetched enrichments (unfiltered)
	$scope.enrichments = [];//fetched & filtered enrichment
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on
	
	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter


	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {
		$scope.fetchButtonText = 'Loading...';
		$scope.enrichmentQuery = $('#e_query').val();//FIXME ugly hack, somehow the ng-model does not work in this form!!!
		if ($scope.enrichmentQuery) {
			enrichmentService.search($scope.enrichmentQuery, $rootScope.provider, $scope.dimension, $scope.onSearchEnrichments);		
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		//reset the button and the selected entities
		$scope.fetchButtonText = 'Find links';
		$scope.activeEntities = [];
		$scope.enrichmentQuery = '';
		$scope.enrichmentsCollapsed = false;		
		if(enrichments) {
			//apply the enrichments to the scope
			$scope.$apply(function() {
				$scope.enrichmentsCollapsed = false;
				$scope.nothingFound = false;
				$scope.enrichmentSources = enrichments.enrichmentSources;
				$scope.enrichmentEntitySources = enrichments.enrichmentEntitySources;
				$scope.allEnrichments = enrichments.allEnrichments;
				$scope.filterEnrichmentsBySource($scope.enrichmentSources[0]);
			});			
		} else {
			alert('No enrichments found');
			$scope.$apply(function() {
				$scope.enrichmentsCollapsed = true;
				$scope.nothingFound = true;
			});
		}
	}

	$scope.addEnrichment = function(enrichment) {		
		$scope.savedEnrichments.push(enrichment);
	}

	$scope.removeEnrichment = function(index) {
		$scope.savedEnrichments.splice(index, 1);
	}

	//filters the enrichments by source
	$scope.filterEnrichmentsBySource = function(source) {
		$scope.activeEnrichmentSource = source;
		$scope.enrichments = _.filter($scope.allEnrichments, function(e) {
			if(e.source === source) {
				return e;
			}
		});
	}

	//filters the enrichments by source
	$scope.filterEnrichmentsByEntitySource = function(entitySource) {
		$scope.activeEnrichmentEntitySource = entitySource;
		$scope.enrichments = _.filter($scope.allEnrichments, function(e) {
			if(e.entitySource === entitySource) {
				return e;
			}
		});
	}

	//----------------------------SELECTING ENRICHMENTS & ENTITIES------------------------------

	$scope.toggleEntity = function(entityLabel) {
		var index = $scope.activeEntities.indexOf(entityLabel);
		if(index == -1) {
			$scope.activeEntities.push(entityLabel);
		} else {
			$scope.activeEntities.splice(index, 1);
		}
		$('#e_query').attr('value', $scope.activeEntities.join('+'));
	}

	$scope.isEntitySelected = function(entityLabel) {
		return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
	}

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {
		if($scope.savedEnrichments) {
			$modalInstance.close({dimension: $scope.dimension, enrichments : $scope.savedEnrichments});
		} else {
			alert('Please add a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};	
	
}]);;angular.module('linkedtv').controller('playerController', function($sce, $scope, videoModel, playerService){
	
	$scope.canPlayVideo = false;
	
	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$scope.$watch(function () { return videoModel.getVideo(); }, function(video) {
		if(video) {			
			var playoutUrl = $sce.trustAsResourceUrl(video.playoutUrl);
			$scope.title = video.title;
			$scope.canPlayVideo = playerService.playFragment(playoutUrl, 0);
		}
	});

});;angular.module('linkedtv').controller('videoSelectionController', function($rootScope, $scope, videoSelectionService) {
		
	$scope.provider = $rootScope.provider;
	$scope.videos = [];

	//TODO remove this stupid function
	$scope.init = function() {
		//videoSelectionService.getVideosOfProvider($scope.provider, $scope.videosLoaded);
	};

	$scope.videosLoaded = function(videos) {
		if(videos != null) {			
			$scope.$apply(function(){
				$scope.videos = videos;
			});
		} else {
			// TODO error
		}
	};

	$scope.setActiveVideo = function(video) {
		window.location.assign('http://' + location.host + '/' + $scope.provider + '/' + video)
	};

	$scope.init();
});;angular.module('linkedtv').directive('chapterEditor', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/chapterEditor.html'

    };

}]);;//userful read: http://jasonmore.net/angular-js-directives-difference-controller-link/

angular.module('linkedtv').directive('dbpediaAutocomplete', function(){

	return {
		restrict : 'E',

		replace : true,

		scope : {
			entity : '=',//the selected entity will be communicated via this variable
			target : '@' //this is the id of the html element that holds the autocomplete widget
		},

		templateUrl : '/site_media/js/templates/dbpediaAutocomplete.html',

		controller : function($scope, $element) {

			$scope.entity = null;

			$scope.BUTTON_MAPPINGS = {'who' : 'orange', 'unknown' : 'red', 'where' : 'blue', 
				'what' : 'yellow', 'Freebase' : 'pink', 'DBpedia' : 'green', 'NERD' : 'yellow'
			};

			$scope.RENDER_OPTIONS = {
				ORIGINAL :  $.ui.autocomplete.prototype._renderItem,
				
				DBPEDIA : function(ul, item) {
					$(ul).css('z-index', '999999'); // needed when displayed within an Angular modal
					var v_arr = item.label.split('\|');
					var l = v_arr[0];
					var t = v_arr[1];
					var c = v_arr[2];
					t = '<button class="button button-primary">' + t + '</button>';
					c = '<button class="button button-primary ' + $scope.BUTTON_MAPPINGS[c] + '">' + c + '</button>';
					var row = l + '&nbsp;' + t + '&nbsp;' + c;
					return $("<li></li>").data("item.autocomplete", item).append("<a>" + row + "</a>").appendTo(ul);
				}
			};

			$scope.init = function() {
				$scope.setAutocompleteRendering('dbpedia');
				var url = '/autocomplete';
				$('#dbpedia').autocomplete({
					source: url,
					minLength: 3,
					select: function(event, ui) {
						if(ui.item) {
							var v_arr = ui.item.label.split('\|');
							var l = v_arr[0];
							var t = v_arr[1];
							var c = v_arr[2];
							var dbpediaURL = ui.item.value;

							//stores the selected DBpedia entry
							$scope.$apply(function() {
								$scope.entity = {label : l, type : t, category : c, uri : dbpediaURL};
							});

							//use the selected DBpedia entry to fill in the label and vocab URL of the annotation
							$('#entity').attr('value', l);
							$('#entity_url').attr('value', dbpediaURL);
							this.value = '';
							return false;
						}
					}
				});
			};
		
			$scope.setAutocompleteRendering = function(type) {
				if(type == 'dbpedia') {
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.DBPEDIA;
				} else {				
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.ORIGINAL;
				}
			};			

			$scope.init();

		}

	}

});angular.module('linkedtv').directive('dimensionTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/dimensionTab.html',

    };

}]);;angular.module('linkedtv').directive('entityEditor', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/editorPanel.html',

    };

}]);;angular.module('linkedtv').directive('entitySelector', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/entitySelector.html',

    };

}]);;angular.module('linkedtv').directive('foldable', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

    	scope : {
    		collapsed : '=collapsed',
    		title : '@'
    	},

        templateUrl : '/site_media/js/templates/foldable.html',

    };

}]);;angular.module('linkedtv').directive('informationCardsTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/informationCardsTab.html',

    };

}]);;angular.module('linkedtv').directive('navigationBar', function() {
	
	return {
		restrict : 'E',

		replace : true,

		scope : {
			user : '@'
		},

		templateUrl : '/site_media/js/templates/navigationBar.html'
	};

});;angular.module('linkedtv').directive('shotSelector', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,
    	/*
    	link: function ($scope, $element, $attributes) {
			$scope.shots = $scope.$eval($attributes.shots);
        },*/

        templateUrl : '/site_media/js/templates/shotSelector.html'

    };

}]);;angular.module('linkedtv').directive('videoPlayer', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/videoPlayer.html'

    };

}]);;angular.module('linkedtv').directive('videoSelector', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/videoSelector.html',

    };

}]);