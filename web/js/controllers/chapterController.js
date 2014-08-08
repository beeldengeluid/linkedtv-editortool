angular.module('linkedtv').controller('chapterController', 
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
});