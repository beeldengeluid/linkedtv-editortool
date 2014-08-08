//TODO make sure to have a programme specific config options in a nice way
var config = angular.module('configuration', [])
       .constant('languageMap', {'rbb' : 'de', 'sv' : 'nl'})
       .constant('chapterSlotsMap', {'rbb' : 8, 'sv' : 6});var linkedtv = angular.module('linkedtv', ['ngRoute', 'ui.bootstrap', 'configuration']);

//linkedtv.constant('languageMap', {'rbb' : 'de', 'sv' : 'nl'});

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
});;angular.module('linkedtv').factory('chapterCollection', [function() {
	
	var chapters = [];

	function getChapters() {
		return chapters;
	}

    function setChapters(newChapters) {
		chapters = newChapters;
	}

	function setChapterData(chapterData) {

	}

	return {
		getChapters : getChapters,
		setChapters : setChapters
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

}]);;angular.module('linkedtv').factory('entityService', ['$rootScope', 'languageMap', function($rootScope, languageMap){
	

	function getEntityDBPediaInfo(dbpediaUri, callback) {
		console.debug('Getting entity info for: ' + dbpediaUri);		
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + dbpediaUri + '&lang=' + languageMap[$rootScope.provider],
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
	function($rootScope, $scope, dataService, timeUtils, imageService, chapterCollection, chapterSlotsMap) {
		
	//wait for the resourceUri to have been extracted from the application URL
	$scope.init = function() {
		//fetch all of this resource's data from the server
		$rootScope.$watch('resourceUri', function(resourceUri){
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
			$scope.loadChapterCollection(resourceData);

		} else {
			// TODO error
		}
	};

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)
	$scope.loadChapterCollection = function(resourceData) {
		var chapters = null;
		if(resourceData.chapters.length == 0) {
			chapters = resourceData.curated.chapters;
		} else {
			chapters = resourceData.chapters;
		}
		//add all the posters to the chapters (FIXME this should be done on the server!!)
		for(var c in chapters) {
			var chapter = chapters[c];
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, $rootScope.resourceUri, timeUtils.toMillis(chapter.start));

			//set the default slots based on the provider config
			var slots = [];
			for(var i=0;i<chapterSlotsMap[$rootScope.provider];i++) {
				slots.push({'title' : 'Slot ' + (i+1)});
			}
			chapter.slots = slots;
		}
		chapterCollection.setChapters(chapters);
	}

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
		$rootScope.chapter = chapter;
	};

	$scope.isChapterSelected = function(chapter) {
		if($rootScope.chapter) {
			return $rootScope.chapter.$$hashKey == chapter.$$hashKey ? 'selected' : '';
		}
		return '';
	};

	$scope.init();
});;angular.module('linkedtv').controller('entityController', function($rootScope, $scope, entityService, enrichmentService) {
	
	/*
	TODO NOTES:
		- mogelijk opgehaalde enrichments voor chapters bewaren (omdat het lang duurt om deze op te halen)
		- entityService ook weer gebruiken om via de API entities te laden?
	*/

	$scope.resourceUri = $rootScope.resourceUri;
	$scope.entities = {};
	$scope.activeChapter = $rootScope.chapter;
	$scope.activeSlotIndex = 0;
	$scope.activeEntities = [];
	$scope.popOverContent = {};//contains the HTML for each entity
	$scope.slots = null;

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

		//load the correct entities belonging to the activeChapter FIXME do this in the chapterCollection
		$scope.updateEntities();

		//populate the slots
		$scope.slots = $scope.activeChapter.slots;
	};

	$scope.updateEntities = function() {
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
		//TODO sort the entities
	}

	/*------------Add selected entity to slot-----------------*/

	$scope.addEntityToSlot = function() {
		console.debug('Adding entity to slot');
		if($scope.activeEntities.length > 0) {
			console.debug('Getting entity info');
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
			console.debug('dbpediaUri: ' + uri)
			entityService.getEntityDBPediaInfo(uri, $scope.entityInfoLoaded);
		}
	}

	$scope.entityInfoLoaded = function(data) {		
		console.debug(data);
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