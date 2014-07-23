var linkedtv = angular.module('linkedtv', []).run(function($rootScope) {
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

}]);;angular.module('linkedtv').controller('chapterController', function($rootScope, $scope, chapterService) {
	
	$scope.resourceUri = $rootScope.resourceUri;
	$scope.chapters = [];
	$scope.activeChapter = null;
	$scope.viewMode = 'horizontal';

	$scope.init = function() {
		//if the resource Uri is in the path, load the chapters
		if($scope.resourceUri) {
			chapterService.getChaptersOfResource($scope.resourceUri, $scope.chaptersLoaded);
		}
	};

	$scope.chaptersLoaded = function(chapters) {
		if(chapters != null) {			
			$scope.$apply(function() {
				$scope.chapters = chapters;
			});
		} else {
			// TODO error
		}
	};

	$scope.init();
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

}]);;angular.module('linkedtv').directive('navigationBar', function() {
	
	return {
		restrict : 'E',

		replace : true,

		scope : {
			user : '@'
		},

		templateUrl : '/site_media/js/templates/navigationBar.html'
	};

});;angular.module('linkedtv').directive('videoSelector', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/videoSelector.html',

    };

}]);