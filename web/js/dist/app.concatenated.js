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
	logUserActions : false,
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
					curatedOnly : false
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
	logUserActions : false,
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
	//euspace : europeanaSpaceConfig,
	trial : trialConfig
}

//main config
var config = angular.module('configuration', []).constant('conf', {
	loadingImage : '/site_media/images/loading.gif'
});
;var linkedtv = angular.module('linkedtv', ['ui.bootstrap', 'configuration']);

linkedtv.run(function($rootScope, conf) {

	var urlParts = window.location.pathname.split('/');
	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.provider = urlParts[2];
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
		conf.templates = informationCardTemplates[$rootScope.provider];

		console.debug(conf);
	} else if(urlParts && urlParts[1] == 'trial') {
		$rootScope.provider = 'trial';
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
		conf.templates = informationCardTemplates[$rootScope.provider];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 4 && !trialId) {
		$rootScope.resourceUri = urlParts[3];
	} else if (trialId) {
		$rootScope.resourceUri = trialId;
	}
});;angular.module('linkedtv').factory('enrichmentUtils', ['$modal', 'chapterCollection', 'timeUtils', 'enrichmentService',
	function($modal, chapterCollection, timeUtils, enrichmentService) {

	function openMultipleLinkDialog(dimension) {
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
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
			chapterCollection.saveEnrichments(
				data.dimension,
				data.savedEnrichments,
				data.freshlySavedEnrichments,
				data.allEnrichments,
				data.queries
			);
		}, function () { //when the modal is closed otherwise (e.g. using the escape button)
			enrichmentService.cancelRequest();
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
		});
	};

	function openLinkDialog(dimension, link) {
		if(link) {
			link.prettyStart = timeUtils.toPrettyTime(link.start);
			link.prettyEnd = timeUtils.toPrettyTime(link.end);
		}
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
			chapterCollection.saveEnrichment(data.dimension, data.link, false);
		}, function () {
			//
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
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
			chapterCollection.saveEnrichment(data.dimension, data.link, true);
		}, function () {
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
		});
	};

	/*------------------------formatting service specific functions (could also be done on server...)---------------------*/



	return {
		openMultipleLinkDialog : openMultipleLinkDialog,
		openLinkDialog : openLinkDialog,
		openCardDialog : openCardDialog
	}
}]);;angular.module('linkedtv').factory('entityUtils', ['entityCollection', 'chapterCollection', 'conf',
	function(entityCollection, chapterCollection, conf) {

	//the measurements in this function must be scrutinized
	function getConfidenceClass(entity) {
		var c = 0;
		if(entity.confidence) {
			c = parseFloat(entity.confidence);
		} else {
			c = parseFloat(entity.relevance);
		}
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


	//FIXME see if this is still necessary. Remove it from this file anyway
	function copyInformationCardTemplate(template) {
		if(!template) {
			if(conf.templates && conf.templates.length != 0) {
				template = conf.templates[0];
			} else {
				return null;
			}
		}

		var t = {};
		t.label = template.label;
		t.properties = [];
		_.each(template.properties, function(p) {
			var val = null;
			if(p.value != null && typeof(p.value) == 'object') {
				val = {category: p.value.category, label: p.value.label, type :p.value.type, uri: p.value.uri};
			} else {
				val = p.value;
			}
			t.properties.push({key : p.key, type : p.type, optional : p.optional, value : val});
		});
		return t;
	}

	return {
		getConfidenceClass : getConfidenceClass,
		copyInformationCardTemplate : copyInformationCardTemplate
	}
}]);;angular.module('linkedtv').factory('idUtils', ['$rootScope', function($rootScope){

	function generateMediaFragmentId(startMs, endMs) {
		var start = startMs / 1000.0;
		var end = endMs / 1000.0;
		return $rootScope.resourceUri + '#t=' + start + ',' + end;
	}

	var guid = (function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	  	};
	})();

	return {
		generateMediaFragmentId : generateMediaFragmentId,
		guid : guid
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
				var s_arr = t_arr[2].split('.');

				if(s_arr.length == 1) {
					//add the seconds
					ms += parseInt(t_arr[2]) * 1000;
				} else {
					//add the seconds before the '.'
					ms += parseInt(s_arr[0]) * 1000;
					//add the remaining ms after the '.'
					ms += parseInt(s_arr[1]);
				}
				return ms;
			}
		}
		return -1;
	}

	function toPrettyTime(millis) {
		if(!millis) {
			return '00:00:00';
		}
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
		return h + ':' + m + ':' + s + '.' + millis;
	}

	return {
		toMillis : toMillis,
		toPrettyTime : toPrettyTime
	}

}]);;angular.module('linkedtv').factory('chapterCollection',
	['$rootScope', 'conf', 'imageService', 'entityCollection', 'shotCollection', 'subtitleCollection',
	 'dataService', 'timeUtils', 'entityExpansionService', 'loggingService', 'idUtils', 'synchronizationService',
	 function($rootScope, conf, imageService, entityCollection, shotCollection,
	 	subtitleCollection, dataService, timeUtils, entityExpansionService, loggingService, idUtils,
	 	synchronizationService) {

	var TYPE_AUTO = 'auto';
	var TYPE_CURATED = 'curated';
	var _chapters = [];
	var _activeChapter = null;
	var _thumbBaseUrl = null;
	var _srtUrl = null;
	var _observers = [];
	var _expandedEntities = {}

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)
	function initCollectionData(provider, resourceData, curatedData) {
		console.debug('Initializing chapter data');
		_thumbBaseUrl = resourceData.thumbBaseUrl;
		_srtUrl = resourceData.srtUrl;
		var chapters = [];
		//load curated data from ET storage
		if (curatedData) {
			console.debug('Loading curations stored in the ET storage...');
			chapters = curatedData.chapters;
			_.each(chapters, function(c) {
				c.type = TYPE_CURATED;
			});
		}
		//always add the autogenerated chapters
		addAutogeneratedChapterData(chapters, resourceData);

		//sort the chapters by start time
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		setChapters(chapters);

		//FIXME call this as a proper callback
		onChapterInitialized();
	}

	function onChapterInitialized() {
		//synchronize the curated data with the configured synchronization platform
		if(conf.programmeConfig.synchronization && conf.programmeConfig.synchronization.syncOnLoad) {
			synchronizationService.synchronize(onSynchronizationComplete);
		}
	}

	function onSynchronizationComplete(success) {
		console.debug('Synchronization complete: ' + success)
		if(success) {
			//TODO make sure to set the solrId for all the chapters
			_.each(_chapters, function(c) {
				c.solrId = c.mediaFragmentId;
			});
			saveOnServer();
		}
	}

	//This function adds the automatically generated chapters to the overall list of chapters (that are in memory)
	function addAutogeneratedChapterData(chapters, resourceData) {
		var autoChapters = resourceData.chapters;
		_.each(autoChapters, function(c) {
			c.type = TYPE_AUTO;
			chapters.push(c);
		});
	}

	//important function that makes sure that chapters have dimensions assigned to them at all times
	//also makes sure the correct thumbnail is set and that the start and end times are available in human readable format
	function setBasicProperties(chapter, updateDimensionData) {
		//only update the guid if it is not there yet
		if(!chapter.guid) {
			chapter.guid = idUtils.guid();
		}

		//make sure the dimension data is properly copied to the object
		if(updateDimensionData) {
			var dimensions = {};
			_.each(conf.programmeConfig.dimensions, function(d) {
				//copy the properties from the saved dimension
				var temp = {};
				if(chapter.dimensions && chapter.dimensions[d.id]) {
					_.each(chapter.dimensions[d.id], function(value, key) {
						if(key != '$$hashKey') {//FIXME ugly!
							temp[key] = value;
						}
					});
				} else {//if the dimension does not exist in the storage add it from the config
					_.each(d, function(value, key) {
						if(key != '$$hashKey') {//FIXME ugly!
							temp[key] = value;
						}
					});
				}
				dimensions[d.id] = temp;
			});
			chapter.dimensions = dimensions;
		}

		//always make sure to set the poster and start times
		chapter.poster = imageService.getThumbnail(_thumbBaseUrl, chapter.start);
		chapter.prettyStart = timeUtils.toPrettyTime(chapter.start);
		chapter.prettyEnd = timeUtils.toPrettyTime(chapter.end);
		chapter.mediaFragmentId = idUtils.generateMediaFragmentId(chapter.start, chapter.end);
	}

	function addObserver(observer) {
		_observers.push(observer);
	}

	function removeObserver() {
		_observers.pop();
	}

	function notifyObservers() {
		for (o in _observers) {
			_observers[o](_chapters);
		}
	}

	function setChapters(chapters) {
		//make sure all the basic properties are added to each chapter
		_.each(chapters, function(c) {
			setBasicProperties(c, true);
		});
		_chapters = chapters;
		notifyObservers();
	}

	function getChapters() {
		return _chapters;
	}

	function getCuratedChapters() {
		return _.filter(_chapters, function(c) {
			return c.type == TYPE_CURATED;
		})
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
		shotCollection.updateChapterShots(_activeChapter);
		subtitleCollection.updateChapterSubtitles(_activeChapter);
	}

	//TODO waarom wordt deze zo vaak aangeroepen
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
			all.push.apply(all, d.annotations);
		});
		return all;
	};

	function getSavedEnrichmentsOfDimension(dimension, chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var enrichments = chapter.dimensions[dimension.id] ? chapter.dimensions[dimension.id].annotations : null;
		return enrichments ? enrichments.slice(0) : [];
	}

	function removeChapter(chapter) {
		_.each(_chapters, function(c, index){
			if(c.guid == chapter.guid) {
				_chapters.splice(index, 1);
			}
		});
		if(conf.programmeConfig.synchronization &&
			conf.programmeConfig.synchronization.syncOnSave &&
			chapter.solrId) {
			console.debug('Disconnecting chapter from external platform');
			synchronizationService.disconnectChapter(chapter);
		}
		saveOnServer();
		notifyObservers();
	}

	function saveChapter(chapter, entityExpand) {
		//first fetch the expanded entities (very slow)
		if(conf.programmeConfig.entityExpansion && entityExpand){
			entityExpansionService.fetch(_srtUrl, chapter.start, chapter.end, chapter.guid, onEntityExpand);
		} else {
			console.debug('No entity expansion for this provider');
		}

		var exists = false;
		chapter.type = TYPE_CURATED;
		chapter.start = parseInt(chapter.start);
		chapter.end = parseInt(chapter.end);
		for(c in _chapters) {
			if(_chapters[c].guid == chapter.guid) {
				setBasicProperties(chapter, false);
				_chapters[c] = chapter;
				exists = true;
				break;
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
		saveOnServer(chapter);
		//notify observers
		notifyObservers();
	}

	function onEntityExpand(chapterId, data) {
		//set the data to the correct chapter in the list of chapters
		for(c in _chapters) {
			if(_chapters[c].guid == chapterId) {
				_chapters[c].expandedEntities = data;
				break;
			}
		}
		//also set the data to the active chapter
		if(_activeChapter.guid = chapterId) {
			_activeChapter.expandedEntities = data;
		}
		saveOnServer();
	}

	//TODO fix this! THis is a deadly bit of code, because it can be overseen easily! (so when you update the config.js
	// you also need to update this (when you want to add a property to a dimension)!!! (below also)
	function saveEnrichments(dimension, savedEnrichments, freshlySavedEnrichments, allEnrichments, queries) {
		//if user logging is enabled, save which enrichments were chosen by the user for which query
		if(conf.programmeConfig.logUserActions) {
			loggingService.logUserAction(allEnrichments, freshlySavedEnrichments, queries, _activeChapter.label);
		}
		//update the active chapter and save it
		_activeChapter.dimensions[dimension.id].annotations = savedEnrichments;
		saveChapter(_activeChapter);
	}

	//works for both information cards and enrichments (UGLY=check based on URI or URL :s :s)
	function saveEnrichment(dimension, enrichment, isInformationCard) {
		var dimensionAnnotations = _activeChapter.dimensions[dimension.id].annotations;
		if(enrichment.remove) {
			for(var i=0;i<dimensionAnnotations.length;i++) {
				if((!isInformationCard && dimensionAnnotations[i].url == enrichment.url) ||
					(isInformationCard && dimensionAnnotations[i].uri == enrichment.uri)) {
					dimensionAnnotations.splice(i, 1);
					break;
				}
			}
		} else if(dimensionAnnotations) {
			var exists = false;
			for(var i=0;i<dimensionAnnotations.length;i++){
				if((!isInformationCard && dimensionAnnotations[i].url == enrichment.url) ||
					(isInformationCard && dimensionAnnotations[i].uri == enrichment.uri)) {
					dimensionAnnotations[i] = enrichment;
					exists = true;
					break;
				}
			}
			if (!exists) {
				dimensionAnnotations.push(enrichment);
			}
		} else {
			//add a new dimension (add the config properties + a list to hold the annotations)
			//dimensionAnnotations = [enrichment];
			_activeChapter.dimensions[dimension.id].annotations = [enrichment];
		}
		saveChapter(_activeChapter);
	}

	//passing the chapter is optional (in all cases all data will be saved again)
	function saveOnServer(chapter) {
		//if configured, the changed chapter will be synchronized with an external platform prior to saving (see config.js)
		if(conf.programmeConfig.synchronization && conf.programmeConfig.synchronization.syncOnSave && chapter) {
			console.debug('Synchronizing chapter with external platform');
			synchronizationService.synchronizeChapter(chapter, onChapterSynched)
		} else {
			console.debug('Just saving all data on the server');
			dataService.saveResource(getCuratedChapters());
		}
	}

	function onChapterSynched(data) {
		if(data) {
			//make sure the solrId is added to the right chapter
			for(c in _chapters) {
				if(_chapters[c].guid == data.guid) {
					_chapters[c].solrId = data.solrId;
					break;
				}
			}

			//also update the active chapter (if applicable)
			if(_activeChapter && _activeChapter.guid == data.guid) {
				_activeChapter.solrId = data.solrId;
			}

			//now save this on the server
			dataService.saveResource(getCuratedChapters());
		}
	}

	return {
		initCollectionData : initCollectionData,
		getCuratedChapters : getCuratedChapters,
		getChapters : getChapters,
		setChapters : setChapters,
		saveOnServer : saveOnServer,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		getAllEnrichmentsOfChapter : getAllEnrichmentsOfChapter,
		getSavedEnrichmentsOfDimension : getSavedEnrichmentsOfDimension,
		removeChapter : removeChapter,
		saveChapter : saveChapter,
		saveEnrichment : saveEnrichment,
		saveEnrichments : saveEnrichments,
		addObserver : addObserver,
		removeObserver : removeObserver
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

}]);;angular.module('linkedtv').factory('shotCollection', ['imageService', 'timeUtils',
	function(imageService, timeUtils) {

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
			s.prettyStart = timeUtils.toPrettyTime(s.start);
			s.prettyEnd = timeUtils.toPrettyTime(s.end);
		});
		_shots.sort(function(a, b) {
			return parseInt(a.start) - parseInt(b.start);
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
			_chapterShots = _.filter(_shots, function(item) {
				if(parseInt(item.start) >= parseInt(chapter.start) && parseInt(item.end) <=  parseInt(chapter.end)) {
					return item;
				}
			});
			_chapterShots.sort(function(a, b) {
				return parseInt(a.start) - parseInt(b.start);
			});
		}
	}

	return {
		initCollectionData : initCollectionData,
		getShots : getShots,
		getChapterShots : getChapterShots,
		updateChapterShots : updateChapterShots
	}

}]);;angular.module('linkedtv').factory('subtitleCollection', ['timeUtils', function(timeUtils) {

	var _subtitles = [];
	var _chapterSubtitles = [];

	function initCollectionData(resourceData) {
		console.debug('Initializing entity data');
		_subtitles = resourceData; //no transformation necessary
	}

	function getSubtitles() {
		return _subtitles;
	}

	function getChapterSubtitles() {
		return _chapterSubtitles;
	}

	function updateChapterSubtitles(chapter) {
		if(chapter) {
			//first filter all the entities to be only of the selected chapter
			_chapterSubtitles = _.filter(_subtitles, function(item) {
				if(item.start >= chapter.start && item.end <=  chapter.end) {
					return item;
				}
			});

			_chapterSubtitles.sort(function(a, b) {
				return parseFloat(b.start) - parseFloat(a.start);
			});
		}
	}

	return {
		initCollectionData : initCollectionData,
		getSubtitles : getSubtitles,
		getChapterSubtitles : getChapterSubtitles,
		updateChapterSubtitles : updateChapterSubtitles
	}

}]);;angular.module('linkedtv').factory('videoCollection', ['imageService', function(imageService) {

	var _videos = [];
	var _observers = [];
	var THUMBNAIL_SECOND = 20;

	function initCollectionData(videos) {
		console.debug('Initializing video collection');
		if(videos) {
			_.each(videos, function(v){
				v.poster = imageService.getThumbnail(v.thumbBaseUrl, THUMBNAIL_SECOND * 1000);
			});
			videos.sort(function(a, b) {
				return  parseInt(b.dateInserted) - parseInt(a.dateInserted);
			});
		}
		setVideos(videos);
	}

	function addObserver(observer) {
		_observers.push(observer);
	}

	function notifyObservers() {
		for (o in _observers) {
			_observers[o](_videos);
		}
	}

	function setVideos(videos) {
		_videos = videos;
		notifyObservers();
	}

	function getVideos() {
		return _videos;
	}

	return {
		initCollectionData : initCollectionData,
		getVideos : getVideos,
		addObserver : addObserver
	}

}]);;angular.module('linkedtv').factory('videoModel', function() {

	var _video = null;

	function initModelData(resourceData) {
		if(resourceData.videoMetadata) {
			_video = {
				title : resourceData.title,
				date : resourceData.date,
				playoutUrl : resourceData.playoutUrl
			}
			console.debug('Loaded the video data');
		} else {
			alert('No video metadata could be loaded from the platform');
		}
	}

	function getVideo() {
		return _video;
	}

	return {
		initModelData : initModelData,
		getVideo : getVideo
	}

});;angular.module('linkedtv').factory('dataService', ['$rootScope', 'conf', function($rootScope, conf) {

	//loads (automatically generated) data from the specified platform (config.js)
	function loadMediaResource(loadData, callback) {
		var url = '/load?id=';
		url += $rootScope.resourceUri;
		url += '&ld=' + (loadData ? 'true' : 'false');//FIXME this is a weird/old parameter that must be removed later on
		url += '&p=' + conf.programmeConfig.platform;
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
			success : function(json) {
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	//loads the curated data (always stored in the ET)
	function loadCuratedMediaResource(callback) {
		var url = '/load_curated';
		url += '?id=' + $rootScope.resourceUri;
		if(conf.programmeConfig.loadGroundTruth) {
			url += '&gt=true';
		}
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
			success : function(json) {
				callback(json.error ? null : json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function saveResource(chapters) {
		var saveData = {
			'uri' : $rootScope.resourceUri,
			'chapters' : chapters
		};
		var url = '/save';
		$.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				console.debug(json);
				if(json.error) {
					alert('Could not save data');
				} else {
					//todo animate some stuff
				}
			},
			error: function(err) {
	    		console.debug(err);
			},
			dataType: 'json'
		});
	}

	function publishResource(chapters, unpublish, callback) {
		var saveData = {uri : $rootScope.resourceUri, chapters : chapters};
		var url = '/publish?pp=LinkedTV'; //currently no other publishing points are supported
		if(unpublish)  {
			url += '&del=true';
		}
		$.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				if(json.error) {
					callback(null);
				} else {
					callback(json);
				}
			},
			error: function(err) {
	    		callback(null);
			},
			dataType: 'json'
		});
	}

	return {
		loadMediaResource : loadMediaResource,
		loadCuratedMediaResource : loadCuratedMediaResource,
		saveResource : saveResource,
		publishResource : publishResource
	}

}]);;angular.module('linkedtv').factory('enrichmentService', ['videoModel', function(videoModel) {

	var _xhr = null;


	function cancelRequest() {
		if(_xhr && _xhr.readystate != 4) {
            _xhr.abort();
            console.debug('request is cancelled');
        }
	}

	function search(query, entities, dimension, callback) {
		fillInDynamicProperties(dimension);
		var data = {
			'query' : query,
			'dimension' : dimension,
			'entities' : entities
		};
		_xhr = $.ajax({
			method: 'POST',
			data: JSON.stringify(data),
			dataType : 'json',
			url : '/dimension',
			success : function(json) {
				console.debug(json);
				if(!json.error) {
					callback(formatGenericResponse(json.enrichments, dimension), json.queries);
				} else {
					callback(null, null, false);
				}
			},
			error : function(err) {
				console.debug(err);
				if(err.statusText == "abort") {
					callback(null, null, true);
				} else {
					callback(null, null, false);
				}
			}
		});
	}

	/*Should be moved to another place, this is not nice, also _.each is unneccesary*/
	function fillInDynamicProperties(dimension) {
		_.each(dimension.service.params, function(value, key){
			if (value == '$VIDEO_DATE') {
				dimension.service.params[key] = videoModel.getVideo().date;
			}
		});
	}

	//This function does not do anything with the additionalProperties of each enrichment.
	//These could be utitilized in a service specific function
	function formatGenericResponse(data, dimension) {
		var temp = [];//will contain enrichments
		var sources = [];//sometimes available in the data
		var eSources = [];//always empty in this case
		_.each(data, function(e) {
			var enrichment = {
				label : e.label ? e.label : 'No label',
				url : e.url,
				description : e.description,
				poster : e.poster,
				entities : e.entities,
				type : e.enrichmentType,
				date : e.date ? e.date : 'No date',
				creator : e.creator ? e.creator : 'unknown',
				nativeProperties : e.nativeProperties //this way clients are fully 'service aware'
			}
			//add the source to the list of possible sources and attach it to the retrieved enrichment
			if(sources.indexOf(e.source) == -1) {
				sources.push(e.source);
			}
			enrichment.source = e.source;

			//TODO there is no derived entity yet
			if(e.entities) {
				_.each(e.entities, function(entity){
					if(eSources.indexOf(entity) == -1) {
						eSources.push(entity);
					}
				});
			}

			temp.push(enrichment);
		});
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
		search : search,
		cancelRequest : cancelRequest

	}

}]);;angular.module('linkedtv').factory('entityExpansionService', ['$rootScope', 'conf', function($rootScope, conf){

	function fetch(srtUrl, start, end, chapterId, callback) {
		if(srtUrl) {
			var url = '/entityexpand';
			url += '?url=' + srtUrl;
			url += '&start=' + start;
			url += '&end=' + end;
			console.debug(url);
			$.ajax({
				method: 'GET',
				dataType : 'json',
				url : url,
				success : function(json) {
					callback(chapterId, json.error ? null : formatResponse(json));
				},
				error : function(err) {
					callback(chapterId, null);
				}
			});
		} else {
			console.debug('This resource does not have any subtitles available!');
		}
	}

	function formatResponse(data) {
		console.debug('Got some data!!');
		console.debug(data);
		return data
	}

	return {
		fetch : fetch
	}

}]);;angular.module('linkedtv').factory('entityProxyService', ['$rootScope', 'conf', function($rootScope, conf){


	function fetch(uri, callback) {
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + uri + '&lang=' + conf.programmeConfig.lang,
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
				if(typeof(prop) == 'string') {
					values.push(prop);
					info.push({index : 0, key : k, values : values , uris : uris});
				} else if(typeof(prop) == "object") {
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
		return [];
	}


	return {
		fetch : fetch
	}

}]);;angular.module('linkedtv').factory('imageService', [function(){

	function getThumbnail(thumbBaseUrl, millis, useImageProxy) {
		if (!thumbBaseUrl) {
			return null;
		}
		if (useImageProxy) {
			return '/image?ms=' + millis + '&baseUrl=' + thumbBaseUrl;
		}
		var h = m = s = 0;
		//round up to full seconds
		if (millis % 1000 != 0) {
			millis += 1000 - millis % 1000;
		}
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

}]);;angular.module('linkedtv').factory('loggingService', ['$rootScope',
	function($rootScope) {

	/**
	* Log the following:
	* - timestamp the user saved enrichments
	* - chapter title (+ video id)
	* - content provider
	* - URL
	* - query
	* - list of all enrichments
	* - list of saved enrichments
	*/
	function logUserAction(allEnrichments, savedEnrichments, urls, chapterTitle) {
		//only log when the user searched for enrichments
		if(savedEnrichments && savedEnrichments.length > 0) {
			var logData = {
				timeCreated : new Date().getTime(),
				videoId : $rootScope.resourceUri,
				chapterTitle : chapterTitle,
				user : $rootScope.provider,
				urls : urls,
				queries : [],//TODO
				allEnrichments : _.pluck(allEnrichments, 'url'),
				savedEnrichments : _.pluck(savedEnrichments, 'url')
			};
			$.ajax({
				type: 'POST',
				url: '/log',
				data: JSON.stringify(logData),
				dataType : 'json',
				success: function(json) {
					console.debug(json);
					if(json.error) {
						//alert('Could not log data');
					} else {
						//alert('Logging was a succes!!');
					}
				},
				error: function(err) {
		    		console.debug(err);
				},
				dataType: 'json'
			});
		}
	}

	return {
		logUserAction : logUserAction
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
			try {
				_videoPlayer.currentTime = millis / 1000.0;
			} catch(err) {
				console.debug(err);
			}
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
	}

	function onPause(e) {
		_mediaPlaying = false;
	}

	return {
		playFragment : playFragment,
		getPlayerTime : getPlayerTime,
		seek : seek
	}

}]);;angular.module('linkedtv').factory('synchronizationService', ['$rootScope', 'conf', 'subtitleCollection',
	function($rootScope, conf, subtitleCollection){

	function synchronize(callback) {
		if(conf.programmeConfig.synchronization) {
			console.debug('Synchronizing with ' + conf.programmeConfig.synchronization.platform);
			var url = '/synchronize'
			url += '?uri=' + $rootScope.resourceUri;
			url += '&platform=' + conf.programmeConfig.synchronization.platform;
			url += '&p=' + $rootScope.provider;

			$.ajax({
				method: 'GET',
				dataType : 'json',
				url : url,
				success : function(json) {
					console.debug(json)
					callback(json.success ? true : false);
				},
				error : function(err) {
					console.debug(err);
					callback(false);
				}
			});
		} else {
			console.debug('Synchronization has been disabled in the config');
		}
	}

	function synchronizeChapter(chapter, callback) {
		if(conf.programmeConfig.synchronization) {
			var data = {
				'uri' : $rootScope.resourceUri,
				'provider' : $rootScope.provider,
				'subtitles' : subtitleCollection.getChapterSubtitles(),
				'chapter' : chapter,
				'platform' : conf.programmeConfig.synchronization.platform
			};
			var url = '/synchronize_chapter';
			$.ajax({
				type: 'POST',
				url: url,
				data: JSON.stringify(data),
				dataType : 'json',
				success: function(json) {
					console.debug(json);
					if(json.error) {
						console.debug('Could not update the chapter index');
						callback(null);
					} else {
						callback(json);//makes sure the client side also is updated with the new solrId
					}
				},
				error: function(err) {
		    		console.debug(err);
		    		callback(null);
				},
				dataType: 'json'
			});
		} else {
			console.debug('Synchronization has been disabled in the config');
		}
	}

	function disconnectChapter(chapter) {
		if(conf.programmeConfig.synchronization) {
			if(chapter.solrId) {//FIXME SOLRID MUST BE ABSTRACTED!!!
				var data = {'id' : chapter.solrId, 'provider' : $rootScope.provider, 'platform' : conf.programmeConfig.synchronization.platform};
				$.ajax({
					type: 'POST',
					url: '/disconnect_chapter',
					data : JSON.stringify(data),
					dataType : 'json',
					success: function(json) {
						if(json.error) {
							console.debug('Could not delete the chapter from the index');
						}
					},
					error: function(err) {
			    		console.debug(err);
					},
					dataType: 'json'
				});
			}
		} else {
			console.debug('Synchronization has been disabled in the config');
		}
	}

	return {
		synchronize : synchronize,
		synchronizeChapter : synchronizeChapter,
		disconnectChapter : disconnectChapter
	}

}]);;angular.module('linkedtv').factory('videoSelectionService', ['conf', function(conf){

	function getVideosOfProvider(provider, callback) {
		console.debug('Getting videos of provider: ' + provider);
		var url = '/videos?cp=' + provider;
		url += '&p=' +conf.programmeConfig.platform;
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
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
	function($rootScope, $scope, conf, dataService, chapterCollection, entityCollection,
		shotCollection, subtitleCollection, videoModel, videoCollection, videoSelectionService) {

	$scope.resourceData = null;
	$scope.loading = true;

	//fetch all of this resource's data from the server
	$rootScope.$watch('resourceUri', function(resourceUri) {
		if(resourceUri) {
			dataService.loadMediaResource(true, $scope.dataLoaded);
		}
	});

	//fetch the video collection as soon as the provider is added to the rootScope
	$rootScope.$watch('provider', function(provider) {
		//only load the video list on the video selection page
		if(!$rootScope.resourceUri) {
			videoSelectionService.getVideosOfProvider(provider, $scope.videosLoaded);
		}
	});

	$scope.videosLoaded = function(videos) {
		videoCollection.initCollectionData(videos);
	};

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		console.debug('Loaded the SPARQL data from the server');
		console.debug(resourceData);
		$scope.resourceData = resourceData;
		dataService.loadCuratedMediaResource($scope.curatedDataLoaded);
	};

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

		//load the subtitleCollection with shot data
		subtitleCollection.initCollectionData($scope.resourceData.subtitles);

		$scope.$apply(function() {
			$scope.loading = false;
		});
	}

});;angular.module('linkedtv').controller('chapterController',
	function($scope, $modal, chapterCollection, playerService) {

	$scope.allChapters = [];
	$scope.chapters = [];
	$scope.showCuratedOnly = false;
	$scope.shotsCollapsed = true;

	//needed since the $watch function on the chapterCollection no longer works
	$scope.update = function(chapters) {
		$scope.safeApply(function() {
			$scope.allChapters = chapters;
			$scope.chapters = chapters;
			$scope.applyChapterFilter();
		});
	};

	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
	  	} else {
			this.$apply(fn);
		}
	};

	$scope.toggleShowCuratedOnly = function() {
		$scope.showCuratedOnly = !$scope.showCuratedOnly;
		$scope.applyChapterFilter();
	};

	$scope.applyChapterFilter = function() {
		if($scope.showCuratedOnly) {
			$scope.chapters = _.filter($scope.allChapters, function(c) {
				return c.type == 'curated';
			})
		} else {
			$scope.chapters = $scope.allChapters;
		}
	}

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
		if(chapter) {
			//copy the chapter (FIXME this is a very nasty bit! It's easy to overlook this when you extend your chapter object!!)
			chapter = {
				annotationURI: chapter.annotationURI,
				mediaFragmentId : chapter.mediaFragmentId,
				solrId : chapter.solrId,
				bodyURI: chapter.bodyURI,
				confidence: chapter.confidence,
				dimensions: chapter.dimensions,
				end: chapter.end,
				prettyEnd: chapter.prettyEnd,
				guid: chapter.guid,
				label: chapter.label,
				mfURI: chapter.mfURI,
				poster: chapter.poster,
				relevance: chapter.relevance,
				start: chapter.start,
				prettyStart: chapter.prettyStart,
				type: chapter.type
			}
		}
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
				chapterCollection.saveChapter(chapter, true);
			}

		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	//add the update function as an observer to the chapterCollection
	chapterCollection.addObserver($scope.update);

});;angular.module('linkedtv').controller('chapterModalController',
	['$scope', '$modalInstance', 'chapter', 'timeUtils',
	function ($scope, $modalInstance, chapter, timeUtils) {

	$scope.chapter = chapter || {};

	$scope.saveChapter = function () {
		if($scope.chapter.label && $scope.chapter.prettyStart && $scope.chapter.prettyEnd) {
			$scope.chapter.start = timeUtils.toMillis($scope.chapter.prettyStart);
			$scope.chapter.end = timeUtils.toMillis($scope.chapter.prettyEnd);
			$modalInstance.close($scope.chapter);
		} else {
			alert('Please fill out the entire form');
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
	function($rootScope, $scope, conf, chapterCollection, dataService) {
	
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

	$scope.publishResource = function() {
		dataService.publishResource(chapterCollection.getCuratedChapters(), false, $scope.resourcePublished);
	}

	$scope.resourcePublished = function(mediaResource) {
		//TODO animate some stuff
		alert('The data was published in the LinkedTV platform');		
	}

	$scope.unpublishResource = function() {
		dataService.publishResource(chapterCollection.getCuratedChapters(), true, $scope.resourceUnpublished);
	}

	$scope.resourceUnpublished = function(mediaResource) {
		//TODO animate some stuff
		alert('The data was removed from the LinkedTV platform');
	}
	
});;angular.module('linkedtv').controller('enrichmentController',
	function($rootScope, $scope, $modal, conf, chapterCollection,
		entityCollection, enrichmentService, entityProxyService, enrichmentUtils) {

	$scope.enrichmentUtils = enrichmentUtils;
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		$scope.activeChapter = newValue;
	});

	$scope.editSingleEnrichment = function(dimension, enrichment) {
		if(dimension.service.id == 'informationCards') {
			enrichmentUtils.openCardDialog(dimension, enrichment);
		} else {
			enrichmentUtils.openLinkDialog(dimension, enrichment);
		}
	}

	$scope.editMultipleEnrichments = function(dimension) {
		if(dimension.service.id != 'informationCards') {
			enrichmentUtils.openMultipleLinkDialog(dimension);
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

});;//TODO http://stackoverflow.com/questions/20791639/pseudo-element-hover-on-before

angular.module('linkedtv').controller('informationCardModalController',
	['$scope', '$modalInstance', 'conf', 'entityProxyService', 'entityCollection', 'chapterCollection', 'entityUtils',
	 'dimension', 'link', function ($scope, $modalInstance, conf, entityProxyService, entityCollection, chapterCollection,
	 entityUtils, dimension, link) {

	$scope.dimension = dimension;
	$scope.card = link || {};
	$scope.templates = conf.templates;
	$scope.entityUtils = entityUtils;

	//copy the poster, so it won't be immediately bound to the chapter before saving
	$scope.poster = $scope.card.poster;

	//copy the card template, so it won't be immediately bound to the chapter before saving
	$scope.activeTemplate = entityUtils.copyInformationCardTemplate($scope.card.template);

	$scope.autogeneratedEntities = entityCollection.getChapterEntities();//fetch the correct entities from the entityCollection
	$scope.expandedEntities = chapterCollection.getActiveChapter().expandedEntities || [];

	$scope.thumbs = null;
	$scope.thumbIndex = 0;

	$scope.fetchedTriples = null;
	$scope.foundEntity = null;//for the autocomplete box
	$scope.selectedUri = null;

	$scope.loading = false;

	$scope.useTemplate = $scope.activeTemplate ? $scope.activeTemplate.label != undefined : false;

	$scope.clearTemplate = function() {
		$scope.useTemplate = !$scope.useTemplate;
		var uri = $scope.card.uri;
		$scope.card = {};
		$scope.card.uri = uri;
		$scope.poster = null;
		$scope.activeTemplate = null;
	}

	$scope.generateUri = function() {
		return 'http://linkedtv.eu/' + new Date().getTime();
	}

	//TODO this function formats the stored triples in the form of the user friendly template
	$scope.setTemplate = function(template) {
		$scope.activeTemplate = template;
		$scope.card.uri = $scope.generateUri();//always assign a custom ID to a card based on a template
	};

	$scope.addToTemplate = function(triple, literal) {
		//Create a triple
		var t = null;
		if(triple) {
			var val = {};
			val.label = triple.values[triple.index];
			val.uri = triple.uris[triple.index];
			t = {
				key : triple.key,
				type : val.uri ? 'entity' : 'literal',
				optional : triple.key == 'label' ? false : true
			};
			if (t.type == 'literal') {
				t.value = val.label;
			} else {
				t.value = val;
			}
		} else {
			if(literal) {
				t = {key : null, type : 'literal', value : null, optional : true};
			} else {
				t = {key : null, type : 'entity', value : null, optional : true};
			}
		}

		//then add the triple to the active template (the template will be copied to the $scope.card on save)
		if(!$scope.activeTemplate) {
			$scope.activeTemplate = {};
		}
		if($scope.activeTemplate.properties) {
			$scope.activeTemplate.properties.push(t);
		} else {
			$scope.activeTemplate.properties = [t];
		}
	};

	$scope.removeFromCard = function(index) {
		if($scope.activeTemplate.properties[index] && $scope.activeTemplate.properties[index].key == 'poster') {
			$scope.poster = null;
		}
		$scope.activeTemplate.properties.splice(index, 1);
	};

	$scope.nextTriple = function(index) {
		if($scope.fetchedTriples[index].index + 1 < $scope.fetchedTriples[index].values.length) {
			$scope.fetchedTriples[index].index++;
		} else {
			$scope.fetchedTriples[index].index = 0;
		}
	};

	$scope.setCardPoster = function(thumb) {
		$scope.poster = thumb;
	};

	$scope.nextThumb = function() {
		if($scope.thumbIndex + 1 < $scope.thumbs.length) {
			$scope.thumbIndex++;
		} else {
			$scope.thumbIndex = 0;
		}
	};

	$scope.isReserved = function(key) {
		return key === 'thumb';
	};

	$scope.DBpediaPropertyClass = function(triple) {
		return triple.uri ? 'dbpedia' : '';
	};

	$scope.useAsCard = function() {
		var goAhead = true;
		//if you are not replacing the current entity (which is fine), check if it was already added in this dimension
		if($scope.card.uri != $scope.selectedUri) {
			var c = chapterCollection.getActiveChapter();
			var annotations = c.dimensions[$scope.dimension.id].annotations;
			if(annotations && annotations.length > 0) {
				for (var a=0; a<annotations.length;a++) {
					if(annotations[a].uri == $scope.selectedUri) {
						goAhead = false;
						alert('An information card with the same entity already exists in this dimension');
					}
				}
			}
		}
		if(goAhead) {
			$scope.useTemplate = false;
			$scope.card = {};
			$scope.card.uri = $scope.selectedUri;
			$scope.activeTemplate = {properties : []};
			_.each($scope.fetchedTriples, function(triple) {
				$scope.addToTemplate(triple);
			});
			//set the poster, if any
			if($scope.thumbs) {
				$scope.poster = $scope.thumbs[$scope.thumbIndex];
			}
		}
	}


	//----------------------------FETCH INFO FROM THE ENTITY PROXY------------------------------

	$scope.fetchExtraInfo = function(entity) {
		console.debug(entity);
		var uri = entity.disambiguationURL ? entity.disambiguationURL : entity.uri;
		if(uri) {
			$scope.selectedUri = uri;
			entityProxyService.fetch(uri, $scope.entityInfoFetched);
			$scope.loading = true;
		}
	};

	$scope.entityInfoFetched = function(data) {
		$scope.fetchedTriples = [];
		$scope.$apply(function() {
			$scope.loading = false;
			$scope.thumbIndex = 0;
			$scope.thumbs = data.thumbs;
			$scope.fetchedTriples = data.info;
		})
	};

	//----------------------------VALIDATION AND DATA FORMATTING------------------------------

	$scope.getFormValidationMessage = function() {
		if(!$scope.card.uri || $scope.card.uri == '') {
			return 'Please add a URI';
		}
		if(!$scope.card.label || $scope.card.label == '') {
			return 'Please add a label';
		}
		var msg = null;
		_.each($scope.activeTemplate.properties, function(p){
			if(p.key == null || p.key == '') {
				msg = 'Please make sure all properties have a name';
			}
		});
		return msg;
	};

	$scope.updateCardProperties = function() {
		//make sure to copy the poster to the card
		$scope.card.poster = $scope.poster;

		if(!$scope.card.uri) {
			$scope.card.uri = $scope.generateUri();
		}

		//use the template properties to fill the enrichment's properties and entity list
		if($scope.activeTemplate) {
			var entities = [];
			_.each($scope.activeTemplate.properties, function(p) {
				if(p.value != undefined) {
					if(p.type == 'literal') {
						$scope.card[p.key] = p.value;
					} else if (p.type == 'entity') {
						entities.push(p.value);
					}
				}
			});
			$scope.card.entities = entities;
		}
	};


	//----------------------------BUTTON PANEL------------------------------

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.ok = function () {
		//set the active template as the card's template (so it will be saved)
		$scope.card.template = entityUtils.copyInformationCardTemplate($scope.activeTemplate);
		$scope.updateCardProperties();
		var msg = $scope.getFormValidationMessage();
		if(msg == null) {
			$modalInstance.close({dimension : $scope.dimension, link : $scope.card});
		} else {
			alert(msg);
		}
	};

	$scope.removeCard = function() {
		$scope.card.remove = true;
		$modalInstance.close({dimension : $scope.dimension, link : $scope.card});
	};

	//----------------------------LISTEN TO FOUND EXPANDED ENTITIES------------------------------

	//this function will update the expanded entities when they are shown
	$scope.update = function(chapters) {
		//fetch the expandedentities from the active chapter
		for(c in chapters) {
			console.debug(chapters[c]);
			if(chapters[c].guid == chapterCollection.getActiveChapter().guid) {
				$scope.$apply(function() {
					$scope.expandedEntities = chapters[c].expandedEntities;
				});
				break;
			}
		}
	}

	chapterCollection.addObserver($scope.update);

}]);;angular.module('linkedtv').controller('linkModalController',
	['$scope', '$modalInstance', 'timeUtils', 'dimension', 'link',
	function ($scope, $modalInstance, timeUtils, dimension, link) {


	$scope.link = link || {};
	$scope.dimension = dimension;//currently selected dimension

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {
		if($scope.link.url && $scope.link.label) {
			$scope.link.start = timeUtils.toMillis($scope.link.prettyStart);
			$scope.link.end = timeUtils.toMillis($scope.link.prettyEnd);
			$modalInstance.close({dimension: $scope.dimension, link : $scope.link});
		} else {
			alert('Please enter a URL and a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.removeLink = function() {
		$scope.link.remove = true;
		$modalInstance.close({dimension: $scope.dimension, link : $scope.link});
	}

}]);;angular.module('linkedtv').controller('multipleLinkModalController',
	['$scope', '$modalInstance', '$rootScope', 'conf', 'entityProxyService', 'enrichmentService', 'chapterCollection',
	'entityCollection', 'enrichmentUtils', 'entityUtils', 'dimension',
	function ($scope, $modalInstance, $rootScope, conf, entityProxyService, enrichmentService, chapterCollection,
	 entityCollection, enrichmentUtils, entityUtils, dimension) {

	//currently selected dimension
	$scope.dimension = dimension;

	//make sure these utilities are available in the template
	$scope.enrichmentUtils = enrichmentUtils;
	$scope.entityUtils = entityUtils;

	//collapse states (for the template)
	$scope.enrichmentsCollapsed = false;
	$scope.savedEnrichmentsCollapsed = false;
	$scope.entitiesCollapsed = false;

	//template variables
	$scope.nothingFound = false;
	$scope.fetchButtonText = 'Search';

	//show expanded entities
	$scope.entityExpansion = conf.programmeConfig.entityExpansion;

	//populate the 3 levels of entities (expanded entities are only shown if $scope.entityExpansion == true)
	$scope.combinedEnrichments =  chapterCollection.getAllEnrichmentsOfChapter() || []; //get the combined enrichments from all dimensions
	$scope.autogeneratedEntities = entityCollection.getChapterEntities();//fetch the correct entities from the entityCollection
	$scope.expandedEntities = chapterCollection.getActiveChapter().expandedEntities || [];

	//enrichments that are saved to the dimension
	$scope.savedEnrichments = chapterCollection.getSavedEnrichmentsOfDimension(dimension) || null;

	//query input that will be sent to the server for searching enrichments on demand
	$scope.enrichmentQuery = '';//the query that will be sent to the enrichmentService
	$scope.activeEntities = {};//selected entities

	//environment variables to keep track of the enrichments that were retrieved via search (but not yet saved)
	$scope.allEnrichments = null; //all fetched enrichments (unfiltered)
	$scope.enrichments = [];//fetched & filtered enrichment
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on
	$scope.enrichmentQueries = [];//queries issued on the server to call the related enrichment API
	$scope.freshlyAddedEnrichments = []//used to keep track of what the user selects per query; flushed after each search
	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter

	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {
		$scope.xhrCancelled = false;
		$scope.enrichmentQuery = $('#e_query').val();//FIXME ugly hack, somehow the ng-model does not work in this form!!!
		if ($scope.enrichmentQuery != '' || !$scope.isEmpty($scope.activeEntities)) {
			//update the text of the search button
			$scope.fetchButtonText = 'Loading...';

			//reset this as each search implies a new record for logging user search behaviour
			$scope.freshlyAddedEnrichments = [];

			//prepare a list of entities to send to the enrichment service
			var entities = [];
			_.each($scope.activeEntities, function(value, key) {
				entities.push(value);
			});

			//issue the search
			enrichmentService.search($scope.enrichmentQuery, entities, $scope.dimension, $scope.onSearchEnrichments);
		} else {
			alert('Please specify a query');
		}
	};

	$scope.onSearchEnrichments = function(enrichments, queries, requestAborted) {
		//reset the button and the selected entities
		$scope.fetchButtonText = 'Find links';
		$scope.enrichmentsCollapsed = false;
		if(enrichments) {
			//apply the enrichments to the scope
			$scope.$apply(function() {
				$scope.enrichmentsCollapsed = false;
				$scope.nothingFound = false;
				$scope.enrichmentSources = enrichments.enrichmentSources;
				$scope.enrichmentEntitySources = enrichments.enrichmentEntitySources;
				$scope.allEnrichments = enrichments.allEnrichments;
				$scope.enrichmentQueries = queries;
				//when calling filterEnrichmentsBySource() the view is not updated properly, so had to copy the code here...
				$scope.activeEnrichmentSource = $scope.enrichmentSources[0];
				$scope.enrichments = _.filter($scope.allEnrichments, function(e) {
					if(e.source === $scope.activeEnrichmentSource) {
						return e;
				}
		});
			});
		} else if(!requestAborted) {
			alert('No enrichments found');
			$scope.$apply(function() {
				$scope.enrichmentsCollapsed = true;
				$scope.nothingFound = true;
				$scope.enrichments = [];
				$scope.allEnrichments = [];
				$scope.enrichmentQueries = [];
				$scope.enrichmentSources = [];
				$scope.enrichmentEntitySources = [];
				$scope.activeEnrichmentSource = null;
				$scope.activeEnrichmentEntitySource = null;
			});
		}
	}

	$scope.addEnrichment = function(enrichment) {
		//add the active entities so it's clear on what basis the enrichment was found
		var entities = []
		_.each($scope.activeEntities, function(e, i) {
			entities.push(e);
		});
		enrichment.entities = entities;
		$scope.savedEnrichments.push(enrichment);
		$scope.freshlyAddedEnrichments.push(enrichment);//also add it to the logging list
	}

	$scope.removeEnrichment = function(index) {
		var e = $scope.savedEnrichments[index];
		var addIndex = -1;
		console.debug('removing this enrichment:');
		console.debug(e);
		for (var i=0;i<$scope.freshlyAddedEnrichments.length;i++) {
			console.debug($scope.freshlyAddedEnrichments[i].url + ' ' + e.url);
			if($scope.freshlyAddedEnrichments[i].url == e.url) {
				addIndex = i;
				break;
			}
		}
		//(if found) also remove it from the logging list
		if(addIndex != -1) {
			console.debug('removing from freshlyAddedEnrichments')
			$scope.freshlyAddedEnrichments.splice(addIndex, 1);
			console.debug($scope.freshlyAddedEnrichments);
		}
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
			if(e.entities.indexOf(entitySource) != -1) {
				return e;
			}
		});
	}

	//----------------------------SELECTING ENRICHMENTS & ENTITIES------------------------------

	$scope.addQueryEntity = function(entity) {
		if(!$scope.activeEntities[entity.label]) {
			$scope.activeEntities[entity.label] = entity;
		}
		$scope.updateEnrichmentQuery();
	}

	$scope.removeQueryEntity = function(entityLabel) {
		delete $scope.activeEntities[entityLabel];
		$scope.updateEnrichmentQuery();
	}

	$scope.updateEnrichmentQuery = function() {
		var labels = [];
		_.each($scope.activeEntities, function(e){
			labels.push(e.label);
		})
		//$('#e_query').val(labels.join('+'));
	}

	$scope.isEmpty = function(obj) {
		return Object.keys(obj).length === 0;
	}

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {
		if($scope.savedEnrichments) {
			enrichmentService.cancelRequest();
			$modalInstance.close({
				dimension: $scope.dimension,
				savedEnrichments : $scope.savedEnrichments,
				freshlySavedEnrichments : $scope.freshlyAddedEnrichments,
				allEnrichments : $scope.allEnrichments,
				queries : $scope.enrichmentQueries
			});
		} else {
			alert('Please add a label');
		}
	};

	$scope.cancel = function () {
		enrichmentService.cancelRequest();
		$modalInstance.dismiss('cancel');
	};

	//----------------------------UPDATE EVENTS FROM ENTITY EXPANSION------------------------------

	//this function will update the expanded entities when they are shown
	$scope.update = function(chapters) {
		//fetch the expandedentities from the active chapter
		for(c in chapters) {
			console.debug(chapters[c]);
			if(chapters[c].guid == chapterCollection.getActiveChapter().guid) {
				$scope.$apply(function() {
					$scope.expandedEntities = chapters[c].expandedEntities;
				});
				break;
			}
		}
	}

	chapterCollection.addObserver($scope.update);

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

});;angular.module('linkedtv').controller('videoSelectionController',
	function($rootScope, $scope, videoSelectionService, videoCollection) {

	$scope.videos = null;

	$scope.update = function(videos) {
		console.debug('Videos loaded');
		if(videos) {
			$scope.$apply(function(){
				$scope.videos = videos;
			});
		}
	};

	$scope.videosLoaded = function(videos) {
		videoCollection.initCollectionData(videos);
	};

	$scope.setActiveVideo = function(video) {
		window.location.assign('http://' + location.host + '/user/' + $rootScope.provider + '/' + video.id);
	};

	//add the update function as an observer to the videoCollection
	videoCollection.addObserver($scope.update);

});;angular.module('linkedtv').directive('chapterEditor', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/chapterEditor.html'

    };

}]);;angular.module('linkedtv').directive('dimensionTab', [function(){
	
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

});;angular.module('linkedtv').directive('shotSelector',
    ['shotCollection', 'timeUtils', function(shotCollection, timeUtils) {

	return {
    	restrict : 'E',

    	replace : true,

        scope : {
            start : '=',
            end : '=',
            prettyStart : '=prettystart',
            prettyEnd : '=prettyend',
            poster : '=',
            chapter : '@', //true or false
            collapsed : '@', //doesn't work properly yet
            title : '@'
        },

    	link: function ($scope, $element, $attributes) {
            if($scope.chapter == 'true') {
                $scope.shots = shotCollection.getChapterShots();
            } else {
                $scope.shots = shotCollection.getShots() || [];
            }
            $scope.settingStart = true;

            $scope.withinRange = function(shot) {
                //first check if the shot is in the selected shots
                if($scope.start === shot.start) {
                    return 'starting-point';
                }
                if($scope.start === shot.start) {
                    return 'in-range';
                }
                //then check if it's within the range of two selected shots
                if($scope.start != -1) {
                    if (parseInt(shot.start) >= parseInt($scope.start) && parseInt(shot.end) <= parseInt($scope.end)) {
                        return 'in-range';
                    } else {
                        return '';
                    }

                }
                return '';
            }

            $scope.setSelection = function(shot) {
                if($attributes.poster) {
                    $scope.poster = shot.poster;
                }
                if($attributes.start && $attributes.end) {
                    if($scope.settingStart) {
                        $scope.setSelectionStart(shot);
                    } else {
                        $scope.setSelectionEnd(shot);
                    }
                }
            }

            $scope.updatePrettyTimes = function() {
                $scope.prettyStart = timeUtils.toPrettyTime($scope.start);
                $scope.prettyEnd = timeUtils.toPrettyTime($scope.end);
            }

            $scope.setSelectionStart = function(shot) {
                $scope.start = shot.start;
                $scope.end = -1;
                $scope.settingStart = !$scope.settingStart;
                $scope.updatePrettyTimes();
            }

            $scope.setSelectionEnd = function(shot) {
                if(shot.start > $scope.start) {
                    $scope.end = shot.end;
                    $scope.settingStart = !$scope.settingStart;
                    $scope.updatePrettyTimes();
                }
            }
        },

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

}]);;//userful to read:
// - http://jasonmore.net/angular-js-directives-difference-controller-link/
// - http://www.jvandemo.com/the-nitty-gritty-of-compile-and-link-functions-inside-angularjs-directives/

angular.module('linkedtv').directive('vocabularyAutocomplete', function(){

	return {
		restrict : 'E',

		replace : true,

		scope : {
			entity : '=',//the selected entity will be communicated via this variable
			target : '@', //this is the id of the html element that holds the autocomplete widget
			vocabulary : '@' //this is the vocabulary that the user wants to search in
		},

		//templates are actually rendered after the linking function, so it's not possible
		//to refer to the outcome of angular expressions
		templateUrl : '/site_media/js/templates/vocabularyAutocomplete.html',

		controller : function($scope, $element) {
			$scope.DBPEDIA_BUTTON_MAPPINGS = {'who' : 'orange', 'unknown' : 'crimson', 'where' : 'dodgerblue',
				'what' : 'yellow', 'Freebase' : 'pink', 'DBpedia' : 'yellowgreen', 'NERD' : 'yellow'
			};

			$scope.GTAA_BUTTON_MAPPINGS = {'Geografisch' : 'dodgerblue', 'Naam' : 'yellowgreen',
                'Persoon' : 'wheat', 'B&G Onderwerp' : 'grey', 'Onderwerp' : 'orange', 'Maker' : 'wheat',
                'Genre' : 'yellow', '' : 'whitesmoke'};

            //TODO properly style the pull down menu!!
			$scope.RENDER_OPTIONS = {
				ORIGINAL :  $.ui.autocomplete.prototype._renderItem,

				DBPEDIA : function(ul, item) {
					$(ul).css('z-index', '999999'); // needed when displayed within an Angular modal
					var v_arr = item.label.split('\|');
					var l = v_arr[0];
					var t = v_arr[1];
					var c = v_arr[2];
					var te = '<button class="button button-primary">' + t + '</button>';
					var ce = '<button class="button button-primary"';
					ce += ' style="background-color:' + $scope.DBPEDIA_BUTTON_MAPPINGS[c] + ';">' + c + '</button>';
					var row = l + '&nbsp;' + te + '&nbsp;' + ce;
					return $("<li></li>").data("item.autocomplete", item).append("<a>" + row + "</a>").appendTo(ul);
				},

				GTAA : function(ul, item) {
					$(ul).css('z-index', '999999'); // needed when displayed within an Angular modal
					var v_arr = item.label.split('\|');
					var l = v_arr[0]; //prefLabel
					var t = v_arr[1]; //inScheme
					var c = v_arr[2]; //scopeNotes
					console.debug($scope.GTAA_BUTTON_MAPPINGS[t]);
					var te = '<button class="button button-primary" ';
					te += 'style="background-color:' + $scope.GTAA_BUTTON_MAPPINGS[t] + ';">' + t + '</button>';
					var ce = '<button class="button button-primary">' + c + '</button>';
					var row = l + '&nbsp;' + te// + '&nbsp;' + ce;
					return $("<li></li>").data("item.autocomplete", item).append("<a>" + row + "</a>").appendTo(ul);
				}
			};

			$scope.setAutocompleteRendering = function(type) {
				if(type == 'DBpedia') {
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.DBPEDIA;
				} else if(type == 'GTAA') {
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.GTAA;
				}
			};

			$scope.setAutocompleteRendering($scope.vocabulary);

			$element.attr('id', $scope.target); //needed to be able to bind the autocomplete
			if($scope.entity) {
				$element.attr('value', $scope.entity.label);
			}
			$('#' + $scope.target).autocomplete({
				source: '/autocomplete?vocab=' + $scope.vocabulary,
				minLength: 3,
				select: function(event, ui) {
					if(ui.item) {
						var v_arr = ui.item.label.split('\|');
						var l = v_arr[0];
						var t = v_arr[1];
						var c = v_arr[2];
						var vocabURI = ui.item.value;

						//stores the selected DBpedia entry
						$scope.$apply(function() {
							$scope.entity = {label : l, type : t, category : c, uri : vocabURI};
						});
						this.value = '';
						return false;
					}
				}
			});
		}

	}

})