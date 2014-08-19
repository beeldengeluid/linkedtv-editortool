angular.module('linkedtv').controller('chapterController', 
	function($rootScope, $scope, chapterCollection, chapterService, playerService) {
	
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
		playerService.seek(chapter.start);
	};

	$scope.isChapterSelected = function(chapter) {
		if($rootScope.chapter) {
			return $rootScope.chapter.$$hashKey == chapter.$$hashKey ? 'selected' : '';
		}
		return '';
	};

	$scope.editChapter = function(chapter) {

	}

	$scope.createNewChapter = function() {
		
	}

});