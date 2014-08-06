angular.module('linkedtv').controller('chapterController', function($rootScope, $scope, chapterService) {
	
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
});