//TODO make sure to have a programme specific config options in a nice way

var config = angular.module('configuration', []).constant('conf', {
	languageMap : {'rbb' : 'de', 'sv' : 'nl'},
	chapterSlotsMap : {'rbb' : 8, 'sv' : 6},
	loadingImage : '/site_media/images/loading.gif'
});	;var linkedtv = angular.module('linkedtv', ['ngRoute', 'ui.bootstrap', 'configuration']);

linkedtv.run(function($rootScope) {
	var urlParts = window.location.pathname.split('/');

	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 2) {
		$rootScope.provider = urlParts[1];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.resourceUri = urlParts[2];
	}
});;angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'timeUtils', 'imageService', 'slotCollection', 'entityCollection', 'enrichmentCollection',
	function(conf, timeUtils, imageService, slotCollection, entityCollection, enrichmentCollection) {
	
	var _chapters = [];
	var _activeChapter = null;

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(resourceUri, provider, resourceData) {
		console.debug('Initializing chapter data');
		var chapters = null;
		if(resourceData.chapters.length == 0) {
			chapters = resourceData.curated.chapters;
		} else {
			chapters = resourceData.chapters;
		}
		//add all the posters to the chapters (FIXME this should be done on the server!!)
		for(var c in chapters) {
			var chapter = chapters[c];
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, resourceUri, timeUtils.toMillis(chapter.start));

			//set the default slots based on the provider conf
			var slots = [];
			for(var i=0;i<conf.chapterSlotsMap[provider];i++) {
				slots.push({'title' : 'Slot ' + (i+1)});
			}
			chapter.slots = slots;
		}
		_chapters = chapters;
	}

	function getChapters() {
		return _chapters;
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
		slotCollection.updateChapterSlots(_activeChapter);
		enrichmentCollection.updateActiveChapter(_activeChapter);

	}

	function getActiveChapter() {
		return _activeChapter;
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter
	}

}]);;angular.module('linkedtv').factory('enrichmentCollection', [function() {

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

}]);;angular.module('linkedtv').factory('entityCollection', [function() {
	
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

 		/*
		$.each(this.entities, function(k, v) {
			var labels = [];
			var daUrls = [];
			for (var e in v) {
				labels.push(v[e].label);
				daUrls.push(v[e].disambiguationURL);
			}
			$scope.popOverContent[k] = labels.join(' ') + '&nbsp;' + daUrls.join(' ');
		});*/	
		//TODO sort the entities
	}

	return {
		initCollectionData : initCollectionData,
		getEntities : getEntities,		
		getChapterEntities : getChapterEntities,
		updateChapterEntities : updateChapterEntities
	}

}]);;angular.module('linkedtv').factory('slotCollection', [function() {
		
	var _slots = [];
	
	function getSlots() {
		return _slots;
	}

	function updateChapterSlots(chapter) {
		_slots = chapter.slots;
	}

	return {
		getSlots : getSlots,
		updateChapterSlots : updateChapterSlots
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
		console.debug('Getting enrichments for: ' + entities.join(' '));
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/enrichments?q=' + entities.join(',') + '&p=' + provider,
			success : function(json) {
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

}]);;angular.module('linkedtv').factory('entityService', ['$rootScope', 'conf', function($rootScope, conf){
	

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

	//this function is currently unused (instead the dataService is used to load all data in one go)
	function getEntitiesOfResource(resourceUri, callback) {
		console.debug('Getting entities of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entities?r=' + resourceUri,
			success : function(json) {
				callback(json.entities);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	//this function is currently unused (instead the dataService is used to load all data in one go)
	function getAllEntitiesOfResource(resourceUri, callback) {
		console.debug('Getting entities of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/allentities?r=' + resourceUri,
			success : function(json) {
				callback(json.entities);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	return {
		getEntitiesOfResource : getEntitiesOfResource,
		getAllEntitiesOfResource : getAllEntitiesOfResource,
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
		
	//wait for the resourceUri to have been extracted from the application URL
	$scope.init = function() {
		//fetch all of this resource's data from the server
		$rootScope.$watch('resourceUri', function(resourceUri) {
			dataService.getResourceData(resourceUri, true, $scope.dataLoaded);
		});
	};

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		if(resourceData != null) {
			console.debug('Loaded data from the server');
			
			//FIXME get rid of the resourceData on the rootscope!!
			$rootScope.resourceData = resourceData;

			
			//load the chapterCollection with chapter data
			chapterCollection.initCollectionData($rootScope.resourceUri, $rootScope.provider, resourceData);

			//load the entityCollection with entity data
			entityCollection.initCollectionData($rootScope.resourceData.nes);

		} else {
			// TODO error
		}
	};	

	$scope.init();
});;angular.module('linkedtv').controller('chapterController', 
	function($rootScope, $scope, chapterCollection, chapterService) {
	
	$scope.resourceUri = $rootScope.resourceUri;
	$scope.chapters = [];

	//watch the chapterCollection to see when it is loaded
	$scope.$watch(function () { return chapterCollection.getChapters(); }, function(newValue) {
		console.debug('loaded the chapters');
		console.debug(newValue);
		$scope.chapters = newValue;
	});

	$scope.setActiveChapter = function(chapter) {		
		chapterCollection.setActiveChapter(chapter);
	};

	$scope.isChapterSelected = function(chapter) {
		if($rootScope.chapter) {
			return $rootScope.chapter.$$hashKey == chapter.$$hashKey ? 'selected' : '';
		}
		return '';
	};

	$scope.init();
});;angular.module('linkedtv').controller('editorPanelController', 
	function($rootScope, $scope, conf, chapterCollection) {
	
	$scope.activeChapter = null;
	//TODO add variable for active slots

	//watch the chapterCollection to see what chapter has been selected
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		if(newValue) {
			$scope.activeChapter = newValue;
		}
	});

	//TODO listen to changes in the slots
	
});;angular.module('linkedtv').controller('enrichmentController', function($rootScope, $scope, conf, enrichmentCollection) {
	
	$scope.allEnrichments = null;
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on

	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter

	$scope.$watch(function () { return enrichmentCollection.getEnrichmentsOfActiveChapter(); }, function(newValue) {		
		console.debug('Updating enrichments');
		if(newValue) {
			$scope.updateEnrichments(newValue);
		}
	});

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
				//if not added already, add the source to the list of possible sources
				if(sources.indexOf(s) == -1) {
					sources.push(s);
				}
				//loop through the eventual enrichments and add them to temp
				var enrichmentsOfSource = entitySources[s];
				for(var e in enrichmentsOfSource){
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
	
});;angular.module('linkedtv').controller('entityController', 
	function($rootScope, $scope, conf, entityCollection, enrichmentCollection, enrichmentService) {
	
	$scope.entities = {};
	$scope.activeEntities = [];
	$scope.popOverContent = {};//contains the HTML for each entity

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		$scope.entities = newValue;
	});
	
	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {		
		if($scope.activeEntities && $scope.activeEntities.length > 0) {
			$('#fetch_enrichments').button('loading');
			enrichmentService.search($scope.activeEntities, $rootScope.provider, $scope.onSearchEnrichments);
		} else {
			alert('Please select a number of entities before triggering the enrichment search');
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		console.debug('got some enrichments, setting them in the enrichment collection');
		$('#fetch_enrichments').button('reset');
		enrichmentCollection.addEnrichmentsToActiveChapter(enrichments, true);
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

});;angular.module('linkedtv').controller('playerController', function($sce, $rootScope, $scope){
	
	$scope.playoutUrl = null;
	$scope.videoPlayer = null;
	//$scope.activeChapter = null;

	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('resourceData', function(resourceData){
		if(resourceData) {			
			$scope.playoutUrl = $sce.trustAsResourceUrl(resourceData.locator);
			$scope.playFragment($scope.playoutUrl, 0);
		}
	});

	$scope.playFragment = function(playoutUrl, start) {
		console.debug('Playing video: ' + playoutUrl);
		$scope.mediaPlaying = false;
		$scope.videoPlayer = document.getElementById('html5player');
		$('#videoSource').attr('src', playoutUrl);
		$scope.videoPlayer.addEventListener('play', $scope.onPlay, false);
		$scope.videoPlayer.addEventListener('pause', $scope.onPause, false);
		$scope.videoPlayer.addEventListener('loadeddata', $scope.onLoadedData, false);
		$scope.videoPlayer.addEventListener('loadstart', $scope.onLoadStart, false);
		$scope.videoPlayer.addEventListener('error', $scope.onError, true);
		$scope.videoPlayer.addEventListener('stalled', $scope.onStalled, false);
		var canPlayMP3 = (typeof $scope.videoPlayer.canPlayType === "function" && $scope.videoPlayer.canPlayType("video/mp4") !== "");
		if (canPlayMP3) {
		    $scope.videoPlayer.pause();
		    $scope.videoPlayer.load();			
		} else {
			alert('Your browser does not support mp3...');
		}
	}

	/*
	$scope.playChapter = function () {		
		this.seek($scope.activeChapter.start);
	};*/
		
	$scope.getPlayerTime = function () {
		var v = document.getElementById("html5player");
		return v.currentTime * 1000;
	};

	$scope.seek = function(millis) {
		$scope.audioPlayer.currentTime = millis / 1000;
	}

	/*----------------PLAYER EVENTS----------------*/

		
	$scope.onLoadStart = function(e) {
		console.debug('loading...');
	}
	
	$scope.onStalled = function(e) {
		console.debug('stalled...');
	}
	
	$scope.onError = function(e) {
		console.debug('An unknown error occurred.');
	}
	
	$scope.onPlay = function(e) {
		$scope.safeApply(function() {
			$scope.mediaPlaying = true;
		});
		console.debug('play');
	}
	
	$scope.onPause = function(e) {
		$scope.safeApply(function() {
			$scope.mediaPlaying = false;
		});
		console.debug('pause');
	}

	/*----------------HELPER FUNCTION----------------*/

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
	
	

});;angular.module('linkedtv').controller('slotsController', function($rootScope, $scope, conf, slotCollection, entityService) {

	$scope.slots = null; //will be filled when chapter data has been loaded
	$scope.activeSlotIndex = 0;

	$scope.$watch(function () { return slotCollection.getSlots(); }, function(newValue) {		
		$scope.slots = newValue;
		$scope.activeSlotIndex = 0;
	});

	$scope.addEntityToSlot = function() {
		if($scope.activeEntities.length > 0) {

			//use the entity label for the slot title
			$scope.slots[$scope.activeSlotIndex].title = $scope.activeEntities[0];

			//set the loading image to the slot
			$scope.slots[$scope.activeSlotIndex].image = conf.loadingImage;

			//find the dbpedia url to fetch info from the entityProxy
			var label = $scope.entities[$scope.activeEntities[0]];
			var uri = null;
			var e = null;
			for (var i in label) {
				e = label[i];
				//only dbpedia uri's are supported
				console.debug(e);
				if (e.disambiguationURL && e.disambiguationURL.indexOf('dbpedia.org') != -1) {
					uri = e.disambiguationURL;
					break;
				}
			}
			console.debug('dbpediaUri: ' + uri);
			entityService.getEntityDBPediaInfo(uri, $scope.entityInfoLoaded);
		}
	}

	$scope.entityInfoLoaded = function(data) {
		console.debug(data);
		for (key in data) {
			if (data[key] && data[key].thumb) {
				$scope.$apply(function() {
					$scope.slots[$scope.activeSlotIndex].image = data[key].thumb[0];
				});
				break;
			} else {
				$scope.slots[$scope.activeSlotIndex].image = null;
			}
		}
		//reset the activeEntities
		$scope.activeEntities = [];
	}

	$scope.setActiveSlotIndex = function(slot) {
		$scope.activeSlotIndex = slot;
	};

	$scope.isSlotSelected = function(slot) {
		return $scope.activeSlotIndex == slot ? 'selected' : '';
	};
	
});;angular.module('linkedtv').controller('videoSelectionController', function($rootScope, $scope, videoSelectionService) {
		
	$scope.provider = $rootScope.provider;
	$scope.videos = [];


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

	$scope.init();
});;angular.module('linkedtv').directive('chapterEditor', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/chapterEditor.html'

    };

}]);;angular.module('linkedtv').directive('entityEditor', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/editorPanel.html',

    };

}]);;angular.module('linkedtv').directive('enrichmentTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/enrichmentTab.html',

    };

}]);;angular.module('linkedtv').directive('entityTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/entityTab.html',

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

});;angular.module('linkedtv').directive('slotsTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/slotsTab.html',

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