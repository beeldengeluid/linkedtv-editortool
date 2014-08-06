angular.module('linkedtv').controller('chapterController', function($rootScope, $scope, timeUtils, imageService, chapterService) {
	
	$scope.resourceUri = $rootScope.resourceUri;
	$scope.chapters = [];
	$scope.activeChapterId = null;

	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('resourceData', function(resourceData){
		if(resourceData) {
			var chapters = [];
			if(resourceData.chapters.length == 0) {
				chapters = resourceData.curated.chapters;
			} else {
				chapters = resourceData.chapters;
			}
			//add all the posters to the chapters (FIXME this should be done on the server!!)
			for(var c in chapters) {
				var chapter = chapters[c];				
				chapter.poster = imageService.getThumbnail($rootScope.resourceData.thumbBaseUrl, $rootScope.resourceUri, timeUtils.toMillis(chapter.start));
			}
			$scope.chapters = chapters;
		}
	});

	$scope.setActiveChapter = function(chapter) {
		$rootScope.chapter = chapter;
		$scope.activeChapterId = chapter.$$hashKey;
	};

	$scope.isChapterSelected = function(chapterId) {
		return $scope.activeChapterId == chapterId ? 'selected' : '';
	};



	$scope.init();
});