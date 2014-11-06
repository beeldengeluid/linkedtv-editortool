angular.module('linkedtv').controller('enrichmentController', 
	function($rootScope, $scope, $modal, conf, chapterCollection, 
		entityCollection, enrichmentService, entityProxyService, enrichmentUtils) {
	
	$scope.enrichmentUtils = enrichmentUtils;	
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		$scope.activeChapter = newValue;
	});

	$scope.editLink = function(dimension, link) {
		if(dimension.service.id != 'informationCards') {
			if(link) {
				enrichmentUtils.openLinkDialog(dimension, link);
			} else {
				enrichmentUtils.openMultipleLinkDialog(dimension);
			}
		} else {
			enrichmentUtils.openCardDialog(dimension, link);
		}
	}

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};
	
	
});