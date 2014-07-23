angular.module('linkedtv').controller('chapterController', function($rootScope, $scope, chapterService) {
	
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
});