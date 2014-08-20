//TODO properly import the programme configs from an external file

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
});	;var linkedtv = angular.module('linkedtv', ['ngRoute', 'ui.bootstrap', 'configuration']);

linkedtv.run(function($rootScope, conf) {

	var urlParts = window.location.pathname.split('/');	
	
	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 2) {
		$rootScope.provider = urlParts[1];		
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.resourceUri = urlParts[2];
	}

	/*
	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
   });*/
});;angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'timeUtils', 'imageService', 'entityCollection', 'enrichmentCollection',
	function(conf, timeUtils, imageService, entityCollection, enrichmentCollection) {	

	var TYPE_AUTO = 'auto';
	var TYPE_CURATED = 'curated';
	var _chapters = [];
	var _activeChapter = null;
	var observers = [];

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(resourceUri, provider, resourceData) {
		console.debug('Initializing chapter data');
		var chapters = [];
		//FIXME do this on the server: assign auto/curated type to each chapter
		var autoChapters = resourceData.chapters;
		var curatedChapters = resourceData.curated.chapters;
		for(var c in autoChapters) {
			var chapter = autoChapters[c];
			chapter.type = TYPE_AUTO;
			chapters.push(chapter);
		}
		for(var c in curatedChapters) {
			var chapter = curatedChapters[c];
			chapter.type = TYPE_CURATED;
			chapters.push(chapter);
		}

		//convert chapters to client side friendly objects (FIXME should be done on the server!!!)	
		for(var c in chapters) {
			var chapter = chapters[c];

			//add all the posters to the chapters 
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, resourceUri, chapter.start);
			//add a default empty collection to hold information cards (TODO load this later from the server!)
			chapter.cards = [];
			//add a default empty collection for the curated enrichments (TODO load this later from the server!)
			chapter.enrichments = [];
		}
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		setChapters(chapters);
		console.debug(_chapters);
	}

	function addObserver(observer) {
		console.debug(observer);
		observers.push(observer)
	}

	function notifyObservers() {
		for (o in observers) {
			observers[o](_chapters);
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
		enrichmentCollection.updateActiveChapter(_activeChapter);
	}

	function getActiveChapter() {
		return _activeChapter;
	}

	function saveChapter(chapter) {
		console.debug('Saving chapter');
		console.debug(chapter);
		_activeChapter = chapter;
		for(c in _chapters) {
			if(_chapters[c].$$hashKey == _activeChapter.$$hashKey) {
				_chapters[c] = _activeChapter;
			}
		}
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setChapters : setChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		saveChapter : saveChapter,
		addObserver : addObserver
	}

}]);;//todo this should be adapted so it represents the automatically generated enrichments only

angular.module('linkedtv').factory('enrichmentCollection', [function() {

	var _activeChapter = null;
	var _enrichments = {}; //contains all enrichments of all chapters

	function updateActiveChapter(chapter) {
		_activeChapter = chapter;
	}

	function getEnrichments() {
		return _enrichments;
	}

	function addEnrichmentsToActiveChapter(enrichments, replace) {
		if(replace && _activeChapter) {
			_enrichments[_activeChapter.$$hashKey] = enrichments;
		}
	}

	function getEnrichmentsOfActiveChapter() {
		if(_activeChapter && _enrichments[_activeChapter.$$hashKey]) {
			return _enrichments[_activeChapter.$$hashKey];
		}
		return null;
	}

	return {
		updateActiveChapter : updateActiveChapter,
		getEnrichmentsOfActiveChapter : getEnrichmentsOfActiveChapter,
		getEnrichments : getEnrichments,
		addEnrichmentsToActiveChapter : addEnrichmentsToActiveChapter
	}

}]);;angular.module('linkedtv').factory('entityCollection', ['timeUtils', function(timeUtils) {
	
	var _entities = [];
	var _chapterEntities = [];

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
			_chapterEntities = _.groupBy(entities, function(e) {
				return e.label;
			});
			//TODO sort the entities
		}
	}

	return {
		initCollectionData : initCollectionData,
		getEntities : getEntities,		
		getChapterEntities : getChapterEntities,
		updateChapterEntities : updateChapterEntities
	}

}]);;angular.module('linkedtv').factory('chapterService', [function(){
	
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

}]);;angular.module('linkedtv').factory('dataService', [function(){
	
	function getResourceData(resourceUri, loadData, callback) {
		console.debug('Getting combined data of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/resource?id=' + resourceUri + '&ld=' + (loadData ? 'true' : 'false'),
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

	return {
		getResourceData : getResourceData
	}

}]);;angular.module('linkedtv').factory('enrichmentService', [function(){
	
	function search(entities, provider, callback) {
		console.debug('Getting enrichments for: ' + entities.join(' ') + '['+provider+']');
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/enrichments?q=' + entities.join(',') + '&p=' + provider,
			success : function(json) {				
				console.debug(json);
				callback(JSON.parse(json.enrichments));
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}	

	return {
		search : search
	}

}]);;angular.module('linkedtv').factory('entityProxyService', ['$rootScope', 'conf', function($rootScope, conf){
	

	function getEntityDBPediaInfo(dbpediaUri, callback) {
		console.debug('Getting entity info for: ' + dbpediaUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + dbpediaUri + '&lang=' + conf.languageMap[$rootScope.provider],
			success : function(json) {				
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}


	return {
		getEntityDBPediaInfo : getEntityDBPediaInfo
	}

}]);;angular.module('linkedtv').factory('imageService', [function(){
	
	function getThumbnail(thumbBaseUrl, resourceUri, millis) {
		if (!thumbBaseUrl) {
			return '/image?ms=' + millis + '&id=' + resourceUri;
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

}]);;angular.module('linkedtv').controller('appController',
	function($rootScope, $scope, conf, dataService, chapterCollection, entityCollection) {	
	
	//fetch all of this resource's data from the server
	$rootScope.$watch('resourceUri', function(resourceUri) {
		dataService.getResourceData(resourceUri, true, $scope.dataLoaded);
	});	

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		if(resourceData != null) {
			console.debug('Loaded data from the server!');
			
			//FIXME get rid of the resourceData on the rootscope!!
			$rootScope.resourceData = resourceData;
						
			//load the chapterCollection with chapter data
			chapterCollection.initCollectionData($rootScope.resourceUri, $rootScope.provider, resourceData);

			//load the entityCollection with entity data
			entityCollection.initCollectionData($rootScope.resourceData.nes);

			//TODO load other stuff (slotCollection & enrichmentCollection)

		} else {
			// TODO error
		}
	};

});;angular.module('linkedtv').controller('chapterController', 
	function($rootScope, $scope, $modal, chapterCollection, chapterService, playerService) {
	
	$scope.resourceUri = $rootScope.resourceUri;	
	$scope.chapters = [];	

	//watch the chapterCollection to see when it is loaded
	/*
	$scope.$watch(function () { return chapterCollection.getChapters(); }, function(newValue) {
		console.debug('loaded the chapters');
		console.debug(newValue);
		$scope.chapters = newValue;
	});*/

	$scope.update = function(chapters) {
		$scope.$apply(function() {			
			$scope.chapters = chapters;
			console.debug($scope.chapters);
		});
	}

	$scope.setActiveChapter = function(chapter) {
		chapterCollection.setActiveChapter(chapter);
		playerService.seek(chapter.start);
	};

	$scope.isChapterSelected = function(chapter) {
		if($rootScope.chapter) {
			return $rootScope.chapter.$$hashKey == chapter.$$hashKey ? 'selected' : '';
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
			console.debug('I saved a damn chapter yeah!');
			console.debug(chapter);

			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter(chapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	//add the update function as an observer to the chapterCollection
	chapterCollection.addObserver($scope.update);

});;angular.module('linkedtv').controller('chapterModalController', 
	['$scope', '$modalInstance', 'entityProxyService', 'chapter',
	function ($scope, $modalInstance, chapterCollection, chapter) {
	
	$scope.chapter = chapter || {};

	$scope.ok = function () {
		if($scope.chapter.label) {
			$modalInstance.close($scope.chapter);
		} else {
			alert('Please add a title');
		}
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
		entityCollection, enrichmentCollection, enrichmentService, entityProxyService) {
	

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		console.debug('the active chapter has changed: ');
		console.debug(newValue);
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

	$scope.createNewLink = function() {
		$scope.openLinkDialog(null);
	}

	$scope.editLink = function() {
		$scope.openLinkDialog($scope.activeChapter.enrichments[$scope.activeLinkIndex]);
	}

	$scope.openLinkDialog = function() {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/enrichmentModal.html',
			controller: 'enrichmentModalController',
			size: 'lg',
			resolve: {
				entities: function () {
					return $scope.entities;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (card) {
			console.debug('I saved a damn card yeah!');
			console.debug(card);
			if($scope.activeChapter.cards[$scope.activeLinkIndex]) {
				$scope.activeChapter.cards[$scope.activeLinkIndex] = card;
			} else {
				$scope.activeChapter.cards.push(card);
			}
			console.debug($scope.activeChapter);

			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter($scope.activeChapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};
	
	
});;angular.module('linkedtv').controller('enrichmentModalController', 
	['$scope', '$modalInstance', '$rootScope', 'entityProxyService', 'enrichmentCollection', 'enrichmentService', 'entities',
	function ($scope, $modalInstance, $rootScope, entityProxyService, enrichmentCollection, enrichmentService, entities) {
	
	$scope.entities = entities;	

	$scope.activeEntities = [];//selected entities
	$scope.enrichments = [];//fetched & filtered enrichment

	$scope.allEnrichments = null;
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on

	$scope.selectedEnrichments = [] //this is eventually going to be filled and returned to the dimensionTab

	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter

	
	$scope.$watch(function () { return enrichmentCollection.getEnrichmentsOfActiveChapter(); }, function(newValue) {		
		console.debug('Updating enrichments');
		if(newValue) {
			$scope.updateEnrichments(newValue);
		}
	});


	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {
		if($scope.activeEntities && $scope.activeEntities.length > 0) {
			//$('#fetch_enrichments').button('loading');
			enrichmentService.search($scope.activeEntities, $rootScope.provider, $scope.onSearchEnrichments);
		} else {
			alert('Please select a number of entities before triggering the enrichment search');
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		//reset the button and the selected entities
		//$('#fetch_enrichments').button('reset');
		$scope.activeEntities = [];
		console.debug(enrichments);
		//add the enrichments to the enrichmentCollection
		enrichmentCollection.addEnrichmentsToActiveChapter(enrichments, true);
	}

	/*this part is only relevant for the tvenrichment service*/

	//TODO make sure this function is called by listening to the enrichmentCollection!
	$scope.updateEnrichments = function(enrichments) {
		console.debug(enrichments);
		var temp = [];//will contain enrichments
		var sources = [];
		var eSources = [];
		for (var es in enrichments) {
			//if not added already, add the entity source to the list of possible sources
			if(eSources.indexOf(es) == -1) {
				eSources.push(es);
			}
			var entitySources = enrichments[es];
			for (var s in entitySources) {
				var enrichmentsOfSource = entitySources[s];
				//if not added already, add the source to the list of possible sources
				if(sources.indexOf(s) == -1 && enrichmentsOfSource.length > 0) {
					sources.push(s);
				}
				//loop through the eventual enrichments and add them to temp				
				for(var e in enrichmentsOfSource) {
					var enrichment = enrichmentsOfSource[e];
					//add the source to each enrichment (for filtering)
					enrichment.source = s;
					//add the source entities to each enrichment (for filtering)
					enrichment.entitySource = es;

					temp.push(enrichment);
				}
			}
		}
		//apply the enrichments to the scope
		
		$scope.enrichmentSources = sources;
		$scope.enrichmentEntitySources = eSources;
		$scope.allEnrichments = temp;
		
		console.debug($scope.enrichmentEntitySources)

		//by default filter by the first source in the list
		$scope.filterEnrichmentsBySource(sources[0]);
	};

	$scope.ok = function () {			
		if($scope.selectedEnrichments) {				
			$modalInstance.close($scope.selectedEnrichments);
		} else {
			alert('Please add a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};	


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

	$scope.getPosterUrl = function(enrichment) {
		if(enrichment.posterUrl && $scope.isValidPosterFormat(enrichment.posterUrl)) {
			return enrichment.posterUrl;
		} else if(enrichment.mediaUrl && $scope.isValidPosterFormat(enrichment.mediaUrl)) {
			return enrichment.mediaUrl;
		}
		return null;
	}

	$scope.isValidPosterFormat = function(img) {
		if(img == null) {
			return false;
		}
		var formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'gif', 'GIF', 'JPEG', 'bmp', 'BMP']
		for(i in formats) {
			if(img.indexOf(formats[i]) != -1) {
				return true;
			}
		}
		return false;
	}


	//----------------------this should be COPIED TO ANOTHER FILE-----------------


	$scope.toggleEntity = function(entityLabel) {
		var index = $scope.activeEntities.indexOf(entityLabel);
		if(index == -1) {
			$scope.activeEntities.push(entityLabel);
		} else {
			$scope.activeEntities.splice(index, 1);
		}
	}

	$scope.isEntitySelected = function(entityLabel) {
		return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
	}

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


	$scope.fetchExtraInfoForEntityLabel = function(entitiesOfLabel) {
		var entityUri = null;
		for(k in entitiesOfLabel) {
			var e = entitiesOfLabel[k];
			entityUri = e.disambiguationURL;
			if(entityUri) {
				break;
			}
		}
		$scope.fetchExtraInfo(entityUri);
	}

	$scope.fetchExtraInfo = function(entityUri) {
		if(entityUri) {				
			entityProxyService.getEntityDBPediaInfo(entityUri, $scope.fetchedTriplesLoaded);
			$scope.loading = true;
		}
	}

	$scope.fetchedTriplesLoaded = function(data) {			
		$scope.fetchedTriples = [];
		var info = [];
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
					if(key !== $scope.POSTER) {
						info.push({index : 0, key : k, values : values, uris : uris});
					}
				}
			}
		}
		info.sort();
		$scope.$apply(function() {
			$scope.loading = false;
			$scope.thumbIndex = 0;
			$scope.thumbs = $scope.getThumbsFromTriples(info);
			$scope.fetchedTriples = info;
		})
	}

	$scope.getThumbsFromTriples = function(triples) {
		for(var i=0;i<triples.length;i++) {
			if(triples[i].key == $scope.POSTER) {
				return triples[i].values;
			}
		}
		return null;
	}
	
}]);;angular.module('linkedtv').controller('entityController', 
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
	['$scope', '$modalInstance', 'entityProxyService', 'card', 'entities',
	function ($scope, $modalInstance, entityProxyService, card, entities) {

	$scope.entityProxyService = entityProxyService;
	$scope.card = card || {};
	$scope.entities = entities;

	$scope.POSTER = 'thumb';
	$scope.thumbs = null;
	$scope.thumbIndex = 0;

	$scope.fetchedTriples = null;

	$scope.autocompleteId = 'autocomplete_1';
	$scope.foundEntity = {};

	//state variables
	$scope.loading = false;

	$scope.initializeCard = function(card) {

	}

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
		if($scope.card.triples) {
			$scope.card.triples.push(t);
		} else {
			$scope.card.triples = [t];
		}			
	}

	$scope.removeFromCard = function(index) {
		if($scope.card.triples[index].key === 'label') {
			$scope.card.label = null;
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
	}

	$scope.nextThumb = function() {
		if($scope.thumbIndex + 1 < $scope.thumbs.length) {
			$scope.thumbIndex++;
		} else {
			$scope.thumbIndex = 0;
		}
	}

	$scope.getThumbsFromTriples = function(triples) {
		for(var i=0;i<triples.length;i++) {
			if(triples[i].key == $scope.POSTER) {
				return triples[i].values;
			}
		}
		return null;
	}

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

	$scope.fetchExtraInfoForEntityLabel = function(entitiesOfLabel) {
		var entityUri = null;
		for(k in entitiesOfLabel) {
			var e = entitiesOfLabel[k];
			entityUri = e.disambiguationURL;
			if(entityUri) {
				break;
			}
		}
		$scope.fetchExtraInfo(entityUri);
	}

	$scope.fetchExtraInfo = function(entityUri) {
		if(entityUri) {				
			entityProxyService.getEntityDBPediaInfo(entityUri, $scope.fetchedTriplesLoaded);
			$scope.loading = true;
		}
	}

	$scope.fetchedTriplesLoaded = function(data) {			
		$scope.fetchedTriples = [];
		var info = [];
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
					if(key !== $scope.POSTER) {
						info.push({index : 0, key : k, values : values, uris : uris});
					}
				}
			}
		}
		info.sort();
		$scope.$apply(function() {
			$scope.loading = false;
			$scope.thumbIndex = 0;
			$scope.thumbs = $scope.getThumbsFromTriples(info);
			$scope.fetchedTriples = info;
		})
	}

	$scope.isReserved = function(key) {
		return key === $scope.POSTER;
	}

	//really ugly, but necessary for now...
	$scope.updateCardProperties = function() {
		for(t in $scope.card.triples) {
			$scope.card[$scope.card.triples[t].key] = $scope.card.triples[t].value;
		}
	}

	$scope.ok = function () {
		$scope.updateCardProperties();
		if($scope.card.label) {				
			$modalInstance.close($scope.card);
		} else {
			alert('Please add a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};		
	
}]);;angular.module('linkedtv').controller('informationCardsController', 
	function($rootScope, $scope, $modal, conf, entityProxyService, entityCollection, chapterCollection) {

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeCardIndex = 0;


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		console.debug('the active chapter has changed: ');
		console.debug(newValue);
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

	$scope.createNewCard = function() {
		$scope.openCardDialog(null);
	}

	$scope.editCard = function() {
		$scope.openCardDialog($scope.activeChapter.cards[$scope.activeCardIndex]);
	}

	//TODO make sure the modal is removed after closing
	$scope.openCardDialog = function(card) {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/informationCardModal.html',
			controller: 'informationCardModalController',
			size: 'lg',
			resolve: {				
				card : function () {
					return card;
				},
				entities: function () {
					return $scope.entities;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (card) {
			console.debug('I saved a damn card yeah!');
			console.debug(card);
			if($scope.activeChapter.cards[$scope.activeCardIndex]) {
				$scope.activeChapter.cards[$scope.activeCardIndex] = card;
			} else {
				$scope.activeChapter.cards.push(card);
			}
			console.debug($scope.activeChapter);

			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter($scope.activeChapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	$scope.setActiveCard = function(index) {
		$scope.activeCardIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeCardIndex == index ? 'selected' : '';
	};
	
});;angular.module('linkedtv').controller('playerController', function($sce, $rootScope, $scope, playerService){
	
	$scope.canPlayVideo = false;
	
	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('resourceData', function(resourceData){
		if(resourceData) {			
			var playoutUrl = $sce.trustAsResourceUrl(resourceData.locator);			
			$scope.canPlayVideo = playerService.playFragment(playoutUrl, 0);
		}
	});

});;angular.module('linkedtv').controller('videoSelectionController', function($rootScope, $scope, videoSelectionService) {
		
	$scope.provider = $rootScope.provider;
	$scope.videos = [];

	//TODO remove this stupid function
	$scope.init = function() {
		videoSelectionService.getVideosOfProvider($scope.provider, $scope.videosLoaded);
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

	//$scope.init();
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
				console.debug($element);
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

});;angular.module('linkedtv').directive('videoPlayer', [function(){
	
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