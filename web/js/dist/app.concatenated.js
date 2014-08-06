var linkedtv = angular.module('linkedtv', ['ngRoute', 'ui.bootstrap']).run(function($rootScope) {
	var urlParts = window.location.pathname.split('/');

	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 2) {
		$rootScope.provider = urlParts[1];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.resourceUri = urlParts[2];
	}
});;angular.module('linkedtv').factory('chapterService', [function(){
	
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

}]);;angular.module('linkedtv').factory('entityService', [function(){
	
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
		getEntitiesOfResource : getEntitiesOfResource
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

}]);;angular.module('linkedtv').controller('appController', function($rootScope, $scope, dataService) {
		

	$scope.init = function() {
		$rootScope.$watch('resourceUri', function(resourceUri){
			dataService.getResourceData(resourceUri, true, $scope.dataLoaded);
		});
	};

	$scope.dataLoaded = function(resourceData) {
		if(resourceData != null) {
			console.debug('Adding fetched data to rootScope');
			$rootScope.$apply(function(){
				$rootScope.resourceData = resourceData;
			});
		} else {
			// TODO error
		}
	};

	$scope.init();
});;angular.module('linkedtv').controller('chapterController', function($rootScope, $scope, chapterService) {
	
	$scope.resourceUri = $rootScope.resourceUri;
	$scope.chapters = [];
	$scope.activeChapterId = null;

	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('resourceData', function(resourceData){
		if(resourceData) {
			if(resourceData.chapters.length == 0) {
				$scope.chapters = resourceData.curated.chapters;
			} else {
				$scope.chapters = resourceData.chapters;
			}
		}
	});

	$scope.setActiveChapter = function(chapter) {
		console.debug(chapter);
		$rootScope.chapter = chapter;
		$scope.activeChapterId = chapter.$$hashKey;
	};

	$scope.isChapterSelected = function(chapterId) {
		return $scope.activeChapterId == chapterId ? 'selected' : '';
	};

	$scope.init();
});;angular.module('linkedtv').controller('entityController', function($rootScope, $scope, entityService, enrichmentService) {
	
	/*
	TODO NOTES:
		- mogelijk opgehaalde enrichments voor chapters bewaren (omdat het lang duurt om deze op te halen)
	*/

	$scope.resourceUri = $rootScope.resourceUri;
	$scope.activeChapter = $rootScope.chapter;
	$scope.activeSlotIndex = 0;
	$scope.activeEntities = [];
	$scope.popOverContent = {};//contains the HTML for each entity
	$scope.slots = ['Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5'];	

	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('chapter', function(chapter) {
		if(chapter) {
			$scope.setActiveChapter(chapter);
		}
	});

	/*------------Load everything according to the selected chapter-----------------*/

	$scope.setActiveChapter = function(chapter) {
		$scope.activeChapter = chapter;		
		$scope.activeSlotIndex = 0;
		$scope.activeEntities = [];

		//first filter all the entities to be only of the selected chapter
		var entities = _.filter($rootScope.resourceData.nes, function(item) {
			if(item.start >= $scope.activeChapter.start && item.end <=  $scope.activeChapter.end) {				
				return item;
			}
		});

		//group all the entities by label
		$scope.entities = _.groupBy(entities, function(e) {
			return e.label;
		});
 	
		$.each($scope.entities, function(k, v) {
			var labels = [];
			var daUrls = [];
			for (var e in v) {
				labels.push(v[e].label);
				daUrls.push(v[e].disambiguationURL);
			}
			$scope.popOverContent[k] = labels.join(' ') + '&nbsp;' + daUrls.join(' ');
		});

		console.debug($scope.popOverContent);
		//TODO sort the entities

		console.debug($scope.entities);
	};

	/*------------Add selected entity to slot-----------------*/

	$scope.addEntityToSlot = function() {

	}

	/*------------Search for Enrichments-----------------*/

	$scope.searchEnrichments = function() {
		if($scope.activeEntities && $scope.activeEntities.length > 0) {
			enrichmentService.search($scope.activeEntities, $rootScope.provider, $scope.onSearchEnrichments);
		} else {
			alert('Please select a number of entities before triggering the enrichment search');
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		console.debug(enrichments);
		for (var es in enrichments) {
			var entitySources = enrichments[es];
			console.debug(es);
			console.debug(entitySources);
			for (var s in entitySources) {
				console.debug(s);
				var enrichmentsOfSource = entitySources[s];
				for(var e in enrichmentsOfSource){
					var enrichment = enrichmentsOfSource[e];
					console.debug(enrichment);
				}
			}
		}

		/*
		mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Steltman.JPG"
		micropost: Object
		micropostUrl: "https://commons.wikimedia.org/wiki/File:Steltman.JPG"
		posterUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Steltman.JPG/500px-Steltman.JPG"
		publicationDate: "2010-10-01T16:05:29Z"
		socialInteractions: Object
		timestamp: "1285949129000"
		type: "photo"
		userProfileUrl: "https://commons.wikimedia.org/wiki/User:Pvt pauline"
		*/
	};

	/*------------Selecting slots-----------------*/

	$scope.setActiveSlotIndex = function(slot) {		
		$scope.activeSlotIndex = slot;
		console.debug($scope.activeSlotIndex);
	};

	$scope.isSlotSelected = function(slot) {
		return $scope.activeSlotIndex == slot ? 'selected' : '';
	};

	/*------------Selecting entities-----------------*/

	$scope.toggleEntity = function(entityLabel) {
		if($scope.activeEntities.indexOf(entityLabel) == -1) {
			$scope.activeEntities.push(entityLabel);
		} else {
			$scope.activeEntities.splice($scope.activeEntities.indexOf(entityLabel),1);
		}
		console.debug($scope.activeEntities);
	};

	$scope.isEntitySelected = function(entityLabel) {
		return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
	};


	/*------------Confidence of entities-----------------*/

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

        templateUrl : '/site_media/js/templates/entityEditor.html',

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